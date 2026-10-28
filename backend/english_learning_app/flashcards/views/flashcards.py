import re
from django.db.models import Q
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from shared.views.bases import BaseModelViewSet
from shared.views.mixins import BulkDestroyModelMixin, OwnerListModelMixin
from flashcards.serializers.topics import (
	RetrieveTopicSerializer,
	CreateTopicSerializer,
	UpdateTopicSerializer
)
from flashcards.serializers.vocabularies import (
	RetrieveVocabularySerializer,
	CreateVocabularySerializer,
	UpdateVocabularySerializer,
	CreateImportVocabulariesSerializer
)
from flashcards.serializers.requests import (
	RequestImportVocabulariesSerializer
)
from flashcards.views.paginations import CustomPageNumberPagination
from flashcards.models import Topic, Vocabulary
from flashcards.filters import VocabularyFilter, TopicFilter
from flashcards.utilities.tasks import generate_vocab_audio_async
from flashcards.services.vocabularies import vocabulary_import_service
from flashcards.permissions import CanBulkDeleteVocab, IsAccessable

User = get_user_model()


class TopicViewSet(OwnerListModelMixin, BaseModelViewSet, BulkDestroyModelMixin):
	queryset = Topic.objects.all()
	serializer_class = RetrieveTopicSerializer
	create_serializer_class = CreateTopicSerializer
	update_serializer_class = UpdateTopicSerializer
	filterset_class = TopicFilter
	pagination_class = CustomPageNumberPagination
	permission_classes = [IsAccessable]
	auto_add_created_by = True

	def get_queryset(self, **kwargs):
		return super().get_queryset(**kwargs).with_defaults()


class VocabularyViewSet(BaseModelViewSet, BulkDestroyModelMixin):
	queryset = Vocabulary.objects.all()
	serializer_class = RetrieveVocabularySerializer
	create_serializer_class = CreateVocabularySerializer
	update_serializer_class = UpdateVocabularySerializer
	filterset_class = VocabularyFilter
	permission_classes = [IsAccessable, CanBulkDeleteVocab]
	auto_add_created_by = True

	create_import_serializer_class = CreateImportVocabulariesSerializer
	request_import_serializer_class = RequestImportVocabulariesSerializer

	def get_queryset(self, **kwargs):
		return super().get_queryset().with_defaults(
			language=self.request.GET.get('lang', None),
			includes=self.request.GET.get('with', '').split(',')
		)
	
	@action(detail=False, methods=['post'], url_path='generate-audio')
	def generate_audio(self, request, *args, **kwargs):
		topic_id = request.GET.get('topic_id')
		if topic_id:
			generate_vocab_audio_async(
				Vocabulary.objects.get_ids_has_no_audio(topic_id), 
				user_id=request.user.pk
			)
			
		return Response(status=status.HTTP_204_NO_CONTENT)
		
	@action(detail=False, methods=['post'], url_path='import')
	def bulk_import(self, request, *args, **kwargs):
		rq_serializer = self.request_import_serializer_class(data=request.data)
		if not rq_serializer.is_valid():
			return Response(rq_serializer.errors, status=400)
		
		import_type = rq_serializer.validated_data.pop('import_type')
		import_func = f'import_{import_type}'
		data_import = getattr(self, import_func)(request, rq_serializer.validated_data)
		
		serializer = self.create_import_serializer_class(
			data=data_import, many=True
		)
		if serializer.is_valid():
			serializer.save()
			# vocab_ids = list(serializer.instance.values_list('id', flat=True))
			vocab_ids = [vocab.id for vocab in serializer.instance]
			generate_vocab_audio_async(vocab_ids, user_id=request.user.pk)
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
		
	def import_text(self, request, validated_data):
		return vocabulary_import_service.parse_import_text(request.user.id, **validated_data)
			  

	# Below code for using simple filtering without defining filterset
	# Note that using filterset_fields and filterset_class together is not supported.
	# filter_backends = [DjangoFilterBackend]
	# filterset_fields = ['topic__id']

	# Below code for using search field that is pass to query url
	# This can combine with OtherFilter
	# filter_backends = [filters.SearchFilter]
	# search_fields = ['word', 'translations__translation']