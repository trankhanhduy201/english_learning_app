import re
from flashcards.models import Translation


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
            translation_type = Translation.TranslationTypeEnums.ADJ.value if translation_type == 'a' else translation_type
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