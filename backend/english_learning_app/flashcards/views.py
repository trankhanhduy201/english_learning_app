from django.db.models import Prefetch, prefetch_related_objects
from rest_framework import generics, viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated

from flashcards.mixins import OwnerListModelMixin
from flashcards.queryset_utils import get_translation_prefetch_related
from flashcards.serializers import TopicSerializer, VocabularySerializer
from flashcards.models import Topic, Vocabulary, Translation
from flashcards.filters import VocabularyFilter
from flashcards.permissions import IsOwner


class BaseModelViewSet(viewsets.ModelViewSet):
	# permission_classes = [IsAuthenticated, IsOwner]
	filter_backends = [DjangoFilterBackend]

	def perform_create(self, serializer):
		self.perform_create_or_update(serializer)

	def perform_update(self, serializer):
		self.perform_create_or_update(serializer)

	def perform_create_or_update(self, serializer):
		additional = {}
		if self.request.user.is_anonymous is False:
			additional['created_by'] = self.request.user
		serializer.save(**additional)


class TopicViewSet(OwnerListModelMixin, BaseModelViewSet):
	queryset = Topic.objects.all()
	serializer_class = TopicSerializer
	search_fields = ['name']

	def list(self, request, *args, **kwargs):
		import time
		time.sleep(6)
		
		raise EnvironmentError('Test')
		return super(TopicViewSet, self).list(request, *args, **kwargs)

class VocabularyViewSet(OwnerListModelMixin, BaseModelViewSet):
	queryset = Vocabulary.objects.all()
	serializer_class = VocabularySerializer
	filterset_class = VocabularyFilter

	def get_queryset(self):
		qs = super().get_queryset()
		qs = qs.prefetch_related(
			get_translation_prefetch_related(self.request.GET.dict())
		)
		return qs

	# Below code for using simple filtering without defining filterset
	# Note that using filterset_fields and filterset_class together is not supported.
	# filter_backends = [DjangoFilterBackend]
	# filterset_fields = ['topic__id']

	# Below code for using search field that is pass to query url
	# This can combine with OtherFilter
	# filter_backends = [filters.SearchFilter]
	# search_fields = ['word', 'translations__translation']