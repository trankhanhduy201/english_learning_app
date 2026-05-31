import re
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from flashcards.serializers.topics import (
	RetrieveTopicSerializer,
	CreateTopicSerializer,
	UpdateTopicSerializer
)
from flashcards.serializers.topic_members import (
	RetrieveListTopicMembersSerializer,
	CreateListTopicMembersSerializer,
	UpdateListTopicMembersSerializer
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
from flashcards.models import TopicMember
from flashcards.views.bases import BaseModelViewSet
from flashcards.views.mixins import BulkDestroyModelMixin, OwnerListModelMixin
from flashcards.views.paginations import CustomPageNumberPagination
from flashcards.models import Topic, Vocabulary
from flashcards.filters import VocabularyFilter, TopicFilter
from flashcards.utilities.tasks import generate_vocab_audio_async
from flashcards.services.vocabularies import VocabularyImportService
from flashcards.permissions import IsAccessable

User = get_user_model()

vocab_import_service = VocabularyImportService()


class TopicViewSet(OwnerListModelMixin, BaseModelViewSet, BulkDestroyModelMixin):
	queryset = Topic.objects.all()
	serializer_class = RetrieveTopicSerializer
	create_serializer_class = CreateTopicSerializer
	update_serializer_class = UpdateTopicSerializer
	filterset_class = TopicFilter
	pagination_class = CustomPageNumberPagination
	permission_classes = [IsAccessable]
	auto_add_created_by = True

	list_topic_members_serializer_class = RetrieveListTopicMembersSerializer
	create_list_topic_members_serializer_class = CreateListTopicMembersSerializer
	update_list_topic_members_serializer_class = UpdateListTopicMembersSerializer

	def get_queryset(self):
		qs = super().get_queryset(skip_owner_filter=True)
		qs = qs.with_topic_members()
		qs = qs.with_owner()
		qs = qs.with_member_count()
		return qs
	  
	@action(detail=True, methods=['get', 'post', 'put'], url_path='members')
	def members(self, request, *args, **kwargs):
		instance = self.get_object()

		# Handle fetch request
		if request.method == 'GET':
			return Response(
				self.list_topic_members_serializer_class(
					instance.topic_members.all(), 
					many=True
				).data, 
				status=status.HTTP_200_OK
			)
		
		# Handle submission request
		if request.method in ['PUT', 'POST']:
			if not isinstance(request.data, list):
				raise ValidationError('Invalid data')

			topic_member_ids = [
				item.get('id')
				for item in request.data
				if item.get('id') is not None
			]
			serializers = self._get_create_update_topic_member_serializer(is_create=False)(
				instance=instance.topic_members.filter(id__in=topic_member_ids), 
				data=request.data,
				many=True
			)
			serializers.is_valid(raise_exception=True)
			serializers.save()
			return Response(
				serializers.data,
				status=status.HTTP_200_OK
			)
		
		return Response(
			'The method is not allowed',
			status=status.HTTP_405_METHOD_NOT_ALLOWED
		)
	
	def _get_create_update_topic_member_serializer(self, is_create=True):
		if is_create:
			return self.create_list_topic_members_serializer_class
		return self.update_list_topic_members_serializer_class
		

class VocabularyViewSet(OwnerListModelMixin, BaseModelViewSet, BulkDestroyModelMixin):
	queryset = Vocabulary.objects.all()
	serializer_class = RetrieveVocabularySerializer
	create_serializer_class = CreateVocabularySerializer
	update_serializer_class = UpdateVocabularySerializer
	filterset_class = VocabularyFilter
	permission_classes = [IsAccessable]
	auto_add_created_by = True

	create_import_serializer_class = CreateImportVocabulariesSerializer
	request_import_serializer_class = RequestImportVocabulariesSerializer

	def get_queryset(self):
		qs = super().get_queryset(skip_owner_filter=True)
		qs = qs.with_owner()

		with_param = self.request.GET.get('with', '').split(',')
		if with_param and 'translations' in with_param:
			qs = qs.with_translations(
				self.request.GET.get('lang', None)
			)
		return qs
	
	@action(detail=False, methods=['post'], url_path='generate-audio')
	def generate_audio(self, request, *args, **kwargs):
		topic_id = request.GET.get('topic_id')
		if topic_id:
			vocab_ids_qs = Vocabulary.objects.\
				filter(Q(topic_id=topic_id) & Q(audio__isnull=True)).\
				values_list('id', flat=True)
			generate_vocab_audio_async(list(vocab_ids_qs), user_id=request.user.pk)
			
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
		return vocab_import_service.parse_import_text(request.user.id, **validated_data)

	@action(detail=False, methods=['post'], url_path='delete')
	def bulk_delete(self, request, *args, **kwargs):
		topic = get_object_or_404(
			Topic, 
			id=request.GET.get('topic_id'), 
			created_by=request.user
		)
		kwargs['conditions'] = {
			'topic__id': topic.id,
			'topic__created_by': request.user
		}
		return super().bulk_delete(request, *args, **kwargs)
			  

	# Below code for using simple filtering without defining filterset
	# Note that using filterset_fields and filterset_class together is not supported.
	# filter_backends = [DjangoFilterBackend]
	# filterset_fields = ['topic__id']

	# Below code for using search field that is pass to query url
	# This can combine with OtherFilter
	# filter_backends = [filters.SearchFilter]
	# search_fields = ['word', 'translations__translation']