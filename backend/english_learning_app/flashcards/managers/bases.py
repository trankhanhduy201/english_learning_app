from django.db import models


class BaseManager(models.Manager):
    def bulk_delete(self, ids):
        if isinstance(ids, list) and len(ids) > 0:
            self.get_queryset().filter(pk__in=ids).delete()