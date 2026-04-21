from django.db.models import OuterRef, Exists, Q, Prefetch, Subquery, IntegerField
from django.db.models.functions import Coalesce
from flashcards.querysets.bases import BaseQuerySet
from flashcards.querysets.mixins import OwnerMixin


class TopicQuerySet(BaseQuerySet, OwnerMixin):
    TOPIC_MEMBER_MODEL = 'flashcards.TopicMember'
    
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

        topic_member_qs = TopicMember.objects.filter(
            member=user,
            status__in=topic_member_accessable_statuses,
            topic=OuterRef('pk')
        )
        conditions |= Q(
			Q(status__in=topic_accessable_statuses) &
			Exists(topic_member_qs)
		)
        return self.filter(conditions)
