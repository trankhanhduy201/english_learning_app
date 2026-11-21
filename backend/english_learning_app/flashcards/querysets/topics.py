from django.db.models import OuterRef, Exists, Q, Prefetch, Subquery, IntegerField, Count
from django.db.models.functions import Coalesce
from flashcards.querysets.bases import BaseQuerySet
from flashcards.querysets.mixins import OwnerMixin


class TopicQuerySet(BaseQuerySet, OwnerMixin):
    TOPIC_MEMBER_MODEL = 'flashcards.TopicMember'
    VOCAB_MODEL = 'flashcards.Vocabulary'

    def with_defaults(self):
        qs = (
            self.with_owner()
                .with_owner_profile()
                .with_member_count()
                .with_vocab_count()
        )
        return qs
    
    def with_topic_members(self, includes=[], force_all_members=False, force_included_members=[]):
        TopicMember = self.get_model(self.TOPIC_MEMBER_MODEL)
        qs = TopicMember.objects.order_by('-joined_at')

        if force_all_members is False:
            qs = qs.joined_member(force_included_members)

        if 'member' in includes:
            qs = qs.with_member()

        return self.prefetch_related(
	        Prefetch('topic_members', queryset=qs)
        )

    def with_topic_member_by(self, user):
        TopicMember = self.get_model(self.TOPIC_MEMBER_MODEL)
        qs = (
            TopicMember.objects
                .order_by('-joined_at')
                .filter(member=user)
        )

        return self.prefetch_related(
            Prefetch('topic_members', queryset=qs)
        )

    # subquery way for counting topic members
    def with_member_count(self):
        TopicMember = self.get_model(self.TOPIC_MEMBER_MODEL)
        qs = TopicMember.objects.count_members()
        return self.annotate(
            member_count=Coalesce(
                Subquery(
                    qs.filter(topic=OuterRef('pk')), 
                    output_field=IntegerField()
                ), 0
            )
        )

    # postgresql (filter count distinct + join + group by)
    # mysql (case when counting + join + group by)
    # def with_member_count(self):
    #     TopicMember = self.get_model(self.TOPIC_MEMBER_MODEL)
    #     accessible_statuses = TopicMember.get_accessible_statuses()
    #     return self.annotate(
    #         subscriber_count=Count(
    #             'topic_members',
    #             distinct=True,
    #             filter=Q(
    #                 topic_members__status__in=accessible_statuses
    #             )
    #         )
    #     )

    def with_vocab_count(self):
        Vocab = self.get_model(self.VOCAB_MODEL)
        qs = Vocab.objects.count_vocabs()
        return self.annotate(
            vocab_count=Coalesce(
                Subquery(
                    qs.filter(topic=OuterRef('pk')), 
                    output_field=IntegerField()
                ), 0
            )
        )

    # def with_vocab_count(self):
    #     return self.annotate(
    #         vocab_count=Count('vocabularies', distinct=True)
    #     )

    def trending(self, limit=4):
        return (
            self.with_owner()
                .with_owner_profile()
                .with_member_count()
                .with_vocab_count()
                .order_by('-member_count', '-id')[:limit]
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

    def only_topic_of(self, user):
        TopicMember = self.get_model(self.TOPIC_MEMBER_MODEL)
        topic_member_qs = (
            TopicMember.objects
                .accessible()
                .filter(
                    member=user,
                    topic=OuterRef('pk')
                )
        )

        return self.filter(
            Q(created_by=user) | 
            Q(Exists(topic_member_qs))
        )

    def except_blocked_member_by(self, user):
        TopicMember = self.get_model(self.TOPIC_MEMBER_MODEL)

        topic_member_qs = (
            TopicMember.objects
                .inaccessible()
                .filter(
                    member=user,
                    topic=OuterRef('pk')
                )
        )
        return self.filter(
            ~Exists(topic_member_qs)
        )
