from django.urls import path, include
from rest_framework.routers import DefaultRouter
from users.views.users import UserProfileViewSet, UserSignature
from users.views.tokens import RevokeTokenView


router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='user_profile')

urlpatterns = [
    path('gen-signature', UserSignature.as_view(), name='user_signature'),
    path('revoke-token', RevokeTokenView.as_view(), name='revoke_token'),
] + router.urls
