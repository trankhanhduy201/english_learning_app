from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.mixins import ListModelMixin
from rest_framework.response import Response

from flashcards.models import Topic, TopicMember
from flashcards.permissions import CanSubscribeTopic, CanUnsubscribeTopic, IsAccessable
from flashcards.serializers.topic_members import (
	RetrieveTopicMembersSerializer,
	UpdateTopicMembersSerializer,
)
from flashcards.serializers.topics import CurrentTopicMemberSerializer
from flashcards.services.topic_members import topic_member_service
from shared.views.bases import BaseGenericAPIView


class TopicMemberView(BaseGenericAPIView, ListModelMixin):
	"""Nested topic member list + bulk-update endpoint."""
	queryset = TopicMember.objects.all()
	serializer_class = RetrieveTopicMembersSerializer
	update_serializer_class = UpdateTopicMembersSerializer
	lookup_url_kwarg = 'topic_pk'
	permission_classes = [IsAccessable]
	http_method_names = ['get', 'put', 'options']

	def get_queryset(self):
		topic_pk = self.kwargs.get('topic_pk')
		return (
			self.queryset
				.with_member()
				.accessible()
				.filter(topic_id=topic_pk)
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
		data = request.data

		instance, many = (
			topic_member_service
				.resolve_for_update(topic, data)
		)

		serializer = self.get_update_serializer_class()(
			instance=instance,
			data=data,
			many=many,
			context={'request': request},
		)
		serializer.is_valid(raise_exception=True)
		serializer.save()

		return Response(serializer.data, status=status.HTTP_200_OK)


class TopicSubscribeView(BaseGenericAPIView):
	"""Create-only nested view for topic subscription."""
	queryset = Topic.objects.all()
	lookup_url_kwarg = 'topic_pk'
	serializer_class = CurrentTopicMemberSerializer
	permission_classes = [CanSubscribeTopic]
	http_method_names = ['post', 'options']

	def get_queryset(self):
		return (
			self.queryset
				.with_owner()
				.with_topic_members(
					user=self.request.user
				)
		)

	def post(self, request, *args, **kwargs):
		topic = self.get_object()
		topic_member = (
			topic_member_service
				.subscribe(request.user, topic)
		)

		return Response(
			data=self.serializer_class(
				instance=topic_member,
				context={'request': request, 'topic': topic},
			).data,
			status=status.HTTP_200_OK,
		)


class TopicUnsubscribeView(BaseGenericAPIView):
	"""Delete-only nested view for topic unsubscription."""
	queryset = Topic.objects.all()
	lookup_url_kwarg = 'topic_pk'
	serializer_class = CurrentTopicMemberSerializer
	permission_classes = [CanUnsubscribeTopic]
	http_method_names = ['post', 'options']

	def get_queryset(self):
		return (
			self.queryset
				.with_owner()
				.with_topic_members(
					user=self.request.user
				)
		)

	def post(self, request, *args, **kwargs):
		topic = self.get_object()
		topic_member = (
			topic_member_service
				.unsubscribe(request.user, topic)
		)

		return Response(
			data=self.serializer_class(
				instance=topic_member,
				context={'request': request, 'topic': topic},
			).data,
			status=status.HTTP_200_OK,
		)