from django.db.models import Prefetch
from flashcards.querysets.bases import BaseQuerySet


class VocabQuerySet(BaseQuerySet):
    TRANSLATION_MODEL = 'flashcards.Translation'

    def with_translations(self, params):
        language = params.get('lang')
        Translation = self.get_model(self.TRANSLATION_MODEL)
        qs = Translation.objects.by_language(language)
        return self.prefetch_related(
            Prefetch('translations', queryset=qs)
        )
