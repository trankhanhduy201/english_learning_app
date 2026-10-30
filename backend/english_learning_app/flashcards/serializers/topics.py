from django.contrib.auth import get_user_model
from django.db import models, transaction
from drf_extra_fields.fields import Base64ImageField
from rest_framework.serializers import SerializerMethodField, Serializer, IntegerField, CharField, ListSerializer

from flashcards.models import Topic, TopicMember
from shared.decorators.handle_exceptions import handle_exceptions
from shared.serializers.bases import BaseSerializer, CustomPrimaryKeyRelatedField
from shared.serializers.images import UploadImageSerializer
from flashcards.serializers.topic_members import RetrieveListTopicMembersSerializer

User = get_user_model()


class CurrentTopicMemberResolverMixin:
    current_topic_member_map_context_key = 'current_topic_members_by_topic_id'

    def _get_request_user(self):
        request = self.context.get('request', None)
        if request is None or request.user.is_anonymous:
            return None
        return request.user

    def _resolve_current_topic_member(self, topic, user):
        prefetched_topic_members = getattr(
            topic,
            '_prefetched_objects_cache',
            {},
        ).get('topic_members', None)
        if prefetched_topic_members is not None:
            return next(
                (
                    topic_member
                    for topic_member in prefetched_topic_members
                    if topic_member.member_id == user.id
                ),
                None,
            )

        return topic.topic_members.filter(member=user).first()

    def _prepare_current_topic_members(self, topics):
        user = self._get_request_user()
        if user is None:
            return {}

        current_topic_members = {}
        for topic in topics:
            topic_member = self._resolve_current_topic_member(topic, user)
            if topic_member is not None:
                current_topic_members[topic.id] = topic_member
        return current_topic_members


class AuthorSerializer(BaseSerializer):
    full_name = CharField(source="get_full_name", read_only=True)
    avatar = CharField(source="profile.avatar", read_only=True)

    class Meta(BaseSerializer.Meta):
        model = User
        fields = [
            'id', 
            'username', 
            'first_name', 
            'last_name', 
            'email',
            'full_name',
            'avatar'
        ]


class CurrentTopicMemberSerializer(Serializer):
    is_owner = SerializerMethodField()
    is_accepted = SerializerMethodField()
    is_subcribing = SerializerMethodField()
    is_blocking = SerializerMethodField()

    def get_topic(self):
        return self.context.get('topic', None)

    def get_is_owner(self, instance):
        request = self.context.get('request', None)
        topic = self.get_topic()
        if request is None or topic is None:
            return False
        return request.user == topic.created_by

    def get_is_accepted(self, instance):
        if self.get_is_owner(instance):
            return False

        if not instance:
            return False

        pending_status = [
            TopicMember.TopicMemberStatusEnums.PENDING,
            TopicMember.TopicMemberStatusEnums.LEAVING,
            TopicMember.TopicMemberStatusEnums.BLOCK,
        ]
        return instance.status not in pending_status

    def get_is_subcribing(self, instance):
        if self.get_is_owner(instance):
            return False

        if not instance:
            return False

        return instance.status != TopicMember.TopicMemberStatusEnums.LEAVING

    def get_is_blocking(self, instance):
        if self.get_is_owner(instance):
            return False

        if not instance:
            return False

        blocking_status = [TopicMember.TopicMemberStatusEnums.BLOCK]
        return instance.status in blocking_status


class RetrieveTopicListSerializer(CurrentTopicMemberResolverMixin, ListSerializer):
    def to_representation(self, data):
        iterable = (
            data.all()
            if isinstance(data, models.manager.BaseManager)
            else data
        )
        topic_instances = list(iterable)

        current_topic_members = self._prepare_current_topic_members(
            topic_instances
        )
        self.child.context[
            self.current_topic_member_map_context_key
        ] = current_topic_members
        return super().to_representation(topic_instances)


class RetrieveTopicSerializer(CurrentTopicMemberResolverMixin, BaseSerializer):
    # For read-only and invoke get_upload_image to return serialized image data
    image_info = SerializerMethodField()
    member_count = IntegerField(read_only=True)
    vocab_count = IntegerField(read_only=True)
    members = SerializerMethodField()
    current_member = SerializerMethodField()
    created_by = AuthorSerializer(read_only=True)

    class Meta(BaseSerializer.Meta):
        model = Topic
        fields = [
            'id',
            'name',
            'learning_language',
            'status',
            'descriptions',
            'image_info',
            'created_by',
            'members',
            'current_member',
            'member_count',
            'vocab_count',
        ]
        list_serializer_class = RetrieveTopicListSerializer

    @handle_exceptions(
        reraise=False, 
        default_return=None, 
        log_error=True
    )
    def get_image_info(self, instance):
        if instance.image_path:
            return UploadImageSerializer(instance=instance.image_path).data
        return None

    def get_members(self, instance):
        return RetrieveListTopicMembersSerializer(
            instance=instance.topic_members.all()[:15], many=True
        ).data

    def _get_current_topic_member(self, instance):
        current_topic_members = self.context.get(
            self.current_topic_member_map_context_key,
            None,
        )
        if isinstance(current_topic_members, dict):
            return current_topic_members.get(instance.id, None)

        user = self._get_request_user()
        if user is None:
            return None

        return self._resolve_current_topic_member(instance, user)

    def get_current_member(self, instance):
        current_topic_member = self._get_current_topic_member(instance)
        serializer_context = {
            **self.context,
            'topic': instance,
        }
        return CurrentTopicMemberSerializer(
            instance=current_topic_member,
            read_only=True,
            context=serializer_context,
        ).data


class TrendingTopicSerializer(BaseSerializer):
    image_info = SerializerMethodField()
    created_by = AuthorSerializer(read_only=True)
    member_count = IntegerField(read_only=True)
    vocab_count = IntegerField(read_only=True)

    class Meta(BaseSerializer.Meta):
        model = Topic
        fields = [
            'id',
            'name',
            'descriptions',
            'status',
            'image_info',
            'created_by',
            'member_count',
            'vocab_count',
        ]

    @handle_exceptions(
        reraise=False,
        default_return=None,
        log_error=True
    )
    def get_image_info(self, instance):
        if instance.image_path:
            return UploadImageSerializer(instance=instance.image_path).data
        return None


class CreateTopicSerializer(BaseSerializer):
    upload_image = Base64ImageField(
        source='image_path',
        write_only=True,
        required=False,
        allow_null=True,
    )

    class Meta(BaseSerializer.Meta):
        model = Topic
        fields = [
            'id',
            'name',
            'learning_language',
            'status',
            'descriptions',
            'upload_image',
        ]


class UpdateTopicSerializer(BaseSerializer):
    upload_image = Base64ImageField(
        source='image_path',
        write_only=True,
        required=False,
        allow_null=True,
    )
    updated_members = CustomPrimaryKeyRelatedField(
        source='members',
        many=True,
        queryset=User.objects.all(),
        allow_null=True,
        required=False,
        write_only=True,
    )

    class Meta(BaseSerializer.Meta):
        model = Topic
        fields = [
            'id',
            'name',
            'learning_language',
            'status',
            'descriptions',
            'upload_image',
            'updated_members',
        ]

    @transaction.atomic
    def update(self, instance, validated_data):
        updated_members = validated_data.pop('updated_members', None)
        if updated_members:
            instance.members.set(updated_members)

        if (
            'image_path' in validated_data
            and validated_data['image_path'] is None
        ):
            instance.image_path.delete(save=False)
        return super().update(instance, validated_data)