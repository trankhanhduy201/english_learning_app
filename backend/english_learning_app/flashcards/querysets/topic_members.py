from django.db.models import Case, Count, IntegerField, Value, When
from flashcards.querysets.bases import BaseQuerySet


class TopicMemberQuerySet(BaseQuerySet):
    def with_member(self):
        return self.select_related(
            'member',
            'member__profile'
        )

    def with_topic(self):
        return self.select_related('topic')

    def ordered_by_status(self):
        status_order = Case(
            When(status=self.model.TopicMemberStatusEnums.PENDING, then=Value(0)),
            default=Value(1),
            output_field=IntegerField(),
        )
        return self.order_by(status_order, '-joined_at')

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
