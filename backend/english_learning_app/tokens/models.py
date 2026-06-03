from django.conf import settings
from django.db import models


class UserToken(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    refresh_token_version = models.IntegerField(default=0, blank=False, null=True)

    def increment_refresh_token_version(self):
        self.refresh_token_version += 1
        self.save()