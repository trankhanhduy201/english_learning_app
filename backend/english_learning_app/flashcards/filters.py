import django_filters
from django.db.models import Prefetch
from .models import Vocabulary, Translation


class VocabularyFilter(django_filters.FilterSet):
    topic_id = django_filters.NumberFilter(field_name='topic__id')
    lang = django_filters.CharFilter(method='filter_by_language')

    def filter_by_language(self, queryset, name, value):
        return queryset.prefetch_related(
            Prefetch('translations', queryset=Translation.objects.filter(language=value))
        )
