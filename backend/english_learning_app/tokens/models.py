from django.conf import settings
from django.db import models
from .managers.user_tokens import UserTokenManager


class UserToken(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    refresh_token_version = models.IntegerField(default=0, blank=False, null=True)

    objects = UserTokenManager()