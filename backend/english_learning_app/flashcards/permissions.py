from rest_framework import permissions
from shared.permissions import IsOwnerMixin, CanBulkDelete, PostOnlyMixin
from flashcards.models import Topic, TopicMember, Vocabulary


class CanJoinTopic(
	PostOnlyMixin, 
	IsOwnerMixin, 
	permissions.IsAuthenticated
):
	def has_object_permission(self, request, view, obj):
		if not isinstance(obj, Topic):
			return False

		if super().has_object_permission(request, view, obj):
			return False

		# if obj.status != Topic.TopicStatusEnums.PUBLIC:
		# 	return False

		topic_member = obj.topic_members.first()
		return (
			topic_member is None or 
			getattr(topic_member, 'is_left', False)
		)


class CanLeaveTopic(
	PostOnlyMixin, 
	IsOwnerMixin, 
	permissions.IsAuthenticated
):
	def has_object_permission(self, request, view, obj):
		if not isinstance(obj, Topic):
			return False

		if super().has_object_permission(request, view, obj):
			return False

		topic_member = obj.topic_members.first()
		if getattr(topic_member, 'is_left', False):
			return False
		
		topic_member_status = getattr(topic_member, 'status', None)
		allow_unsubscribe = [
			TopicMember.TopicMemberStatusEnums.PENDING,
			TopicMember.TopicMemberStatusEnums.EDITABLE,
			TopicMember.TopicMemberStatusEnums.READ_ONLY
		]
		return topic_member_status in allow_unsubscribe


class IsAccessable(IsOwnerMixin, permissions.BasePermission):
	def ask_topic_delete(self, request, view):
		return (
			request.method == 'DELETE' and 
			view.basename == 'topic'
		)

	def _has_topic_permission(self, request, view, topic):
		# Allow access if the user owns the topic.
		if self.has_ownership(request, view, topic):
			return True

		# Deny topic deletion requests from non-owners.
		if self.ask_topic_delete(request, view):
			return False

		# Get the current user's membership status for this topic.
		topic_member_status = (
			TopicMember.objects
				.status_by(topic, request.user)
		)

		# Check read permissions for safe methods (GET, HEAD, OPTIONS).
		if request.method in permissions.SAFE_METHODS:
			# For private topics, only members with READ_ONLY or EDITABLE status can access them.
			if topic.status == Topic.TopicStatusEnums.PRIVATE:
				return topic_member_status in [
					TopicMember.TopicMemberStatusEnums.READ_ONLY,
					TopicMember.TopicMemberStatusEnums.EDITABLE
				]

			# For non-private topics, allow access to all members except those with BLOCK status.
			return topic_member_status not in [
				TopicMember.TopicMemberStatusEnums.BLOCK
			]

		# For other methods (e.g. POST, PUT, PATCH, DELETE),
		# only members with EDITABLE status are allowed, regardless of the topic's status.
		return topic_member_status in [
			TopicMember.TopicMemberStatusEnums.EDITABLE
		]

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

	def has_object_permission(self, request, view, obj):
		if isinstance(obj, Topic):
			return self._has_topic_permission(request, view, obj)
		
		if isinstance(obj, Vocabulary):
			return self._has_vocabulary_permission(request, view, obj)
		
		return False


class CanBulkDeleteTopic(CanBulkDelete):
	pass


class CanBulkDeleteVocab(CanBulkDelete):
	def has_permission(self, request, view):
		if not self.ask_bulk_delete(request, view):
			return True

		if not super().has_permission(request, view):
			return False
		
		topic_id = view.kwargs.get('topic_pk')
		if not topic_id:
			return False

		return Topic.objects.exists_by(
			topic_id, created_by=request.user
		)