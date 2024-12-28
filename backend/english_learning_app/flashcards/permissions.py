from rest_framework.permissions import IsAdminUser


class IsOwner(IsAdminUser):
	def has_permission(self, request, view):
		return request.user.is_staff

	def has_object_permission(self, request, view, obj):
		return self.has_permission(request, view) or obj.created_by == request.user
