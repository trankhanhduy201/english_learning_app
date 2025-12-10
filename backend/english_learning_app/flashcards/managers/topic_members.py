from flashcards.managers.bases import BaseManager
from flashcards.querysets.topic_members import TopicMemberQuerySet


class TopicMemberManager(BaseManager.from_queryset(TopicMemberQuerySet)):
    # your extra manager functionality here
    pass