from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.conf import settings
from django.utils.module_loading import import_string
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.exceptions import ValidationError as DRFValidationError
from rest_framework_simplejwt.exceptions import TokenError


def get_access_token_from_request(request):
    headers = request.get("headers", [])
    for key, value in headers:
        if key.lower() != b"authorization":
            continue

        auth_value = value.decode("utf-8").strip()
        auth_parts = auth_value.split(" ", 1)
        if len(auth_parts) == 2 and auth_parts[0].lower() == "bearer":
            return auth_parts[1]

    query_string = request.get("query_string", b"").decode("utf-8")
    query_params = parse_qs(query_string)
    query_token = query_params.get("token") or query_params.get("access_token")
    if query_token:
        return query_token[0]

    return None


def get_default_authentication_class():
    class_paths = settings.REST_FRAMEWORK.get("DEFAULT_AUTHENTICATION_CLASSES", [])
    if not class_paths:
        raise AuthenticationFailed("Authentication backend is not configured.")

    class_ref = class_paths[0]
    return import_string(class_ref) if isinstance(class_ref, str) else class_ref


def get_verify_serializer_class():
    serializer_path = settings.SIMPLE_JWT.get("TOKEN_VERIFY_SERIALIZER")
    if not serializer_path:
        raise AuthenticationFailed("Token verify serializer is not configured.")
    return import_string(serializer_path)


class JWTAuthMiddleware:
    def __init__(self, app):
        self.app = app
        self.auth_class = get_default_authentication_class()
        self.verify_serializer_class = get_verify_serializer_class()

    @database_sync_to_async
    def authenticate_request(self, request):
        raw_token = get_access_token_from_request(request)
        if not raw_token:
            raise AuthenticationFailed("Authentication credentials were not provided.")

        verify_serializer = self.verify_serializer_class(data={"token": raw_token})
        verify_serializer.is_valid(raise_exception=True)

        authenticator = self.auth_class()
        validated_token = authenticator.get_validated_token(raw_token)
        user = authenticator.get_user(validated_token)
        if not getattr(user, "is_active", False):
            raise AuthenticationFailed("User not found or inactive.")
        return user

    async def __call__(self, scope, receive, send):
        try:
            user = await self.authenticate_request(scope)
        except (AuthenticationFailed, DRFValidationError, TokenError):
            await send({"type": "websocket.close", "code": 4001})
            return

        scope["user"] = user
        return await self.app(scope, receive, send)

