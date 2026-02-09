from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from flashcards.services.users import UserSignatureService
from flashcards.views.bases import BaseModelViewSet
from flashcards.serializers.users import (
    RetrieveUserSerializer,
    CreateUserSerializer,
    UpdateUserSerializer,
)

User = get_user_model()

user_signature_service = UserSignatureService()


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

    def get_queryset(self):
        return self.queryset.select_related("profile")

    def get_object(self):
        queryset = self.filter_queryset(self.get_queryset())
        return queryset.get(id=self.request.user.id)
    

class UserSignature(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if not 'value' in request.data:
            return Response({
                'detail': 'Invalid value'
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            'signature': user_signature_service.sign(
                request.user.id, 
                request.data['value']
            )
        })            