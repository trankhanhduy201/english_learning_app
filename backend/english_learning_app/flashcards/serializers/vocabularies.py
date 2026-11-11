from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework.serializers import CharField

from shared.serializers.bases import (
    AddExtraDataBeforeCreateMixin,
    BaseListSerializer,
    BaseSerializer,
)
from flashcards.models import Translation, Vocabulary
from flashcards.services.translations import translation_service

User = get_user_model()


def _prepare_validated_translations(validated_translations, **kwargs):
    created_by = kwargs.get('user', None)
    return [
        {**translation, 'created_by': created_by}
        for translation in validated_translations
    ]


class AuthorSerializer(BaseSerializer):
    full_name = CharField(source="get_full_name", read_only=True)

    class Meta(BaseSerializer.Meta):
        model = User
        fields = [
            'id',
            'username',
            'first_name',
            'last_name',
            'email',
            'full_name'
        ]


class RetrieveTranslationSerializer(BaseSerializer):
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


class CreateTranslationSerializer(
    AddExtraDataBeforeCreateMixin,
    BaseSerializer
):
    class Meta(BaseSerializer.Meta):
        list_serializer_class = BaseListSerializer
        model = Translation
        fields = [
            'id',
            'translation',
            'language',
            'type',
            'note',
            'created_by'
        ]
        read_only_fields = [
            'id', 
            'created_by'
        ]


class RetrieveVocabularySerializer(BaseSerializer):
    translations = RetrieveTranslationSerializer(many=True)
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


class CreateVocabularySerializer(
    AddExtraDataBeforeCreateMixin,
    BaseSerializer
):
    translations = CreateTranslationSerializer(many=True)

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
        read_only_fields = [
            'id', 
            'topic',
            'created_by'
        ]

    def _get_extra_fields(self):
        return super()._get_extra_fields() + ['topic']

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop('translations', [])
        instance = super().create(validated_data)

        translation_datas = {
            instance.word: _prepare_validated_translations(
                self.initial_data.get('translations', []), 
                **{'user': self.get_user_context()}
            )
        }
        translation_service.bulk_create_update_translations(
            'create', [instance], translation_datas
        )
        return instance


class UpdateVocabularySerializer(BaseSerializer):
    translations = RetrieveTranslationSerializer(many=True)

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
        translation_service.bulk_create_update_translations(
            'update', [instance], translation_datas
        )
        return instance


class BaseListVocabulariesSerializer(BaseListSerializer):
    @transaction.atomic
    def create(self, validated_data):
        validated_translations = _prepare_validated_translations(
            validated_data, **{'user': self.get_user_context()}
        )
        vocab_instances = super().create(validated_data)
        translation_service.bulk_create_update_translations(
            'create', vocab_instances, validated_translations
        )
        return vocab_instances

    def _prepare_validated_translations(self, validated_data):
        user = self.get_user_context()
        return {
            item['word']: _prepare_validated_translations(item, **{'user': user})
            for item in validated_data
        }


class CreateImportVocabulariesSerializer(CreateVocabularySerializer):
    class Meta(CreateVocabularySerializer.Meta):
        list_serializer_class = BaseListVocabulariesSerializer