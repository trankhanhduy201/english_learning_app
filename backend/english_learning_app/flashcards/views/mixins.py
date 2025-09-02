from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response


class OwnerListModelMixin:
	owner_identify_field = 'created_by'

	def get_queryset(self):
		qs = super().get_queryset()
		if isinstance(self.request.user, User) and not self.request.user.is_staff:
			field_name = self.owner_identify_field
			return qs.filter(
				Q(**{f"{field_name}__isnull": False}) |
				Q(**{f"{field_name}": self.request.user})
			)
		return qs


class BulkDestroyModelMixin:
    @action(detail=False, methods=['post'], url_path='delete')
    def bulk_delete(self, request, *args, **kwargs):
        try:
            self.get_queryset().delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'detail': 'Unexpected error occurred.', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )