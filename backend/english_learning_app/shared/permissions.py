from rest_framework import exceptions, permissions
from flashcards.models import Topic, TopicMember, Vocabulary


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