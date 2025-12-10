from django.apps import apps
from django.db.models import QuerySet


class BaseQuerySet(QuerySet):
    def get_model(self, name):
        return apps.get_model(*name.split("."))
