from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter
from flashcards.views.flashcards import (
    TopicVocabularyImportView,
    TopicViewSet,
    VocabularyViewSet,
)
from flashcards.views.topic_members import (
    TopicMemberView,
    TopicSubscribeView,
    TopicUnsubscribeView,
)
from flashcards.views.dashboard import DashboardSummaryView

# Root router
router = DefaultRouter()
router.register(r'topics', TopicViewSet, basename='topic')

# Nested router under a topic: /topics/{topic_pk}/...
nested_router = NestedDefaultRouter(
    router,
    r'topics',
    lookup='topic',
)

# Nested router for vocab: /topics/{topic_pk}/vocabularies/
nested_router.register(
    r'vocabularies',
    VocabularyViewSet,
    basename='topic-vocabulary',
)

# Nested patterns for vocabs
topic_vocab_patterns = [
    path(
        'import/',
        TopicVocabularyImportView.as_view(),
        name='topic-vocabulary-import',
    ),
]

# Nested patterns for topic members
topic_member_patterns = [
    path('members/', TopicMemberView.as_view(), name='topic-members'),
    path('subscribe/', TopicSubscribeView.as_view(), name='topic-subscribe'),
    path('unsubscribe/', TopicUnsubscribeView.as_view(), name='topic-unsubscribe'),
]

# Nested patterns for topic
topic_patterns = [
    path('/', include(topic_member_patterns)),
    path('vocabularies/', include(topic_vocab_patterns)),
]

# Nested patterns for dashboard
dashboard_patterns = [
    path('summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
]

# Main patterns and drf route
urlpatterns = [
    path('dashboard/', include(dashboard_patterns)),
    path('topics/<int:topic_pk>/', include(topic_patterns)),
] + router.urls + nested_router.urls
