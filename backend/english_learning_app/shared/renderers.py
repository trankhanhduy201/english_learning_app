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

        return super().render(response, accepted_media_type, renderer_context)
