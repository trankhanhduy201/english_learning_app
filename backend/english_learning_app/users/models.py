from django.conf import settings
from django.db import models


def user_avatar_upload_to(instance, filename):
	return f'uploads/avatars/user_{instance.user_id}/{filename}'


class UserProfile(models.Model):
	user = models.OneToOneField(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='profile'
	)
	avatar = models.ImageField(upload_to=user_avatar_upload_to, default=None, null=True, blank=True)
	bio = models.TextField(blank=True, null=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"Profile({self.user_id})"


class UserToken(models.Model):
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	refresh_token_version = models.IntegerField(default=0, blank=False, null=True)

	def increment_refresh_token_version(self):
		self.refresh_token_version += 1
		self.save()


class UserSalt(models.Model):
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	salt = models.CharField(max_length=200, blank=False, null=False)
