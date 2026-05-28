from rest_framework import status
from rest_framework.response import Response
from flashcards.models import Topic, TopicMember
from flashcards.views.bases import BaseGenericAPIView
from flashcards.permissions import CanSubscribeTopic
from flashcards.serializers.topic_members import CreateListTopicMembersSerializer


class TopicSubscribeView(BaseGenericAPIView):
	"""
	View for handling topic subscription.
	Endpoint: POST /topics/{id}/subscribe/
	"""
	queryset = Topic.objects.all()
	permission_classes = [CanSubscribeTopic]
	serializer_class = CreateListTopicMembersSerializer

	def post(self, request, *args, **kwargs):
		"""
		Subscribe the authenticated user to a topic.
		"""
		topic = self.get_object()
		print(topic)
		
		# Create topic membership using serializer
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
