from django.conf import settings
from django.db import models
from django.utils.translation import gettext as _

def topic_image_upload_to(instance, filename):
    return f'uploads/topics/{instance.id}/{filename}'


class LanguageEnums(models.TextChoices):
	EN = ('en', _('English'))
	VN = ('vn', _('Vietnamese'))
	JA = ('ja', _('Japanese'))


class CreatedBy(models.Model):
	created_by = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.SET_NULL,
		null=True,
		db_column='created_by'
	)

	class Meta:
		abstract=True


class Topic(CreatedBy):
	name = models.CharField(max_length=100)
	learning_language = models.CharField(max_length=10, choices=LanguageEnums.choices, default=LanguageEnums.EN)
	descriptions = models.TextField(blank=True, null=True)
	image_path = models.ImageField(upload_to=topic_image_upload_to, default=None, null=True, blank=True)

	def __str__(self):
		return self.name


class Vocabulary(CreatedBy):
	word = models.CharField(max_length=100)
	topic = models.ForeignKey(Topic, related_name='vocabularies', on_delete=models.CASCADE, null=True)
	language = models.CharField(max_length=10, choices=LanguageEnums.choices, default=LanguageEnums.EN)
	audio = models.BinaryField(null=True)
	descriptions = models.TextField(blank=True, null=True)

	def __str__(self):
		return self.word


class Translation(CreatedBy):

	class TranslationTypeEnums(models.TextChoices):
		N = ('n', _('Noun'))
		V = ('v', _('Verb'))
		ADJ = ('adj', _('Adj'))
		ADV = ('adv', _('Adv'))
		PREP = ('prep', _('Prep'))
		
	vocabulary = models.ForeignKey(Vocabulary, related_name='translations', on_delete=models.CASCADE, null=True)
	translation = models.CharField(max_length=200)
	language = models.CharField(max_length=10, choices=LanguageEnums.choices, default=LanguageEnums.EN)
	type = models.CharField(max_length=10, choices=TranslationTypeEnums.choices, default=None, null=True, blank=True)
	note = models.TextField(blank=True, null=True)
	
	class Meta:
		indexes = [
			models.Index(fields=['language', 'vocabulary'])
		]

	def __str__(self):
		return f"{self.translation} ({self.language})"
	

class UserToken(models.Model):
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	refresh_token_version = models.IntegerField(default=0, blank=False, null=True)

	def increment_refresh_token_version(self):
		self.refresh_token_version += 1
		self.save()


class UserSalt(models.Model):
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
	salt = models.CharField(max_length=200, blank=False, null=False)