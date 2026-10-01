from django.db.models import OuterRef, Exists, Q, Prefetch, Subquery, IntegerField, Count
from django.db.models.functions import Coalesce
from flashcards.querysets.bases import BaseQuerySet
from flashcards.querysets.mixins import OwnerMixin


class TopicQuerySet(BaseQuerySet, OwnerMixin):
    TOPIC_MEMBER_MODEL = 'flashcards.TopicMember'
    VOCAB_MODEL = 'flashcards.Vocabulary'

    def with_defaults(self, **kwargs):
        qs = (
            self.with_topic_members()
            .with_owner()
            .with_member_count()
        )
        return qs
    
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

    def with_subscriber_count(self):
        TopicMember = self.get_model(self.TOPIC_MEMBER_MODEL)
        accessible_statuses = TopicMember.get_accessible_statuses()
        return self.annotate(
            subscriber_count=Count(
                'topic_members',
                filter=Q(topic_members__status__in=accessible_statuses),
            )
        )

    def trending(self, limit=4):
        return (
            self.with_owner()
            .with_subscriber_count()
            .order_by('-subscriber_count', '-id')[:limit]
        )

    def search_by_keyword(self, keyword):
        Vocabulary = self.get_model(self.VOCAB_MODEL)
        vocab_qs = Vocabulary.objects.filter(
            topic=OuterRef('pk'),
            word__icontains=keyword
        )
        return self.filter(
            Q(name__icontains=keyword) |
            Q(descriptions__icontains=keyword) |
            Q(Exists(vocab_qs))
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
