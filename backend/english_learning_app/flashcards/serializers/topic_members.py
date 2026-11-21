from django.contrib.auth import get_user_model
from rest_framework.serializers import BooleanField, CharField, Serializer, SerializerMethodField
from flashcards.models import Topic, TopicMember
from shared.serializers.bases import (
    BaseListSerializer,
    BaseSerializer,
    CustomPrimaryKeyRelatedField,
)

User = get_user_model()


class MemberPermissionSerializer(Serializer):
    is_owner = SerializerMethodField()
    is_accepted = SerializerMethodField()
    is_accepting = SerializerMethodField()
    has_member_record = SerializerMethodField()
    is_subcribing = SerializerMethodField()
    is_blocking = SerializerMethodField()

    def get_topic(self):
        return self.context.get('topic', None)

    def get_is_owner(self, instance):
        check_owner = self.context.get('check_owner', False)
        if not check_owner:
            return False

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

        return instance.status in [
            TopicMember.TopicMemberStatusEnums.READ_ONLY,
            TopicMember.TopicMemberStatusEnums.EDITABLE
        ]

    def get_is_accepting(self, instance):
        if self.get_is_owner(instance):
            return False

        if not instance:
            return False

        return instance.status in [
            TopicMember.TopicMemberStatusEnums.PENDING
        ]

    def get_has_member_record(self, instance):
        if self.get_is_owner(instance):
            return False

        if not instance:
            return False

        return not bool(getattr(instance, 'is_left', False))

    def get_is_subcribing(self, instance):
        if self.get_is_owner(instance):
            return False

        if not instance:
            return False

        return bool(getattr(instance, 'is_subcribe', False))

    def get_is_blocking(self, instance):
        if self.get_is_owner(instance):
            return False

        if not instance:
            return False

        blocking_status = [TopicMember.TopicMemberStatusEnums.BLOCK]
        return instance.status in blocking_status


class RetrieveTopicMembersSerializer(BaseSerializer):
    member_permissions = MemberPermissionSerializer(source='*', read_only=True)
    member_id = CharField(source='member.id', read_only=True)
    member_username = CharField(source='member.username', read_only=True)
    member_name = CharField(source="member.get_full_name", read_only=True)
    member_avatar = CharField(source="member.profile.avatar", read_only=True)

    class Meta(BaseSerializer.Meta):
        model = TopicMember
        fields = [
            'id',
            'status',
            'joined_at',
            'topic',
            'member',
            'member_id',
            'member_username',
            'member_name',
            'member_avatar',
            'member_permissions',
        ]


class BaseListTopicMembersSerializer(BaseListSerializer):
    def to_internal_value(self, data):
        topic_ids = set()
        member_ids = set()

        for item in data:
            topic_ids.add(item.get('topic'))
            member_ids.add(item.get('member'))

        topics = Topic.objects.in_bulk(topic_ids)
        members = User.objects.in_bulk(member_ids)

        for item in data:
            item['topic'] = topics.get(item.get('topic'))
            item['member'] = members.get(item.get('member'))

        return super().to_internal_value(data)


class CreateTopicMembersSerializer(BaseSerializer):
    topic = CustomPrimaryKeyRelatedField(
        queryset=Topic.objects.all(), required=True
    )

    member = CustomPrimaryKeyRelatedField(
        queryset=User.objects.all(), required=True
    )

    class Meta(BaseSerializer.Meta):
        model = TopicMember
        fields = [
            'id', 
            'status', 
            'joined_at', 
            'topic', 
            'member'
        ]
        list_serializer_class = BaseListTopicMembersSerializer


class UpdateTopicMembersSerializer(BaseSerializer):
    is_remove = BooleanField(write_only=True, required=False, default=False)

    class Meta(BaseSerializer.Meta):
        model = TopicMember
        fields = [
            'id', 
            'status', 
            'is_remove',
            'member',
        ]
        read_only_fields = ['id', 'member']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(self, 'initial_data') and self.initial_data:
            data['is_remove'] = self.initial_data.get('is_remove', False)
        return data