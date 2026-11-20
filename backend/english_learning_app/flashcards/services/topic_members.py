from rest_framework.exceptions import NotFound, ValidationError

from flashcards.models import TopicMember


class TopicMemberService:
    def join_topic(self, user, topic, topic_member):
        if topic_member is not None:
            topic_member.save_left(False)
            return topic_member

        topic_member = TopicMember(
            member=user,
            topic=topic,
            status=TopicMember.TopicMemberStatusEnums.PENDING,
        )
        topic_member.save()
        return topic_member

    def leave_topic(self, topic_member):
        if topic_member is None:
            raise NotFound('Topic member not found')

        topic_member.save_left(True)
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
