import re
from django.db.models import Q
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from flashcards.utilities.querysets import get_translation_prefetch_related
from flashcards.serializers.flashcards import (
    TopicSerializer, 
    VocabularySerializer, 
    VocabularyImportSerializer
)
from flashcards.views.bases import BaseModelViewSet
from flashcards.views.mixins import BulkDestroyModelMixin, OwnerListModelMixin
from flashcards.views.paginations import CustomPageNumberPagination
from flashcards.models import Topic, Vocabulary
from flashcards.filters import VocabularyFilter, TopicFilter
from flashcards.utilities.tasks import generate_vocab_audio_async
from flashcards.services.vocabularies import VocabularyImportService


vocab_import_service = VocabularyImportService()


class TopicViewSet(OwnerListModelMixin, BaseModelViewSet, BulkDestroyModelMixin):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    filterset_class = TopicFilter
    pagination_class = CustomPageNumberPagination


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