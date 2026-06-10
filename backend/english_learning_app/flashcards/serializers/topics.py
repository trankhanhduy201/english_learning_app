from django.contrib.auth import get_user_model
from django.db import transaction
from drf_extra_fields.fields import Base64ImageField
from rest_framework.serializers import SerializerMethodField, Serializer, IntegerField

from flashcards.models import Topic, TopicMember
from shared.decorators.handle_exceptions import handle_exceptions
from shared.serializers.bases import BaseSerializer, CustomPrimaryKeyRelatedField
from shared.serializers.images import UploadImageSerializer
from flashcards.serializers.topic_members import RetrieveListTopicMembersSerializer

User = get_user_model()


class AuthorSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = User
        fields = [
            'id', 
            'username', 
            'first_name', 
            'last_name', 
            'email'
        ]


class CurrentTopicMemberSerializer(Serializer):
    is_owner = SerializerMethodField()
    is_accepted = SerializerMethodField()
    is_subcribing = SerializerMethodField()
    is_blocking = SerializerMethodField()

    def get_is_owner(self, instance):
        user = self.context.get('request').user
        return user == instance.created_by

    def _get_current_topic_member(self, instance):
        user = self.context.get('request').user
        if not hasattr(self, '_current_topic_member'):
            self._current_topic_member = next(
                (
                    topic_member
                    for topic_member in instance.topic_members.all()
                    if topic_member.member.id == user.id
                    and topic_member.topic.id == instance.id
                ),
                None,
            )
        return self._current_topic_member

    def get_is_accepted(self, instance):
        if self.get_is_owner(instance):
            return False

        current_topic_member = self._get_current_topic_member(instance)
        if not current_topic_member:
            return False

        pending_status = [
            TopicMember.TopicMemberStatusEnums.PENDING,
            TopicMember.TopicMemberStatusEnums.BLOCK,
        ]
        return current_topic_member.status not in pending_status
    
    def get_is_subcribing(self, instance):
        if self.get_is_owner(instance):
            return False

        current_topic_member = self._get_current_topic_member(instance)
        if not current_topic_member:
            return False

        return True
    
    def get_is_blocking(self, instance):
        if self.get_is_owner(instance):
            return False

        current_topic_member = self._get_current_topic_member(instance)
        if not current_topic_member:
            return False

        blocking_status = [TopicMember.TopicMemberStatusEnums.BLOCK]
        return current_topic_member.status in blocking_status


class RetrieveTopicSerializer(BaseSerializer):
    # For read-only and invoke get_upload_image to return serialized image data
    image_info = SerializerMethodField()
    member_count = IntegerField(read_only=True)
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

    def get_members(self, instance):
        return RetrieveListTopicMembersSerializer(
            instance=instance.topic_members.all()[:15], many=True
        ).data

    def get_current_member(self, instance):
        return CurrentTopicMemberSerializer(
            instance=instance, read_only=True, context=self.context
        ).data


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