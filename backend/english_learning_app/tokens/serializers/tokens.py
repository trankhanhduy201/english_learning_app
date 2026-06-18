import base64
from rest_framework import serializers
from rest_framework_simplejwt.serializers import (
    TokenObtainPairSerializer,
    TokenRefreshSerializer,
    TokenVerifySerializer,
)
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.settings import api_settings
from rest_framework_simplejwt.tokens import UntypedToken
from tokens.models import UserToken
from tokens.authentications import check_token_version
from tokens.views import REFRESH_TOKEN_COOKIE_NAME
from users.services.users import UserSignatureService


class TokenSerializerMixin:
    def validate(self, attrs):
        if hasattr(self, 'token_class'):
            token = self.token_class(attrs[self.token_class.token_type])
        else:
            token = UntypedToken(attrs["token"])

        user_id = token.payload.get(api_settings.USER_ID_CLAIM, None)
        token_version = token.payload.get('token_version', None)
        if check_token_version(user_id, token_version) is False:
            raise ValidationError("Token has been revoked")
        return super().validate(attrs)


class CustomTokenVerifySerializer(TokenSerializerMixin, TokenVerifySerializer):
    pass


class CustomTokenRefreshSerializer(TokenSerializerMixin, TokenRefreshSerializer):
    refresh = serializers.CharField(required=False)
    refresh_key = serializers.CharField()

    def validate_refresh_key(self, value):
        request = self.context.get('request') if self.context else None
        try:
            refresh_token = request.COOKIES.get(REFRESH_TOKEN_COOKIE_NAME)
            token = self.token_class(refresh_token)

            user_id = token.payload.get(api_settings.USER_ID_CLAIM)
            if not user_id:
                raise ValueError("Can not parse user id")

            signed_key = base64.urlsafe_b64decode(value).decode()
            return UserSignatureService().unsign(
                user_id,
                signed_key,
            )
        except Exception:
            raise serializers.ValidationError("Invalid refresh key.")

    def validate(self, attrs):
        request = self.context.get('request') if self.context else None
        refresh_key = attrs.get('refresh_key')

        try:
            attrs['refresh'] = request.COOKIES.get(refresh_key)
        except Exception:
            attrs['refresh'] = ""
        
        return super().validate(attrs)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        if not getattr(self.user, "is_active", True):
            raise serializers.ValidationError({
                "detail": "Account is not activated. Please check your email to activate it."
            })

        try:
            signed_key = UserSignatureService().sign(self.user.id, 'refresh_token')
            data['refresh_token_key'] = base64.urlsafe_b64encode(signed_key.encode()).decode()
        except Exception as e:
            raise serializers.ValidationError({
                "detail": "Refresh token key is not found"
            })

        return data

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
        user_token = UserToken.objects.create(
            user=user, refresh_token_version=1
        )
        return user_token.refresh_token_version
