from rest_framework import serializers
from .models import Topic, Vocabulary, Translation


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'name', 'created_by']


class TranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Translation
        fields = ['id', 'translation', 'language', 'created_by']


class VocabularySerializer(serializers.ModelSerializer):
    translations = TranslationSerializer(many=True)

    class Meta:
        model = Vocabulary
        fields = ['id', 'word', 'topic', 'translations', 'created_by']

    def _create_or_update_translations(self, instance, translations):
        if len(translations) > 0:
            translations = self.initial_data.get('translations', [])
            translation_ids = [item['id'] for item in self.data.get('translations') if 'id' in item]

            # For update existed item
            updated_ids = []
            update_translations = Translation.objects.filter(pk__in=translation_ids, vocabulary=instance)
            if len(update_translations) > 0:
                for translation in update_translations:
                    update_data = [item for item in translations if 'id' in item and item['id'] == translation.id]
                    if len(update_data) > 0:
                        updated_ids.append(translation.id)
                        translation.__dict__.update(update_data[0])
                Translation.objects.bulk_update(update_translations, ['translation', 'language'])

            # For create new item
            new_translations = []
            for translation in translations:
                if 'id' not in translation or translation['id'] not in translation_ids:
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




