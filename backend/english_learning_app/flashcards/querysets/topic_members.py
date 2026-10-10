from django.db.models import Count
from flashcards.querysets.bases import BaseQuerySet


class TopicMemberQuerySet(BaseQuerySet):
    def with_member(self):
        return self.select_related(
            'member',
            'member__profile'
        )

    def accessible(self):
        accessible_statuses = self.model.get_accessible_statuses()
        return self.filter(status__in=accessible_statuses)

    def count_members(self):
        return (
            self.accessible()
                .values('topic')
                .annotate(count=Count('id'))
                .values('count')
        )
    
    def joined_topic_ids(self, member_id):
        return (
            self.accessible()
                .filter(member_id=member_id)
                .values_list('topic_id', flat=True)
        )
