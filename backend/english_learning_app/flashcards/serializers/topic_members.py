from django.contrib.auth import get_user_model
from rest_framework.serializers import BooleanField, CharField
from flashcards.models import Topic, TopicMember
from flashcards.utilities.tasks import (
    notify_topic_owner_for_subscription_async,
    notify_subscriber_for_accepted_subscription_async,
)
from shared.serializers.bases import (
    BaseListSerializer,
    BaseSerializer,
    CustomPrimaryKeyRelatedField,
)

User = get_user_model()


class RetrieveListTopicMembersSerializer(BaseSerializer):
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


class CreateListTopicMembersSerializer(BaseSerializer):
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

    def save(self, **kwargs):
        instance = super().save(**kwargs)
        notify_topic_owner_for_subscription_async(instance)
        return instance


class UpdateListTopicMembersSerializer(BaseSerializer):
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

    def save(self, **kwargs):
        previous_status = self.instance.status if self.instance is not None else None
        updated_instance = super().save(**kwargs)
        updated_status = getattr(updated_instance, 'status', None)

        if (
            previous_status == TopicMember.TopicMemberStatusEnums.PENDING and
            updated_status == TopicMember.TopicMemberStatusEnums.READ_ONLY
        ):
            notify_subscriber_for_accepted_subscription_async(updated_instance)

        return updated_instance

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(self, 'initial_data') and self.initial_data:
            data['is_remove'] = self.initial_data.get('is_remove', False)
        return data