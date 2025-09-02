from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer, 
    TokenVerifySerializer, 
    TokenRefreshSerializer
)
from flashcards.models import UserToken
from flashcards.serializers.mixins import TokenSerializerMixin


class CustomTokenVerifySerializer(TokenSerializerMixin, TokenVerifySerializer):
    pass


class CustomTokenRefreshSerializer(TokenSerializerMixin, TokenRefreshSerializer):
    pass


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(self, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['is_staff'] = user.is_staff
        token['full_name'] = self.get_user_full_name(user)
        token['token_version'] = self.get_refresh_token_version(user)

        return token
    
    @classmethod
    def get_user_full_name(self, user):
        full_name = user.get_full_name()
        return full_name if full_name else user.username
    
    @classmethod
    def get_refresh_token_version(self, user):
        if hasattr(user, 'usertoken'):
            return user.usertoken.refresh_token_version
        user_token = UserToken.objects.create(user=user, refresh_token_version=1)
        return user_token.refresh_token_version