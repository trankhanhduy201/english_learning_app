from django.shortcuts import get_object_or_404
from rest_framework.exceptions import ValidationError

from flashcards.models import TopicMember


class TopicMemberService:
    def subscribe(self, user, topic):
        topic_member = (
            topic.topic_members
                .filter(member=user)
                .first()
        )

        if topic_member is not None:
            topic_member.status = TopicMember.TopicMemberStatusEnums.READ_ONLY
            topic_member.save(update_fields=['status'])
            return topic_member

        topic_member = TopicMember(
            member=user,
            topic=topic,
            status=TopicMember.TopicMemberStatusEnums.PENDING,
        )
        topic_member.save()
        return topic_member

    def unsubscribe(self, user, topic):
        topic_member = get_object_or_404(
            TopicMember, member=user, topic=topic,
        )

        previous_status = topic_member.status
        topic_member.status = TopicMember.TopicMemberStatusEnums.LEAVING
        if previous_status != TopicMember.TopicMemberStatusEnums.PENDING:
            topic_member.save(update_fields=['status'])
        else:
            topic_member.delete()

        return topic_member

    def resolve_for_update(self, topic, data):
        if not isinstance(data, list) and not isinstance(data, dict):
            raise ValidationError('Invalid data')

        if isinstance(data, list):
            topic_member_ids = [
                item['id']
                for item in data
                if isinstance(item, dict) and item.get('id') is not None
            ]

            topic_member = (
                topic.topic_members
                    .filter(id__in=topic_member_ids)
            )
            return topic_member, True

        topic_member_id = data.get('id')
        if topic_member_id is None:
            raise ValidationError('Missing id in data')

        topic_member = (
            topic.topic_members
                .filter(id=topic_member_id)
                .first()
        )
        return topic_member, False


topic_member_service = TopicMemberService()
