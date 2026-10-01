from django.urls import path, include
from rest_framework.routers import DefaultRouter
from flashcards.views.flashcards import TopicViewSet, VocabularyViewSet
from flashcards.views.topic_members import TopicSubscribeView
from flashcards.views.dashboard import DashboardSummaryView


router = DefaultRouter()
router.register(r'topics', TopicViewSet, basename='topic')
router.register(r'vocabularies', VocabularyViewSet, basename='vocabulary')

# Nested topic routes
topic_patterns = [
    path('<int:topic_pk>/subscribe/', TopicSubscribeView.as_view(), name='topic_subscribe'),
]

dashboard_patterns = [
    path('summary/', DashboardSummaryView.as_view(), name='dashboard_summary'),
]

urlpatterns = [
    path('topics/', include(topic_patterns)),
    path('dashboard/', include(dashboard_patterns)),
] + router.urls
