from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.mixins import ListModelMixin
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from flashcards.models import Topic, TopicMember
from flashcards.permissions import CanSubscribeTopic, CanUnsubscribeTopic, IsAccessable
from flashcards.serializers.topic_members import (
	CreateListTopicMembersSerializer,
	RetrieveListTopicMembersSerializer,
	UpdateListTopicMembersSerializer,
)
from shared.views.bases import BaseGenericAPIView


class TopicMemberView(BaseGenericAPIView, ListModelMixin):
	"""Nested topic member list + bulk-update endpoint."""
	queryset = TopicMember.objects.all()
	serializer_class = RetrieveListTopicMembersSerializer
	update_serializer_class = UpdateListTopicMembersSerializer
	lookup_url_kwarg = 'topic_pk'
	permission_classes = [IsAccessable]
	http_method_names = ['get', 'put', 'options']

	def get_queryset(self):
		topic_pk = self.kwargs.get('topic_pk')
		return (
			self.queryset
			.filter(topic_id=topic_pk)
			.select_related('member', 'member__profile')
			.ordered_by_status()
		)

	def _check_topic_permissions(self, request, *args, **kwargs):
		topic = get_object_or_404(Topic, pk=self.kwargs.get('topic_pk'))
		self.check_object_permissions(request, topic)
		return topic

	def get(self, request, *args, **kwargs):
		self._check_topic_permissions(request, *args, **kwargs)
		return self.list(request, *args, **kwargs)

	def put(self, request, *args, **kwargs):
		topic = self._check_topic_permissions(request, *args, **kwargs)
		if not isinstance(request.data, list):
			raise ValidationError('Invalid data')

		topic_member_ids = [
			item.get('id')
			for item in request.data
			if item.get('id') is not None
		]
		serializer = self.get_update_serializer_class()(
			instance=topic.topic_members.filter(id__in=topic_member_ids),
			data=request.data,
			many=True,
			context={'request': request},
		)
		serializer.is_valid(raise_exception=True)
		serializer.save()
		return Response(serializer.data, status=status.HTTP_200_OK)


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
