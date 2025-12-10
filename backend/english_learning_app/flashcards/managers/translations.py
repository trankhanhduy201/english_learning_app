from flashcards.managers.bases import BaseManager
from flashcards.querysets.translations import TranslationQuerySet


class TranslationManager(BaseManager.from_queryset(TranslationQuerySet)):
    # your extra manager functionality here
    pass