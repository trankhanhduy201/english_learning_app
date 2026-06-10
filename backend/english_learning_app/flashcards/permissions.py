from rest_framework import permissions
from shared.permissions import IsOwnerMixin
from flashcards.models import Topic, TopicMember, Vocabulary


class CanSubscribeTopic(IsOwnerMixin, permissions.BasePermission):
	def has_permission(self, request, view):
		return (
			super().has_permission(request, view)
			and request.method == 'POST'
		)

	def has_object_permission(self, request, view, obj):
		if not isinstance(obj, Topic):
			return False

		if super().has_object_permission(request, view, obj):
			return False

		if obj.status != Topic.TopicStatusEnums.PUBLIC:
			return False

		topic_member = (
			TopicMember.objects
			.filter(topic=obj, member=request.user)
			.only('status')
			.first()
		)

		topic_member_status = getattr(topic_member, 'status', None)
		if topic_member_status == TopicMember.TopicMemberStatusEnums.BLOCK:
			return False
		
		return True

class IsAccessable(IsOwnerMixin, permissions.BasePermission):
	def _has_topic_permission(self, request, view, topic):
		# Allow access if the user is the owner
		if super().has_object_permission(request, view, topic):
			return True

		# Check if the user is a member with EDITABLE status
		topic_member = TopicMember.objects \
			.filter(topic=topic, member=request.user) \
			.only('status') \
			.first()
		
		# Allow user access topic in GET/HEAD/OPTIONS requests except blocked users
		topic_member_status = getattr(topic_member, 'status', None)
		if request.method in permissions.SAFE_METHODS:
			return (
				topic.status == Topic.TopicStatusEnums.PUBLIC and
				topic_member_status != TopicMember.TopicMemberStatusEnums.BLOCK
			)
		
		# For other requests like PUT/DELETE, only allow EDITABLE members regardless of topic status
		return topic_member_status == TopicMember.TopicMemberStatusEnums.EDITABLE

	def _has_vocabulary_permission(self, request, view, vocabulary):
		# Always allow access if the user is the owner
		topic = vocabulary.topic
		if self.has_ownership(request, view, topic):
			return True

		# Check topic permission first
		if not topic or not self._has_topic_permission(request, view, topic):
			return False
		
		# Allow read-only access
		if request.method in permissions.SAFE_METHODS:
			return True

		# Check ownership of the vocabulary
		return self.has_ownership(request, view, vocabulary)
	
	def has_permission(self, request, view):
		# Object-level permissions will handle detail routes.
		# This hook is mainly for create actions (no object yet).
		if request.method in permissions.SAFE_METHODS:
			return True

		action = getattr(view, 'action', None)
		queryset = getattr(view, 'queryset', None)
		model = getattr(queryset, 'model', None)

		# Enforce topic permission before creating a new vocabulary
		verifying_actions = [
			'create',
			'bulk_import'
		]
		if request.method == 'POST' and action in verifying_actions and model is Vocabulary:
			topic_id = request.data.get('topic') or request.data.get('topic_id')
			if not topic_id:
				return False
			
			topic = Topic.objects \
				.only('id', 'created_by', 'status') \
				.filter(id=topic_id) \
				.first()
			if not topic:
				return False
			
			return self._has_topic_permission(request, view, topic)

		return True

	def has_object_permission(self, request, view, obj):
		if isinstance(obj, Topic):
			return self._has_topic_permission(request, view, obj)
		
		if isinstance(obj, Vocabulary):
			return self._has_vocabulary_permission(request, view, obj)
		
		return False
		
		
