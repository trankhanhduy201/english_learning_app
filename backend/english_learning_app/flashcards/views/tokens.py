from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from flashcards.models import UserToken


class RevoleTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_token = get_object_or_404(UserToken, user_id=request.user.id)
        user_token.increment_refresh_token_version()
        return Response(status=status.HTTP_204_NO_CONTENT)

