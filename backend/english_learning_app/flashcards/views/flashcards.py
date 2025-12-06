import re
from django.db.models import Q, Prefetch, OuterRef, Count, Subquery, IntegerField
from django.db.models.functions import Coalesce
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from flashcards.utilities.querysets import (
	get_translation_prefetch_related,
	get_topic_member_prefetch_related,
	get_member_count_subquery
)
from flashcards.serializers.flashcards import (
	TopicSerializer, 
	VocabularySerializer, 
	VocabularyImportSerializer,
	TopicMemberSerializer
)
from flashcards.views.bases import BaseModelViewSet
from flashcards.views.mixins import BulkDestroyModelMixin, OwnerListModelMixin
from flashcards.views.paginations import CustomPageNumberPagination
from flashcards.models import Topic, Vocabulary, TopicMember
from flashcards.filters import VocabularyFilter, TopicFilter
from flashcards.utilities.tasks import generate_vocab_audio_async
from flashcards.services.vocabularies import VocabularyImportService
from flashcards.services.topics import TopicService


User = get_user_model()

vocab_import_service = VocabularyImportService()

topic_service = TopicService()


class TopicViewSet(OwnerListModelMixin, BaseModelViewSet, BulkDestroyModelMixin):
	queryset = Topic.objects.all()
	serializer_class = TopicSerializer
	member_serializer_class = TopicMemberSerializer
	filterset_class = TopicFilter
	pagination_class = CustomPageNumberPagination

	def get_owner_filters(self):
		filters = super().get_owner_filters()
		filters |= Q(
			Q(status=Topic.TopicStatusEnums.PUBLIC) &
			Q(topic_members__member=self.request.user) &
			Q(topic_members__status__in=[
				TopicMember.TopicMemberStatusEnums.PENDING,
				TopicMember.TopicMemberStatusEnums.READ_ONLY,
				TopicMember.TopicMemberStatusEnums.EDITABLE
			])
		)
		return filters
	
	def get_member_count_subquery(self):
		return 

	def get_queryset(self):
		qs = super().get_queryset(skip_owner_filter=True)
		qs = qs.prefetch_related(get_topic_member_prefetch_related())
		qs = qs.select_related('created_by')
		qs = qs.annotate(member_count=Coalesce(get_member_count_subquery(), 0))
		qs = qs.filter(self.get_owner_filters())
		qs = qs.distinct()
		return qs
	
	@action(detail=True, methods=['get', 'post', 'put'], url_path='members')
	def members(self, request, *args, **kwargs):
		instance = self.get_object()

		if request.method == 'GET':
			return self.get_members(instance)
		
		if request.method in ['PUT', 'POST']:
			return self.create_update_members(instance, request.data)
		
		return Response(
			'The method is not allowed',
			status=status.HTTP_400_BAD_REQUEST
		)

	def get_members(self, topic):
		return Response(
			self.member_serializer_class(topic.topic_members.all(), many=True).data, 
			status=status.HTTP_200_OK
		)
	
	def create_update_members(self, topic, updated_members):
		serializers = self.member_serializer_class(
			instance=topic.topic_members.all(), 
			data=topic_service.get_create_update_members(
				topic=topic, 
				updating_members=updated_members
			), 
			many=True
		)
		serializers.is_valid(raise_exception=True)
		serializers.save()
		return Response(
			serializers.data,
			status=status.HTTP_200_OK
		)
		

class VocabularyViewSet(OwnerListModelMixin, BaseModelViewSet, BulkDestroyModelMixin):
    queryset = Vocabulary.objects.all()
    serializer_class = VocabularySerializer
    filterset_class = VocabularyFilter

    def get_queryset(self):
        qs = super().get_queryset()
        qs = qs.prefetch_related(
            get_translation_prefetch_related(self.request.GET.dict())
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
        rq_serializer = VocabularyImportSerializer(data=request.data)
        if not rq_serializer.is_valid():
            return Response(rq_serializer.errors, status=400)
        
        import_type = rq_serializer.validated_data.pop('import_type')
        import_func = f'import_{import_type}'
        data_import = getattr(self, import_func)(request, rq_serializer.validated_data)
        
        serializer = self.get_serializer(data=data_import, many=True)
        if serializer.is_valid():
            serializer.save()
            # vocab_ids = list(serializer.instance.values_list('id', flat=True))
            vocab_ids = [vocab.id for vocab in serializer.instance]
            generate_vocab_audio_async(vocab_ids, user_id=request.user.pk)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def import_text(self, request, validated_data):
        return vocab_import_service.parse_import_text(request.user.id, **validated_data)

    # Below code for using simple filtering without defining filterset
    # Note that using filterset_fields and filterset_class together is not supported.
    # filter_backends = [DjangoFilterBackend]
    # filterset_fields = ['topic__id']

    # Below code for using search field that is pass to query url
    # This can combine with OtherFilter
    # filter_backends = [filters.SearchFilter]
    # search_fields = ['word', 'translations__translation']