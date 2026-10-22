from django.urls import path
from users.views.users import UserProfileViewSet


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
]
