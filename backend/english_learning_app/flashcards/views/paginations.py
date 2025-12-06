from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination


class CustomPageNumberPagination(PageNumberPagination):
    page_size = 20
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