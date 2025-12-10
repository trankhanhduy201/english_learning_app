from django.db.models import QuerySet, Q, Prefetch, Subquery, IntegerField
from django.db.models.functions import Coalesce
from flashcards.querysets.bases import BaseQuerySet


class TopicQuerySet(BaseQuerySet):
    TOPIC_MEMBER_MODEL = 'flashcards.TopicMember'

    def with_owner(self):
        return self.select_related('created_by')
    
    def with_topic_members(self):
        TopicMember = self.get_model(self.TOPIC_MEMBER_MODEL)
        qs = TopicMember.objects \
            .with_member() \
            .order_by('-joined_at')
        return self.prefetch_related(
	        Prefetch('topic_members', queryset=qs)
        )
    
    def with_member_count(self):
        TopicMember = self.get_model(self.TOPIC_MEMBER_MODEL)
        qs = TopicMember.objects.count_members()
        return self.annotate(
            member_count=Coalesce(
                Subquery(qs, output_field=IntegerField()), 0
            )
        )

    def accessible_by(self, user):
        TopicMember = self.get_model(self.TOPIC_MEMBER_MODEL)
        topic_member_accessable_statuses = TopicMember.get_accessible_statuses()
        topic_accessable_statuses = self.model.get_accessible_statuses()
        conditions = Q(created_by=user)
        conditions |= Q(
			Q(status__in=topic_accessable_statuses) &
			Q(topic_members__member=user) &
			Q(topic_members__status__in=topic_member_accessable_statuses)
		)
        return self.filter(conditions)
