import django_filters
from django.db.models import Exists, OuterRef
from .models import Translation


class VocabularyFilter(django_filters.FilterSet):
    topic_id = django_filters.NumberFilter(field_name='topic__id')
    lang = django_filters.CharFilter(method='filter_has_translation')

    def filter_has_translation(self, queryset, name, value):
        lang = self.request.GET.get('lang')
        if lang:
            queryset = queryset.filter(
                Exists(Translation.objects.filter(vocabulary=OuterRef('pk'), language=value))
            )
        return queryset
