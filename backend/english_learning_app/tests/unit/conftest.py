from types import SimpleNamespace

import pytest
from django.contrib.auth.models import AnonymousUser
from rest_framework.test import APIRequestFactory

from tests.unit.factories import make_topic, make_topic_member, make_user, make_vocabulary


@pytest.fixture
def api_request_factory():
    return APIRequestFactory()


@pytest.fixture
def user_factory():
    def _factory(**kwargs):
        return make_user(**kwargs)

    return _factory


@pytest.fixture
def topic_factory():
    def _factory(**kwargs):
        return make_topic(**kwargs)

    return _factory


@pytest.fixture
def topic_member_factory():
    def _factory(**kwargs):
        return make_topic_member(**kwargs)

    return _factory


@pytest.fixture
def vocabulary_factory():
    def _factory(**kwargs):
        return make_vocabulary(**kwargs)

    return _factory


@pytest.fixture
def build_permission_request(api_request_factory):
    def _build(user, method='get', data=None, **view_kwargs):
        request_method = getattr(api_request_factory, method.lower())
        request = request_method('/test/', data or {}, format='json')
        request.user = user if user is not None else AnonymousUser()
        action = view_kwargs.pop('action', None)
        view = SimpleNamespace(kwargs=view_kwargs, action=action)
        return request, view

    return _build
