from flashcards.managers.bases import BaseManager
from flashcards.querysets.topic_members import TopicMemberQuerySet


class TopicMemberManager(BaseManager.from_queryset(TopicMemberQuerySet)):
    def get_status_for(self, topic, member):
        topic_member = (
            self.filter(topic=topic, member=member)
                .only('status', 'is_left')
                .first()
        )
        if topic_member is None or topic_member.is_left:
            return None
        return topic_member.status