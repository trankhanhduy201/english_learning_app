from django.db import models


class BaseManager(models.Manager):
    def bulk_delete(self, ids):
        self.get_queryset().filter(pk__in=ids).delete()