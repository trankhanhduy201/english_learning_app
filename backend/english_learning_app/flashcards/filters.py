import django_filters
from django.db.models import Exists, OuterRef, Q
from flashcards.models import Translation, Vocabulary


class TopicFilter(django_filters.FilterSet):
	text_search = django_filters.CharFilter(
		method='filter_text_search', 
		label='Search by text'
	)
	learning_language = django_filters.CharFilter(
		field_name='learning_language', 
		lookup_expr='iexact'
	)
	only_my_topic = django_filters.CharFilter(
		method='filter_only_my_topic',
		label='Only my topics'
	)
	
	def filter_text_search(self, queryset, name, value):
		if not value:
			return queryset
		vocab_qs = Vocabulary.objects.filter(topic=OuterRef('pk'), word__icontains=value)
		return queryset.filter(
			Q(name__icontains=value) | 
			Q(descriptions__icontains=value) | 
			Q(Exists(vocab_qs))
		)
	
	def filter_only_my_topic(self, queryset, name, value):
		if not value:
			return queryset
		user = self.request.user
		return queryset.accessible_by(user)


class VocabularyFilter(django_filters.FilterSet):
	topic_id = django_filters.NumberFilter(field_name='topic__id')
	lang = django_filters.CharFilter(method='filter_has_translation', label='Languge')
	
	def filter_has_translation(self, queryset, name, value):
		lang = self.request.GET.get('lang', 'en')
		if lang:
			sub_query = Exists(Translation.objects.filter(vocabulary=OuterRef('pk'), language=value))
			queryset = queryset.filter(sub_query)
		return queryset
