from flashcards.managers.bases import BaseManager
from flashcards.querysets.topic_members import TopicMemberQuerySet


class TopicMemberManager(BaseManager.from_queryset(TopicMemberQuerySet)):
    def get_status_for(self, topic, member):
        topic_member = (
            self.filter(topic=topic, member=member)
            .only('status')
            .first()
        )
        return getattr(topic_member, 'status', None)