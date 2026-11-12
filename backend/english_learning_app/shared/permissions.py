from rest_framework import permissions


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


class CanBulkDelete(permissions.IsAuthenticated):
    def ask_bulk_delete(self, request, view):
        return (
            request.method == 'DELETE' and
            getattr(view, 'action', None) == 'bulk_delete'
        )