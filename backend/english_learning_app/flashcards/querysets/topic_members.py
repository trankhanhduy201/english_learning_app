from django.db.models import Count
from flashcards.querysets.bases import BaseQuerySet


class TopicMemberQuerySet(BaseQuerySet):
    def with_member(self):
        return self.select_related(
            'member',
            'member__profile'
        )

    def count_members(self):
        accessible_statuses = self.model.get_accessible_statuses()
        return self.filter(status__in=accessible_statuses) \
            .values('topic') \
            .annotate(count=Count('id')) \
            .values('count')
