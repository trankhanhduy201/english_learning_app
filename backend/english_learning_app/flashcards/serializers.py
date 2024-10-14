from rest_framework import serializers
from .models import Topic, Vocabulary, Translation
from rest_framework.exceptions import ValidationError


class TopicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Topic
        fields = ['id', 'name']


class TranslationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Translation
        fields = ['id', 'translation', 'language']


class VocabularySerializer(serializers.ModelSerializer):
    translations = TranslationSerializer(many=True, read_only=False)

    class Meta:
        model = Vocabulary
        fields = ['id', 'word', 'topic', 'translations']


