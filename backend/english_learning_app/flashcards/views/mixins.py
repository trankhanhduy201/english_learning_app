from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response


class OwnerListModelMixin:
	owner_identify_field = 'created_by'
	  
	def get_owner_filters(self):
		field_name = self.owner_identify_field
		filters = Q(**{f"{field_name}": self.request.user})
		return filters

	def get_queryset(self, **kwargs):
		qs = super().get_queryset()
		skip_owner_filter = kwargs.get('skip_owner_filter', False)
		if not skip_owner_filter:
			owner_filters = self.get_owner_filters()
			return qs.filter(owner_filters)
		return qs


class BulkDestroyModelMixin:
	bulk_delete_owner_field = 'created_by'

	@action(detail=False, methods=['post'], url_path='delete')
	def bulk_delete(self, request, *args, **kwargs):
		try:
			qs = self.get_queryset()
			conditions = kwargs.get('conditions', None)
			if isinstance(conditions, dict) and conditions:
				conditions = kwargs['conditions']

			if not conditions:
				if not qs.model._meta.get_field(self.bulk_delete_owner_field):
					return Response(
						{'detail': 'Bulk delete is not supported for this model.'},
						status=status.HTTP_400_BAD_REQUEST
					)
				conditions = {f"{self.bulk_delete_owner_field}": request.user}

			qs.model.objects.filter(**conditions).delete()
			return Response(status=status.HTTP_204_NO_CONTENT)
		except Exception as e:
			return Response(
				{'detail': 'Unexpected error occurred.', 'error': str(e)},
				status=status.HTTP_500_INTERNAL_SERVER_ERROR
			)