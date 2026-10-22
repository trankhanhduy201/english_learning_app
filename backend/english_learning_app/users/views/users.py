from django.contrib.auth import get_user_model
from shared.views.bases import BaseModelViewSet
from users.serializers.users import (
    RetrieveUserSerializer,
    CreateUserSerializer,
    UpdateUserSerializer,
)

User = get_user_model()


class UserProfileViewSet(BaseModelViewSet):
    serializer_class = RetrieveUserSerializer
    create_serializer_class = CreateUserSerializer
    update_serializer_class = UpdateUserSerializer
    queryset = User.objects.all()

    def get_authenticators(self):
        # Some authentication backends may raise before permissions are checked.
        # We explicitly disable auth for the create (POST) endpoint.
        if getattr(self, "request", None) is not None and self.request.method == "POST":
            return []
        return super().get_authenticators()
    
    def get_permissions(self):
        # For the create (POST) endpoint, we allow anyone to register.
        if self.request.method == "POST":
            return []
        return super().get_permissions()

    def get_queryset(self):
        return self.queryset.select_related("profile")

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        return queryset.get(id=self.request.user.id)