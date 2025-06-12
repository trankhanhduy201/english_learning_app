from django.db import IntegrityError
from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from flashcards.models import LanguageEnums
from flashcards.queryset_utils import get_translation_prefetch_related
from .models import Topic, Vocabulary, Translation


class InstancePrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
	def to_internal_value(self, data):
		if isinstance(data, self.queryset.model):
			return data
		return super().to_internal_value(data)


class BaseListSerializer(serializers.ListSerializer):
	def update(self, instances, validated_data):
		instance_hash = {index: instance for index, instance in enumerate(instances)}
		result = [
			self.child.update(instance_hash[index], attrs)
			for index, attrs in enumerate(validated_data)
		]
		
		writable_fields = [
			x for x in self.child.Meta.fields
			if x not in self.child.Meta.read_only_fields
		]
		try:
			self.child.Meta.model.objects.bulk_update(result, writable_fields)
		except IntegrityError as e:
			raise ValidationError(e)
		
		return result
	
	def create(self, validated_data):
		model_class = self.child.Meta.model
		instances = [model_class(**item) for item in validated_data]
		model_class.objects.bulk_create(instances)
		return instances


class BaseSerializer(serializers.ModelSerializer):
	class Meta:
		list_serializer_class = BaseListSerializer


class TopicSerializer(BaseSerializer):
	class Meta(BaseSerializer.Meta):
		model = Topic
		fields = ['id', 'name', 'learning_language', 'descriptions', 'created_by']


class TranslationListSerializer(BaseListSerializer):
	pass


class TranslationSerializer(BaseSerializer):
	class Meta(BaseSerializer.Meta):
		model = Translation
		fields = ['id', 'translation', 'language', 'type', 'note', 'created_by']
		list_serializer_class = TranslationListSerializer


class VocabularyListSerializer(BaseListSerializer):
	def create(self, validated_data):
		validated_translations = [
			{'word': item['word'], 'data': item.pop('translations', [])}
			for item in validated_data
		]
		create_translations = []
		vocab_instances = super().create(validated_data)
		for translation in validated_translations:
			parent_instance = None
			for vocab in vocab_instances:
				if vocab.word == translation['word']:
					parent_instance = vocab
					break
			for data in translation['data']:
				data.update({'vocabulary': parent_instance})
				create_translations.append(Translation(**data))
		
		if len(create_translations) > 0:
			Translation.objects.bulk_create(create_translations)
		
		vocab_ids = [v.id for v in vocab_instances]
		return Vocabulary.objects \
			.prefetch_related(get_translation_prefetch_related()) \
			.filter(pk__in=vocab_ids).all()
	
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
		read_only_fields = ['audio', 'topic']
	
	def _create_or_update_translations(self, instance, translations, is_create=False):
		if len(translations) == 0:
			return []
		
		translations = self.initial_data.get('translations', []) if isinstance(self.initial_data, dict) else translations
		translation_ids = [] if is_create else [item['id'] for item in self.data.get('translations', []) if 'id' in item]
		
		# For update existed item
		update_fields = ['translation', 'language', 'type', 'note']
		updated_ids = []
		update_translations = Translation.objects.filter(pk__in=translation_ids, vocabulary=instance)
		if len(update_translations) > 0:
			for translation in update_translations:
				update_data = next(
					(item for item in translations if 'id' in item and int(item['id']) == translation.id), None)
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
		
		update_translations = list(update_translations)
		update_translations.extend(new_translations)
		return update_translations
	
	def create(self, validated_data):
		translations = validated_data.pop('translations', [])
		instance = super().create(validated_data)
		self._create_or_update_translations(instance, translations, **{'is_create': True})
		return instance
	
	def update(self, instance, validated_data):
		translations = validated_data.pop('translations', [])
		instance = super().update(instance, validated_data)
		self._create_or_update_translations(instance, translations)
		return instance


class VocabularyImportSerializer(serializers.Serializer):
	import_type = serializers.ChoiceField(choices=["text", "csv", "json"])
	topic_id = serializers.IntegerField()
	text_data = serializers.CharField()
	learning_lang = serializers.ChoiceField(choices=LanguageEnums.values)
	translating_lang = serializers.ChoiceField(choices=LanguageEnums.values)
