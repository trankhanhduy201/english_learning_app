from django.db.models import OuterRef, Count
from flashcards.querysets.bases import BaseQuerySet


class TopicMemberQuerySet(BaseQuerySet):
    def with_member(self):
        return self.select_related('member')

    def count_members(self):
        return self.filter(topic=OuterRef('id')) \
            .values('topic') \
            .annotate(count=Count('id')) \
            .values('count')
