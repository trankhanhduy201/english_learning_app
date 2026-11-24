from rest_framework.renderers import JSONRenderer


class CustomJSONRenderer(JSONRenderer):
    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = {
	        'code': 0,
            'status': 'success',
            'data': data
        }
        if renderer_context:
            response_status = renderer_context['response'].status_code
            response['code'] = response_status
            if response_status >= 400:
                response['status'] = 'error'
                response['errors'] = data
                response.pop('data')
            else:
                view = renderer_context.get('view')
                paginator = getattr(view, 'paginator', None)
                page = getattr(paginator, 'page', None)
                if paginator is not None and page is not None:
                    response['meta'] = {
                        'paginations': {
                            'links': {
                                'next': paginator.get_next_link(),
                                'previous': paginator.get_previous_link(),
                            },
                            'page_size': paginator.page_size,
                            'current_page': page.number,
                            'total_pages': page.paginator.num_pages,
                            'total_items': page.paginator.count,
                            'has_next': page.has_next(),
                            'has_previous': page.has_previous(),
                        }
                    }

        return super().render(response, accepted_media_type, renderer_context)
