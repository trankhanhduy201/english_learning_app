from django.db.models import Prefetch
from flashcards.querysets.bases import BaseQuerySet
from flashcards.querysets.mixins import OwnerMixin


class VocabQuerySet(BaseQuerySet, OwnerMixin):
    TRANSLATION_MODEL = 'flashcards.Translation'

    def with_translations(self, language):
        Translation = self.get_model(self.TRANSLATION_MODEL)
        qs = Translation.objects.by_language(language)
        return self.prefetch_related(
            Prefetch('translations', queryset=qs)
        )
