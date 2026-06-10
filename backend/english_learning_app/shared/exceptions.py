from rest_framework import status
from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    # if response is not None:
    #     response.data['message'] = str(exc)

    return response


class ConflictException(APIException):
    status_code = status.HTTP_409_CONFLICT
    default_detail = 'Conflict occurred.'
    default_code = 'conflict'
