from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from tokens.models import UserToken


class TokenRevokeView(APIView):
    permission_classes = [IsAuthenticated]
    http_method_names = ['post', 'options']

    def post(self, request):
        user_token = get_object_or_404(UserToken, user_id=request.user.id)
        user_token.increment_refresh_token_version()
        return Response(status=status.HTTP_204_NO_CONTENT)
