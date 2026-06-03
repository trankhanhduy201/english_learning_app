from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from tokens.views import TokenRevokeView

urlpatterns = [
    path('', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify', TokenVerifyView.as_view(), name='token_verify'),
    path('revoke', TokenRevokeView.as_view(), name='token_revoke'),
]
