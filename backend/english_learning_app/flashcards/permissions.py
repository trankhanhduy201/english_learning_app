from rest_framework import permissions
from flashcards.models import Topic


class IsAdminMixin:
	def has_permission(self, request, view):
		return request.user.is_staff
	

class IsOwnerMixin:
	def has_object_permission(self, request, view, obj):
		return obj.created_by == request.user
	

class IsOwner(IsOwnerMixin, permissions.BasePermission):
	pass


class IsTopicAccess(IsOwner):
	def has_object_permission(self, request, view, obj):
		if super().has_object_permission(request, view, obj):
			return True
		return isinstance(obj, Topic)		
