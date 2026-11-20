from flashcards.managers.bases import BaseManager
from flashcards.querysets.topics import TopicQuerySet


class TopicManager(BaseManager.from_queryset(TopicQuerySet)):
    pass