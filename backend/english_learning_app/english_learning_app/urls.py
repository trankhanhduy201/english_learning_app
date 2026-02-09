"""
URL configuration for english_learning_app project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)
from flashcards.views.users import UserSignature, UserProfileViewSet
from flashcards.views.tokens import RevoleTokenView
from flashcards.views.flashcards import TopicViewSet, VocabularyViewSet


urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),

    # JWT endpoints
    path('token', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify', TokenVerifyView.as_view(), name='token_verify'),
    path('token/revoke', RevoleTokenView.as_view(), name="token_revoke"),

    # User
    path(
        'user/profile',
        UserProfileViewSet.as_view({
            'get': 'retrieve',
            'post': 'create',
            'put': 'update',
            'patch': 'partial_update',
        }),
        name='user_profile',
    ),
    path('user/gen-signature', UserSignature.as_view(), name='user_gen_signature'),
]

router = DefaultRouter()
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'vocabularies', VocabularyViewSet, basename='vocabulary')
urlpatterns += router.urls

if settings.DEBUG:
    import debug_toolbar
    from django.conf.urls import include

    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
