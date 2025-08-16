from django.db.models import Prefetch, prefetch_related_objects, Q
from rest_framework import generics, viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated

from flashcards.mixins import OwnerListModelMixin
from flashcards.queryset_utils import get_translation_prefetch_related
from flashcards.serializers import TopicSerializer, VocabularySerializer, VocabularyImportSerializer
from flashcards.models import Topic, Vocabulary, Translation, LanguageEnums
from flashcards.filters import VocabularyFilter, TopicFilter
from flashcards.permissions import IsOwner
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from flashcards.task_utils import generate_vocab_audio_async
import re
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer


class BaseModelViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend]
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        self.perform_create_or_update(serializer)

    def perform_update(self, serializer):
        self.perform_create_or_update(serializer)

    def perform_create_or_update(self, serializer):
        additional = {}
        if self.request.user.is_anonymous is False:
            additional['created_by'] = self.request.user
        serializer.save(**additional)


class BulkDestroyModelMixin:
    @action(detail=False, methods=['post'], url_path='delete')
    def bulk_delete(self, request, *args, **kwargs):
        try:
            self.get_queryset().delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'detail': 'Unexpected error occurred.', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class BulkModelMixin(BulkDestroyModelMixin):
    pass


class CustomDjangoPagination(PageNumberPagination):
    page_size = 2  # Number of items per page
    page_size_query_param = 'page_size'  # Allow clients to set page size
    max_page_size = 100  # Maximum page size allowed

    def get_paginated_response(self, data):
        return Response({
            'paginations': {
                'links': {
                    'next': self.get_next_link(),
                    'previous': self.get_previous_link()
                },
                'page_size': self.page_size,
                'current_page': self.page.number,
                'total_pages': self.page.paginator.num_pages,
                'total_items': self.page.paginator.count,
                'has_next': self.page.has_next(),
                'has_previous': self.page.has_previous()
            },
            'results': data
        })


class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email
        })


class TopicViewSet(OwnerListModelMixin, BaseModelViewSet, BulkModelMixin):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer
    filterset_class = TopicFilter
    pagination_class = CustomDjangoPagination
    
    @action(detail=False, methods=['post'], url_path='delete')
    def bulk_delete(self, request, *args, **kwargs):
        try:
            self.get_queryset().delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Exception as e:
            return Response(
                {'detail': 'Unexpected error occurred.', 'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VocabularyViewSet(OwnerListModelMixin, BaseModelViewSet, BulkModelMixin):
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
        
        import_type = rq_serializer.validated_data.get('import_type')
        import_func = f'import_{import_type}'
        data_import = getattr(self, import_func)(request, *args, **kwargs)
        
        serializer = self.get_serializer(data=data_import, many=True)
        if serializer.is_valid():
            serializer.save()
            vocab_ids = list(serializer.instance.values_list('id', flat=True))
            generate_vocab_audio_async(vocab_ids, user_id=request.user.pk)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def import_text(self, request, *args, **kwargs):
        learning_language = request.data.get('learning_lang')
        translating_language = request.data.get('translating_lang')
        topic_id = request.data.get('topic_id')
        text_data = request.data.get('text_data')
        user_id = request.user.id
        if not text_data:
            return []
        
        vocab_entries = []
        split_pattern = r"\s*(\(v\)|\(adj\)|\(a\)|\(adv\)|\(n\)|\(prep\))\s*"
        
        for line in text_data.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
                
            line_parts = line.split(":", 1)
            if len(line_parts) != 2:
                word = description = line_parts[0]
            else:
                word, description = map(str.strip, line_parts)

            translations_entries = []
            if not description:
                continue
                
            for text in description.split("|"):
                parts = re.split(split_pattern, text.strip())
                parts = [part for part in parts if part != '']
                translation_type = None if len(parts) == 1 else parts[0].strip('()')
                translation_type = Translation.TranslationTypeEnums.ADJ.value if translation_type == 'a' else translation_type
                if translation_type not in Translation.TranslationTypeEnums.values:
                    translation_type = None
                translation_text = text
                if len(parts) > 1:
                    if translation_type:
                        parts.pop(0)
                    translation_text = ' '.join(parts)
                translations_entries.append({
                    "translation": translation_text,
                    "language": translating_language,
                    "type": translation_type,
                    "created_by": user_id
                })

            vocab_entries.append({
                "word": word,
                "topic": int(topic_id),
                "language": learning_language,
                "translations": translations_entries,
                "created_by": user_id
            })
        
        return vocab_entries

    # Below code for using simple filtering without defining filterset
    # Note that using filterset_fields and filterset_class together is not supported.
    # filter_backends = [DjangoFilterBackend]
    # filterset_fields = ['topic__id']

    # Below code for using search field that is pass to query url
    # This can combine with OtherFilter
    # filter_backends = [filters.SearchFilter]
    # search_fields = ['word', 'translations__translation']


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
