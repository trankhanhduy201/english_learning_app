from django.contrib.auth import get_user_model
from rest_framework.serializers import BooleanField, CharField

from flashcards.models import Topic, TopicMember
from flashcards.serializers.bases import (
    BaseListSerializer,
    BaseSerializer,
    CustomPrimaryKeyRelatedField,
)

User = get_user_model()


class RetrieveListTopicMembersSerializer(BaseSerializer):
    member_id = CharField(source='member.id', read_only=True)
    member_name = CharField(source='member.username', read_only=True)

    class Meta(BaseSerializer.Meta):
        model = TopicMember
        fields = [
            'id',
            'status',
            'joined_at',
            'topic',
            'member',
            'member_id',
            'member_name',
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

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(self, 'initial_data') and self.initial_data:
            data['is_remove'] = self.initial_data.get('is_remove', False)
        return data