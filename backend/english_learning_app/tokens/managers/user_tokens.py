from django.db import models
from django.db.models import F


class UserTokenManager(models.Manager):
    def increase_token_version(self, user_id):
        return self.filter(user_id=user_id).update(
            refresh_token_version=F('refresh_token_version') + 1
        )
