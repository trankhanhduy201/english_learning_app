from django.contrib.auth.models import User
from django.db.models import Q


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