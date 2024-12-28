import django_filters


class VocabularyFilter(django_filters.FilterSet):
    topic_id = django_filters.NumberFilter(field_name='topic__id')
    lang = django_filters.CharFilter(field_name='translations__language')
