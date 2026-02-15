from rest_framework import serializers
from drf_extra_fields.fields import Base64ImageField
from django.db.models import Q
from django.contrib.auth import get_user_model
from flashcards.models import LanguageEnums, Topic, Vocabulary, Translation, TopicMember
from flashcards.serializers.bases import (
    BaseSerializer, 
    BaseListSerializer, 
    CustomPrimaryKeyRelatedField
)
from flashcards.services.translations import TranslationService
from flashcards.serializers.images import UploadImageSerializer

User = get_user_model()

translation_service = TranslationService()


class UserSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class TopicMemberSerializer(BaseSerializer):
    member_id = serializers.CharField(source='member.id', read_only=True)
    member_name = serializers.CharField(source='member.username', read_only=True)

    is_remove = serializers.BooleanField(write_only=True, required=False, default=False)

    topic = CustomPrimaryKeyRelatedField(
        queryset=Topic.objects.all(),
        allow_null=True,
        required=False
    )
    
    class Meta(BaseSerializer.Meta):
        model = TopicMember
        fields = ['id', 'status', 'joined_at', 'topic', 'member', 'member_id', 'member_name', 'is_remove']
        read_only_fields_on_update = ['topic', 'member', 'joined_at']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(self, 'initial_data') and self.initial_data:
            data['is_remove'] = self.initial_data.get('is_remove', False)
        return data


class CurrentTopicMemberSerializer(serializers.Serializer):
    is_owner = serializers.SerializerMethodField()
    is_accepted = serializers.SerializerMethodField()
    is_subcribing = serializers.SerializerMethodField()
    is_blocking = serializers.SerializerMethodField()

    def get_is_owner(self, instance):
        user = self.context.get('request').user
        return user == instance.created_by

    def _get_current_topic_member(self, instance):
        user = self.context.get('request').user
        if not hasattr(self, '_current_topic_member'):
            self._current_topic_member = next((
                topic_member for topic_member in instance.topic_members.all()
                if topic_member.member.id == user.id and topic_member.topic.id == instance.id
            ), None)
        return self._current_topic_member

    def get_is_accepted(self, instance):
        if self.get_is_owner(instance):
            return False
        
        current_topic_member = self._get_current_topic_member(instance)
        if not current_topic_member:
            return False
        
        pending_status = [
            TopicMember.TopicMemberStatusEnums.PENDING,
            TopicMember.TopicMemberStatusEnums.BLOCK
        ]
        return not current_topic_member.status in pending_status
    
    def get_is_subcribing(self, instance):
        if self.get_is_owner(instance):
            return False

        current_topic_member = self._get_current_topic_member(instance)
        if not current_topic_member:
            return False
        
        return True
    
    def get_is_blocking(self, instance):
        if self.get_is_owner(instance):
            return False
        
        current_topic_member = self._get_current_topic_member(instance)
        if not current_topic_member:
            return False
        
        blocking_status = [
            TopicMember.TopicMemberStatusEnums.BLOCK
        ]
        return current_topic_member.status in blocking_status


class TopicSerializer(BaseSerializer):
    # For read-only and involke get_upload_image to return serialized image data
    image_info = serializers.SerializerMethodField()
    member_count = serializers.IntegerField(read_only=True)
    members = serializers.SerializerMethodField()
    current_member = serializers.SerializerMethodField()
    created_by = UserSerializer(read_only=True)

    upload_image = Base64ImageField(source='image_path', write_only=True, required=False, allow_null=True)
    updated_members = CustomPrimaryKeyRelatedField(
        source='members',
        many=True,
        queryset=User.objects.all(), # This will be run at the end in case not being used when reading
        allow_null=True,
        required=False,
        write_only=True
    )
    
    class Meta(BaseSerializer.Meta):
        model = Topic
        fields = ['id', 'name', 'learning_language', 'status', 'descriptions', 'image_info', 'upload_image', 'created_by', 'members', 'updated_members', 'current_member', 'member_count']

    def get_image_info(self, instance):
        if instance.image_path:
            return UploadImageSerializer(instance=instance.image_path).data
        return None
    
    def get_members(self, instance):
        return TopicMemberSerializer(instance=instance.topic_members.all()[:15], many=True).data
    
    def get_current_member(self, instance):
        return CurrentTopicMemberSerializer(instance=instance, read_only=True, context=self.context).data
        
    def update(self, instance, validated_data):
        updated_members = validated_data.pop('updated_members', None)
        if updated_members:
            instance.members.set(updated_members)

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
    created_by = UserSerializer(read_only=True)

    translations = TranslationSerializer(many=True)
    topic = CustomPrimaryKeyRelatedField(
        queryset=Topic.objects.all(),
        allow_null=True,
        required=False
    )
    
    class Meta(BaseSerializer.Meta):
        model = Vocabulary
        fields = ['id', 'word', 'topic', 'audio', 'language', 'translations', 'descriptions', 'created_by']
        list_serializer_class = VocabularyListSerializer
        read_only_fields = ['audio']
        read_only_fields_on_update = ['topic']
    
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