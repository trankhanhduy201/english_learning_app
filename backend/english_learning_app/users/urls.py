from django.urls import path
from users.views.users import UserProfileViewSet, UserSignature
from users.views.tokens import RevokeTokenView


urlpatterns = [
    path(
        '',
        UserProfileViewSet.as_view({
            'get': 'retrieve',
            'post': 'create',
            'put': 'update',
            'patch': 'partial_update',
        }),
        name='user_profile'
    ),
    path('signature', UserSignature.as_view(), name='user_signature'),
    path('revoke-token', RevokeTokenView.as_view(), name='revoke_token'),
]
