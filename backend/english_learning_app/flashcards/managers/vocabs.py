from flashcards.managers.bases import BaseManager
from flashcards.querysets.vocabs import VocabQuerySet


class VocabManager(BaseManager.from_queryset(VocabQuerySet)):
    def get_existing_audio(self, words):
        existing_audio_vocabs = (
            self.filter(
                word__in=words,
                audio__isnull=False
            )
            .values('word', 'audio')
            .distinct()
        )

        return {
            vocab['word']: vocab['audio']
            for vocab in existing_audio_vocabs
        }

    def get_ids_has_no_audio(self, topic_id):
        return list(
            self.filter(
                topic_id=topic_id,
                audio__isnull=True
            )
            .values_list('id', flat=True)
        )