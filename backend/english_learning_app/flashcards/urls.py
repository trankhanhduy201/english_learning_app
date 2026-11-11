from django.urls import path, include
from rest_framework.routers import DefaultRouter
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


router = DefaultRouter()
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'vocabularies', VocabularyViewSet, basename='vocabulary')

vocabulary_patterns = [
    path('', VocabularyViewSet.as_view({'get': 'list', 'post': 'create'}), name='topic_vocabulary_list'),
    path('<int:pk>/', VocabularyViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='topic_vocabulary_detail'),
    path('bulk-delete/', VocabularyViewSet.as_view({'delete': 'bulk_delete'}), name='topic_vocabulary_bulk_delete'),
]

# Nested topic routes
topic_patterns = [
    path('<int:topic_pk>/members/', TopicMemberView.as_view(), name='topic_members'),
    path('<int:topic_pk>/subscribe/', TopicSubscribeView.as_view(), name='topic_subscribe'),
    path('<int:topic_pk>/unsubscribe/', TopicUnsubscribeView.as_view(), name='topic_unsubscribe'),
    path('<int:topic_pk>/vocabularies/', include(vocabulary_patterns)),
    path('<int:topic_pk>/vocabularies/import/', TopicVocabularyImportView.as_view(), name='topic_vocabulary_import'),
]

dashboard_patterns = [
    path('summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
]

urlpatterns = [
    path('topics/', include(topic_patterns)),
    path('dashboard/', include(dashboard_patterns)),
] + router.urls
