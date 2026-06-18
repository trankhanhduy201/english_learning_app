from django.db.models import F
from django.conf import settings
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from shared.views.bases import BaseAPIView
from tokens.models import UserToken

REFRESH_TOKEN_COOKIE_NAME = 'refresh_token'

def _get_same_site_setting():
    return 'Lax'

def _get_seceure_setting():
    return not settings.DEBUG

def _get_path_setting():
    return '/token'

def _set_refresh_token_cookie(response, refresh_token):
    response.set_cookie(
        key=REFRESH_TOKEN_COOKIE_NAME,
        value=refresh_token,
        max_age=int(settings.SIMPLE_JWT['REFRESH_TOKEN_LIFETIME'].total_seconds()),
        httponly=True,
        secure=_get_seceure_setting(),
        samesite=_get_same_site_setting(),
        path=_get_path_setting()
    )

def _delete_refresh_token_cookie(response):
    response.delete_cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        samesite=_get_same_site_setting(),
        path=_get_path_setting()
    )

def _making_response_with_cookie(serializer_data, refresh_token=None):
    if 'refresh' in serializer_data:
        del serializer_data['refresh']

    response = Response(serializer_data, status=status.HTTP_200_OK)
    if refresh_token:
        _set_refresh_token_cookie(response, refresh_token)
    
    return response


class CustomTokenObtainPairView(TokenObtainPairView):
    """Override to attach refresh token to cookie"""

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as exc:
            return Response(exc.detail, status=status.HTTP_401_UNAUTHORIZED)
        
        return _making_response_with_cookie(
            serializer.validated_data, 
            refresh_token=serializer.validated_data.get('refresh')
        )
        

class CustomTokenRefreshView(TokenRefreshView):
    """Override to get refresh token from cookie and attach new one to cookie"""

    def post(self, request, *args, **kwargs):
        data = dict(request.data)
        serializer = self.get_serializer(
            data={"refresh_key": data.get("refresh_token_key", None)}
        )
        
        try:
            serializer.is_valid(raise_exception=True)
        except Exception as exc:
            return Response(exc.detail, status=status.HTTP_401_UNAUTHORIZED)
        
        return _making_response_with_cookie(
            serializer.validated_data, 
            refresh_token=serializer.validated_data.get('refresh')
        )


class TokenRevokeView(BaseAPIView):
    http_method_names = ['post', 'options']

    def post(self, request):
        permanent = request.data.get('permanent', False)
        if permanent:
            UserToken.objects.increase_token_version(request.user.id)

        response = Response(status=status.HTTP_204_NO_CONTENT)
        _delete_refresh_token_cookie(response)

        return response
