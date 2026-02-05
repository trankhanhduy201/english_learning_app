import secrets
from django.core.signing import Signer, BadSignature
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from flashcards.services.users import UserSignatureService
from flashcards.serializers.users import UserRegisterSerializer


user_signature_service = UserSignatureService()


class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email
        })
    

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


class UserRegisterView(APIView):
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
            },
            status=status.HTTP_201_CREATED,
        )
        
        
            