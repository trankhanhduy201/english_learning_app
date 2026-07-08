from flashcards.querysets.bases import BaseQuerySet


class TranslationQuerySet(BaseQuerySet):
    def by_language(self, language):
        qs = self
        if language:
            qs = qs.filter(language=language)
        return qs

    def filter_update_translations(self, translation_ids, vocabulary):
        return self.filter(
            pk__in=translation_ids,
            vocabulary=vocabulary
        )
