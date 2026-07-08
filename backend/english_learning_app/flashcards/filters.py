import django_filters


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
		return queryset.search_by_keyword(value)
	
	def filter_only_my_topic(self, queryset, name, value):
		if not value:
			return queryset
		return queryset.accessible_by(self.request.user)


class VocabularyFilter(django_filters.FilterSet):
	topic_id = django_filters.NumberFilter(field_name='topic__id')
	lang = django_filters.CharFilter(method='filter_has_translation', label='Languge')
	
	def filter_has_translation(self, queryset, name, value):
		lang = self.request.GET.get('lang', 'en')
		if lang:
			return queryset.filter_has_translation(lang)
		return queryset
