from rest_framework.response import Response

from flashcards.models import Topic, TopicMember, Vocabulary
from flashcards.serializers.topics import TrendingTopicSerializer
from shared.views.bases import BaseAPIView


class DashboardSummaryView(BaseAPIView):
    def get(self, request, *args, **kwargs):
        owned_topic_count = (
            Topic.objects
                .filter(created_by=request.user)
                .count()
        )
        owned_vocab_count = (
            Vocabulary.objects
                .filter(created_by=request.user)
                .count()
        )
        member_count = (
            TopicMember.objects
                .joined_member()
                .by_topic_owner(request.user)
                .count()
        )
        joined_topic_count = (
            TopicMember.objects
                .joined_member()
                .filter(member=request.user)
                .count()
        )
        trending_topics = TrendingTopicSerializer(
            Topic.objects.trending(limit=4),
            many=True
        ).data

        return Response({
            'own_topic_count': owned_topic_count,
            'own_vocab_count': owned_vocab_count,
            'member_count': member_count,
            'joined_topic_count': joined_topic_count,
            'trending_topics': trending_topics,
        })
