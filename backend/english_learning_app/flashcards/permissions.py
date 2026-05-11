from rest_framework import permissions
from flashcards.models import Topic, TopicMember, Vocabulary
from flashcards.constants import SUBSCRIBE_ACTION_URL_PATH


class IsAdminMixin:
	def has_permission(self, request, view):
		return request.user.is_staff
	

class IsOwnerMixin:
	def has_ownership(self, request, view, obj):
		return obj.created_by == request.user

	def has_object_permission(self, request, view, obj):
		return self.has_ownership(request, view, obj)
	

class IsOwner(IsOwnerMixin, permissions.BasePermission):
	pass


class IsAccessable(IsOwner):
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
		# Or allow users to subscribe to a topic if they are not members yet
		action = getattr(view, 'action', None)
		verifying_actions = [
			SUBSCRIBE_ACTION_URL_PATH
		]
		return (
			(request.method == 'POST' and action in verifying_actions) or
			topic_member_status == TopicMember.TopicMemberStatusEnums.EDITABLE
		)

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
		
		
