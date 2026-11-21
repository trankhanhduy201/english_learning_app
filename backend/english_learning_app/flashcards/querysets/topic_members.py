from django.db.models import Case, Count, IntegerField, Value, When, Q
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
        return self.filter(
            status__in=accessible_statuses,
            is_left=False
        )

    def inaccessible(self):
        accessible_statuses = self.model.get_inaccessible_statuses()
        return self.filter(
            status__in=accessible_statuses
        )

    def joined_member(self, force_included_members=[]):
        joined_statuses = self.model.get_joined_statuses()
        conditions = Q(status__in=joined_statuses)

        if force_included_members:
            conditions |= Q(member__in=force_included_members)

        return self.filter(
            conditions & Q(is_left=False)
        )

    def count_members(self):
        return (
            self.joined_member()
                .values('topic')
                .annotate(count=Count('id'))
                .values('count')
        )

    def by_topic_owner(self, user):
        return self.filter(
            topic__created_by=user
        )
