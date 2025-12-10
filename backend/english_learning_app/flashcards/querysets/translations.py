from flashcards.querysets.bases import BaseQuerySet


class TranslationQuerySet(BaseQuerySet):
    def by_language(self, language):
        qs = self
        if language:
            qs = qs.filter(language=language)
        return qs
