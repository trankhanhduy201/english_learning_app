import secrets
from django.core.signing import Signer, BadSignature
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from flashcards.services.users import UserSignatureService


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
        
        
            