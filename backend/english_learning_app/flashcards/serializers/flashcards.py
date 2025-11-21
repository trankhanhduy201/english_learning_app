from rest_framework import serializers
from drf_extra_fields.fields import Base64ImageField
from django.db import models
from flashcards.models import LanguageEnums, Topic, Vocabulary, Translation
from flashcards.utilities.querysets import get_translation_prefetch_related
from flashcards.serializers.bases import (
    BaseSerializer, 
    BaseListSerializer, 
    InstancePrimaryKeyRelatedField
)
from flashcards.services.translations import TranslationService
from flashcards.serializers.images import UploadImageSerializer


translation_service = TranslationService()


class TopicSerializer(BaseSerializer):
    # For read-only and involke get_upload_image to return serialized image data
    image_info = serializers.SerializerMethodField()
    upload_image = Base64ImageField(source='image_path', write_only=True, required=False, allow_null=True)

    class Meta(BaseSerializer.Meta):
        model = Topic
        fields = ['id', 'name', 'learning_language', 'descriptions', 'image_info', 'upload_image', 'created_by']

    def get_image_info(self, instance):
        if instance.image_path:
            return UploadImageSerializer(instance=instance.image_path).data
        return None
    
    def update(self, instance, validated_data):
        if 'image_path' in validated_data and validated_data['image_path'] is None:
            instance.image_path.delete(save=False)
        return super().update(instance, validated_data)


class TranslationSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = Translation
        fields = ['id', 'translation', 'language', 'type', 'note', 'created_by']
        list_serializer_class = BaseListSerializer


class VocabularyListSerializer(BaseListSerializer):
    def create(self, validated_data):
        validated_translations = {
            item['word']: item.pop('translations', [])
            for item in validated_data
        }
        vocab_instances = super().create(validated_data)
        translation_service.bulk_create_update_translations(vocab_instances, validated_translations)
        return vocab_instances
    
    def to_internal_value(self, data):
        topic_ids = {item.get('topic') for item in data}
        topics = Topic.objects.in_bulk(topic_ids)
        for item in data:
            topic = topics.get(item.get('topic'))
            item['topic'] = topic
        return super().to_internal_value(data)


class VocabularySerializer(BaseSerializer):
    translations = TranslationSerializer(many=True)
    topic = InstancePrimaryKeyRelatedField(
        queryset=Topic.objects.all(),
        allow_null=True,
        required=False
    )
    
    class Meta(BaseSerializer.Meta):
        model = Vocabulary
        fields = ['id', 'word', 'topic', 'audio', 'language', 'translations', 'descriptions', 'created_by']
        list_serializer_class = VocabularyListSerializer
        read_only_fields = ['audio']

    def get_fields(self):
        fields = super().get_fields()

        # Make 'topic' read-only on update
        if self.instance is not None:
            fields['topic'].read_only = True

        return fields
    
    def create(self, validated_data):
        validated_data.pop('translations', [])
        instance = super().create(validated_data)
        translation_datas = {instance.word: self.initial_data.get('translations', [])}
        translation_service.bulk_create_update_translations([instance], translation_datas)
        return instance
    
    def update(self, instance, validated_data):
        validated_data.pop('translations', [])
        instance = super().update(instance, validated_data)
        translation_datas = {instance.word: self.initial_data.get('translations', [])}
        translation_existing_ids = {instance.word: [
            item['id'] 
            for item in self.data.get('translations', []) 
            if 'id' in item
        ]}
        translation_service.bulk_create_update_translations(
            [instance], translation_datas, translation_existing_ids
        )
        return instance


class VocabularyImportSerializer(serializers.Serializer):
    import_type = serializers.ChoiceField(choices=["text", "csv", "json"])
    topic_id = serializers.IntegerField()
    import_text = serializers.CharField()
    language_from = serializers.ChoiceField(choices=LanguageEnums.values)
    language_to = serializers.ChoiceField(choices=LanguageEnums.values)