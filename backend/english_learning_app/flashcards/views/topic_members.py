from rest_framework import status
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from flashcards.models import Topic, TopicMember
from shared.views.bases import BaseGenericAPIView
from flashcards.permissions import CanSubscribeTopic, CanUnsubscribeTopic
from flashcards.serializers.topic_members import CreateListTopicMembersSerializer
from flashcards.utilities.tasks import notify_topic_owner_for_subscription_async


class TopicSubscribeView(BaseGenericAPIView):
	"""Create-only nested view for topic subscription."""
	queryset = Topic.objects.all()
	lookup_url_kwarg = 'topic_pk'
	serializer_class = CreateListTopicMembersSerializer
	permission_classes = [CanSubscribeTopic]
	http_method_names = ['post', 'options']

	def post(self, request, *args, **kwargs):
		topic = self.get_object()
		topic_member = TopicMember.objects.filter(
			member=request.user,
			topic=topic,
		).first()
		if topic_member is not None:
			topic_member.status = TopicMember.TopicMemberStatusEnums.READ_ONLY
			topic_member.save(update_fields=['status'])
			return Response(status=status.HTTP_204_NO_CONTENT)

		serializer = self.serializer_class(
			data={
				'member': request.user.id,
				'topic': topic.id,
				'status': TopicMember.TopicMemberStatusEnums.PENDING
			}
		)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(status=status.HTTP_204_NO_CONTENT)


class TopicUnsubscribeView(BaseGenericAPIView):
	"""Delete-only nested view for topic unsubscription."""
	queryset = Topic.objects.all()
	lookup_url_kwarg = 'topic_pk'
	permission_classes = [CanUnsubscribeTopic]
	http_method_names = ['post', 'options']

	def post(self, request, *args, **kwargs):
		topic = self.get_object()
		topic_member = get_object_or_404(
			TopicMember,
			member=request.user,
			topic=topic,
		)
		topic_member.status = TopicMember.TopicMemberStatusEnums.LEAVING
		topic_member.save(update_fields=['status'])
		return Response(status=status.HTTP_204_NO_CONTENT)
