from rest_framework import status, viewsets
from rest_framework.response import Response
from flashcards.models import Topic, TopicMember
from shared.views.bases import BaseGenericAPIView
from flashcards.permissions import CanSubscribeTopic
from flashcards.serializers.topic_members import CreateListTopicMembersSerializer


class TopicSubscribeView(BaseGenericAPIView):
	"""Create-only nested view for topic subscription."""
	queryset = Topic.objects.all()
	lookup_url_kwarg = 'topic_pk'
	serializer_class = CreateListTopicMembersSerializer
	permission_classes = [CanSubscribeTopic]
	http_method_names = ['post', 'options']

	def post(self, request, *args, **kwargs):
		topic = self.get_object()
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
