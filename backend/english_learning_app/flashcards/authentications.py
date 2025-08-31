
from django.db.models import Q
from flashcards.models import UserToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed


def check_token_version(user_id, token_version):
    if not user_id or token_version is None:
        return False
    return UserToken.objects.filter(
        Q(user_id=user_id) &
        Q(refresh_token_version=token_version)
    ).exists()


class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        result = super().authenticate(request)
        if result is None:
            return None

        user, validated_token = result
        if not validated_token:
            raise AuthenticationFailed("Invalid token")
        
        token_version = validated_token.payload.get("token_version", None)
        if check_token_version(user.id, token_version) is False:
            raise AuthenticationFailed("Token has been revoked")

        return (user, validated_token)
