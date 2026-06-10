from django.contrib.auth import get_user_model
from django.db import transaction

from flashcards.models import Topic, Translation, Vocabulary
from shared.serializers.bases import (
    BaseListSerializer,
    BaseSerializer,
    CustomPrimaryKeyRelatedField,
)
from flashcards.services.translations import TranslationService

User = get_user_model()

translation_service = TranslationService()


class AuthorSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
        ]


class ListTranslationsSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = Translation
        fields = [
            'id',
            'translation',
            'language',
            'type',
            'note',
            'created_by',
        ]


class RetrieveVocabularySerializer(BaseSerializer):
    translations = ListTranslationsSerializer(many=True)
    created_by = AuthorSerializer(read_only=True)

    class Meta(BaseSerializer.Meta):
        model = Vocabulary
        fields = [
            'id',
            'word',
            'topic',
            'audio',
            'language',
            'translations',
            'descriptions',
            'created_by',
        ]


class CreateVocabularySerializer(BaseSerializer):
    translations = ListTranslationsSerializer(many=True)

    class Meta(BaseSerializer.Meta):
        model = Vocabulary
        fields = [
            'id',
            'word',
            'topic',
            'language',
            'translations',
            'descriptions',
            'created_by',
        ]

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop('translations', [])
        instance = super().create(validated_data)
        translation_datas = {instance.word: self.initial_data.get('translations', [])}
        translation_service.bulk_create_update_translations(
            [instance], translation_datas
        )
        return instance


class UpdateVocabularySerializer(BaseSerializer):
    translations = ListTranslationsSerializer(many=True)

    class Meta(BaseSerializer.Meta):
        model = Vocabulary
        fields = [
            'id',
            'word',
            'language',
            'translations',
            'descriptions',
        ]

    @transaction.atomic
    def update(self, instance, validated_data):
        validated_data.pop('translations', [])
        instance = super().update(instance, validated_data)
        translation_datas = {instance.word: self.initial_data.get('translations', [])}
        translation_existing_ids = {
            instance.word: [
                item['id']
                for item in self.data.get('translations', [])
                if 'id' in item
            ]
        }
        translation_service.bulk_create_update_translations(
            [instance], translation_datas, translation_existing_ids
        )
        return instance


class BaseListVocabulariesSerializer(BaseListSerializer):
    @transaction.atomic
    def create(self, validated_data):
        validated_translations = {
            item['word']: item.pop('translations', []) for item in validated_data
        }
        vocab_instances = super().create(validated_data)
        translation_service.bulk_create_update_translations(
            vocab_instances, validated_translations
        )
        return vocab_instances

    def to_internal_value(self, data):
        topic_ids = {
            item.get('topic') 
            for item in data
        }
        topics = Topic.objects.in_bulk(topic_ids)
        for item in data:
            topic = topics.get(item.get('topic'))
            item['topic'] = topic
        return super().to_internal_value(data)


class CreateImportVocabulariesSerializer(CreateVocabularySerializer):
    topic = CustomPrimaryKeyRelatedField(
        queryset=Topic.objects.all(),
        allow_null=True,
        required=False,
    )

    class Meta(CreateVocabularySerializer.Meta):
        list_serializer_class = BaseListVocabulariesSerializer