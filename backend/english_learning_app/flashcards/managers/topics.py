from flashcards.managers.bases import BaseManager
from flashcards.querysets.topics import TopicQuerySet


class TopicManager(BaseManager.from_queryset(TopicQuerySet)):
    def get_topic_for_permission(self, topic_id):
        return (
            self.only('id', 'created_by', 'status')
            .filter(id=topic_id)
            .first()
        )