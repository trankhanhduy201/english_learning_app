from rest_framework import serializers
from .models import Topic, Vocabulary, Translation


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'name', 'descriptions', 'created_by']


class TranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Translation
        fields = ['id', 'translation', 'language', 'type', 'note', 'created_by']


class VocabularySerializer(serializers.ModelSerializer):
    translations = TranslationSerializer(many=True)

    class Meta:
        model = Vocabulary
        fields = ['id', 'word', 'topic', 'translations', 'descriptions', 'created_by']

    def _create_or_update_translations(self, instance, translations):
        if len(translations) > 0:
            translations = self.initial_data.get('translations', [])
            translation_ids = [item['id'] for item in self.data.get('translations') if 'id' in item]

            # For update existed item
            update_fields = ['translation', 'language', 'type', 'note']
            updated_ids = []
            update_translations = Translation.objects.filter(pk__in=translation_ids, vocabulary=instance)
            if len(update_translations) > 0:
                for translation in update_translations:
                    update_data = next((item for item in translations if 'id' in item and int(item['id']) == translation.id), None)
                    if update_data:
                        updated_ids.append(translation.id)
                        translation.__dict__.update({k: v for k, v in update_data.items() if k in update_fields})
                Translation.objects.bulk_update(update_translations, update_fields)

            # For create new item
            new_translations = []
            for translation in translations:
                if 'id' not in translation or int(translation['id']) not in translation_ids:
                    new_translations.append(Translation(vocabulary=instance, **translation))
            if len(new_translations) > 0:
                Translation.objects.bulk_create(new_translations)

            # For delete item
            delete_ids = list(set(translation_ids).difference(updated_ids))
            if delete_ids:
                Translation.objects.filter(pk__in=delete_ids, vocabulary=instance).delete()

    def create(self, validated_data):
        translations = validated_data.pop('translations', [])
        instance = super().create(validated_data)
        self._create_or_update_translations(instance, translations)
        return instance

    def update(self, instance, validated_data):
        translations = validated_data.pop('translations', [])
        instance = super().update(instance, validated_data)
        self._create_or_update_translations(instance, translations)
        return instance




