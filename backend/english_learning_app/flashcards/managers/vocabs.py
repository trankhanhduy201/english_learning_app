from flashcards.managers.bases import BaseManager
from flashcards.querysets.vocabs import VocabQuerySet


class VocabManager(BaseManager.from_queryset(VocabQuerySet)):
    # your extra manager functionality here
    pass