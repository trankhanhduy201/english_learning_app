from django.db import transaction
from flashcards.models import Translation
from shared.decorators.handle_exceptions import handle_exceptions

from collections import defaultdict

class TranslationService:
    def get_translation_existings(self, action, vocab_instances):
        translation_existings = defaultdict(list)
        if action == 'update':
            vocab_key_instances = {item.id: item for item in vocab_instances}
            translation_qs = (
                Translation.objects
                    .filter(vocabulary__in=vocab_instances)
            )

            for translation in translation_qs:
                vocab_instance = vocab_key_instances.get(translation.vocabulary_id, None)
                if vocab_instance:
                    translation_existings[vocab_instance.word].append(translation)

        return translation_existings


    @handle_exceptions(reraise=True, log_error=True)
    def bulk_create_update_translations(self, action, vocab_instances, validated_translations):
        new_translations = []
        update_translations = []
        delete_translations = []
        update_fields = ['translation', 'language', 'type', 'note']

        translation_existings = self.get_translation_existings(action, vocab_instances)
        for word in validated_translations.keys():
            _translation_existings = translation_existings.get(word, [])
            validated_translation = validated_translations[word]
            vocab_instance = next((
                vocab for vocab in vocab_instances 
                if vocab.word == word
            ), None)

            # For create new item
            _translation_existing_ids = {item.id for item in _translation_existings}
            for translation in validated_translation:
                if 'id' not in translation or int(translation['id']) not in _translation_existing_ids:
                    new_translations.append(Translation(vocabulary=vocab_instance, **translation))

            if len(_translation_existings) > 0:
                # For update existed item
                updated_ids = []
                for translation in _translation_existings:
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
                
        with transaction.atomic():
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


translation_service = TranslationService()