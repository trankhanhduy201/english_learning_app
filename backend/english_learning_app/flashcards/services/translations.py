from flashcards.models import Translation


class TranslationService:
    def bulk_create_update_translations(self, vocab_instances, validated_translations, translation_existing_ids = {}):
        new_translations = []
        update_translations = []
        delete_translations = []
        update_fields = ['translation', 'language', 'type', 'note']
        for word in validated_translations.keys():
            _translation_existing_ids = translation_existing_ids.get(word, [])
            validated_translation = validated_translations[word]
            vocab_instance = next((
                vocab for vocab in vocab_instances 
                if vocab.word == word
            ), None)

            # For create new item
            for translation in validated_translation:
                if 'id' not in translation or int(translation['id']) not in _translation_existing_ids:
                    new_translations.append(Translation(vocabulary=vocab_instance, **translation))

            if len(_translation_existing_ids) > 0:
                # For update existed item
                updated_ids = []
                _update_translations = Translation.objects.filter(
                    pk__in=_translation_existing_ids, vocabulary=vocab_instance
                )
                for translation in _update_translations:
                    update_data = next((
                        item for item in validated_translation
                        if 'id' in item and int(item['id']) == translation.id
                    ), None)
                    if update_data:
                        updated_ids.append(translation.id)
                        translation.__dict__.update({
                            k: v for k, v in update_data.items() 
                            if k in update_fields
                        })
                        update_translations.append(translation)
                    
                # For delete item
                delete_ids = list(set(_translation_existing_ids).difference(updated_ids))
                delete_translations.extend(delete_ids if delete_ids else [])
                    

        if len(new_translations) > 0:
            Translation.objects.bulk_create(new_translations)

        if len(update_translations) > 0:
            Translation.objects.bulk_update(update_translations, update_fields)
        
        if len(delete_translations) > 0:
            Translation.objects.bulk_delete(delete_translations)
        
        return (
            new_translations,
            update_translations,
            delete_translations
        )