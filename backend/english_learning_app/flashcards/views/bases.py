from django.db import connection
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from flashcards.permissions import IsOwner

User = get_user_model()


class MockUserMixin:
    mock_user_id = None   # change this to whatever user you want to mock

    def initialize_request(self, request, *args, **kwargs) -> Request:
        # Let DRF build the standard Request object
        drf_request = super().initialize_request(request, *args, **kwargs)

        # Inject mocked user
        if self.mock_user_id:
            try:
                drf_request.user = User.objects.get(pk=self.mock_user_id)
            except User.DoesNotExist:
                # fallback: create a temporary in-memory user object
                drf_request.user = User(id=self.mock_user_id)

        return drf_request


class QueryLoggingMixin:
    """
    Mixin to log all DB queries for each request.
    """

    def dispatch(self, request, *args, **kwargs):
        # Before handling the request: clear query log
        # For Django ≥ 5.0
        if hasattr(connection, "queries_log"):
            connection.queries_log.clear()
        else:
            connection.queries.clear()

        response = super().dispatch(request, *args, **kwargs)

        # After view + serializer + rendering
        total = len(
            connection.queries 
            if not hasattr(connection, "queries_log")
            else connection.queries_log
        )
        print(f"[QueryLoggingMixin] {request.method} {request.get_full_path()} — SQL queries: {total}")

        for idx, q in enumerate(
            connection.queries 
            if not hasattr(connection, "queries_log")
            else connection.queries_log, start=1
        ):
            print(f"  {idx}. {q.get('sql')}")

        return response


class BaseModelViewSet(QueryLoggingMixin, MockUserMixin, viewsets.ModelViewSet):
    permission_classes = [IsOwner]
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


class CustomDjangoPagination(PageNumberPagination):
    page_size = 2
    page_size_query_param = 'page_size'
    max_page_size = 100

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