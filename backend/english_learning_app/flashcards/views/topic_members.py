from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.mixins import ListModelMixin
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from flashcards.models import Topic, TopicMember
from flashcards.permissions import CanSubscribeTopic, CanUnsubscribeTopic, IsAccessable
from flashcards.serializers.topic_members import (
	RetrieveTopicMembersSerializer,
	UpdateTopicMembersSerializer,
)
from flashcards.serializers.topics import CurrentTopicMemberSerializer
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
		if not isinstance(data, list) and not isinstance(data, dict):
			raise ValidationError('Invalid data')

		if isinstance(data, list):
			topic_member_ids = [
				item['id']
				for item in data
				if isinstance(item, dict) and item.get('id') is not None
			]

			instance = topic.topic_members.filter(id__in=topic_member_ids)
			many = True

		elif isinstance(data, dict):
			topic_member_id = data.get('id')
			if topic_member_id is None:
				raise ValidationError('Missing id in data')

			instance = topic.topic_members.filter(id=topic_member_id).first()
			many = False

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

	def post(self, request, *args, **kwargs):
		topic = self.get_object()
		topic_member = (
			TopicMember.objects
				.filter(
					member=request.user,
					topic=topic,
				).first()
		)

		if topic_member is not None:
			topic_member.status = TopicMember.TopicMemberStatusEnums.READ_ONLY
			topic_member.save(update_fields=['status'])
		else:
			topic_member = TopicMember(
				member=request.user,
				topic=topic,
				status=TopicMember.TopicMemberStatusEnums.PENDING,
			)
			topic_member.save()

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

	def post(self, request, *args, **kwargs):
		topic = self.get_object()
		topic_member = get_object_or_404(
			TopicMember,
			member=request.user,
			topic=topic,
		)

		previous_status = topic_member.status
		topic_member.status = TopicMember.TopicMemberStatusEnums.LEAVING
		if previous_status != TopicMember.TopicMemberStatusEnums.PENDING:
			topic_member.save(update_fields=['status'])
		else:
			topic_member.delete()
		
		return Response(
			data=self.serializer_class(
				instance=topic_member,
				context={'request': request, 'topic': topic},
			).data,
			status=status.HTTP_200_OK,
		)
