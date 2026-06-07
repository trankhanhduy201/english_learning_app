from django.urls import path
from rest_framework_simplejwt.views import (
    TokenVerifyView,
)

from tokens.views import CustomTokenObtainPairView, CustomTokenRefreshView, TokenRevokeView

urlpatterns = [
    path('', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('verify', TokenVerifyView.as_view(), name='token_verify'),
    path('revoke', TokenRevokeView.as_view(), name='token_revoke'),
]
