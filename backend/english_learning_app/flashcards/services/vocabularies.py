import re
import base64
from flashcards.models import Translation, Vocabulary
from flashcards.utilities.audio import get_tts_audio


class VocabularyImportService:
    def _parse_import_text_translations(self, user_id, import_text, language_to):
        translations_entries = []
        split_pattern = r"\s*(\(v\)|\(adj\)|\(a\)|\(adv\)|\(n\)|\(prep\))\s*"

        for text in import_text.split("|"):
            # Split parts
            parts = re.split(split_pattern, text.strip())
            parts = [part for part in parts if part != '']

            # Get translation type
            translation_type = None if len(parts) == 1 else parts[0].strip('()')
            translation_type = (
                Translation.TranslationTypeEnums.ADJ.value 
                if translation_type == 'a' else translation_type
            )
            if translation_type not in Translation.TranslationTypeEnums.values:
                translation_type = None

            # Get translation text
            translation_text = text
            if len(parts) > 1:
                if translation_type:
                    parts.pop(0)
                translation_text = ' '.join(parts)

            # Append new one to existing list
            translations_entries.append({
                "translation": translation_text,
                "language": language_to,
                "type": translation_type,
                "created_by": user_id
            })

        return translations_entries

    def parse_import_text(self, user_id, topic_id, import_text, language_from, language_to):
        if not import_text or not topic_id:
            return []
        
        vocab_entries = {}
        for line in import_text.strip().split("\n"):
            # Remove space in text
            line = line.strip()
            if not line:
                continue
            
            # Get translation import text
            line_parts = line.split(":", 1)
            if len(line_parts) != 2:
                word = description = line_parts[0]
            else:
                word, description = map(str.strip, line_parts)
                
            if not description:
                continue

            # Get translation data
            translations_entries = (
                [] if not word in vocab_entries else 
                vocab_entries[word]['translations']
            )
            translations_entries.extend(
                self._parse_import_text_translations(user_id, description, language_to)
            )
            
            # Update vocab data
            vocab_entries[word] = {
                "word": word,
                "topic": int(topic_id),
                "language": language_from,
                "translations": translations_entries,
                "created_by": user_id
            }
        
        return list(vocab_entries.values())


class VocabularyAudioService:
    def get_audio_cache(self, words):
        existing_audio_vocabs = (
            Vocabulary.objects.filter(
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

    def generate_audio(self, vocab_ids):
        results = {
            'audios': {}
        }
        if not vocab_ids:
            return results

        vocabs = Vocabulary.objects.filter(pk__in=set(vocab_ids))
        if not vocabs.exists():
            return results
        
        audio_cache = self.get_audio_cache([
            vocab.word for vocab in vocabs
        ])
        updated_vocabs = []

        for vocab in vocabs:
            cache_key = vocab.word
            audio_binary = (
                audio_cache.get(cache_key) or
                get_tts_audio(cache_key, vocab.language)
            )

            if audio_binary is not None:
                vocab.audio = audio_binary
                updated_vocabs.append(vocab)
                audio_base64 = base64.b64encode(audio_binary).decode('utf-8')
                results['audios'].update({
                    cache_key: audio_base64
                })

        if updated_vocabs:
            Vocabulary.objects.bulk_update(updated_vocabs, ['audio'])

        return results