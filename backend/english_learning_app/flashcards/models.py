from django.conf import settings
from django.db import models
from django.utils.translation import gettext as _


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
	descriptions = models.TextField(blank=True, null=True)

	def __str__(self):
		return self.name


class Vocabulary(CreatedBy):
	word = models.CharField(max_length=100)
	topic = models.ForeignKey(Topic, related_name='vocabularies', on_delete=models.SET_NULL, null=True)
	descriptions = models.TextField(blank=True, null=True)

	def __str__(self):
		return self.word


class Translation(CreatedBy):
	class LanguageEnums(models.TextChoices):
		EN = ('en', _('English'))
		VN = ('vn', _('Vietnamese'))
		JA = ('ja', _('Japanese'))
		
	class TranslationTypeEnums(models.TextChoices):
		N = ('n', _('Noun'))
		V = ('v', _('Verb'))
		ADJ = ('adj', _('Adj'))
		ADV = ('adv', _('Adv'))
		PREP = ('prep', _('Prep'))
		

	vocabulary = models.ForeignKey(Vocabulary, related_name='translations', on_delete=models.SET_NULL, null=True)
	translation = models.CharField(max_length=200)
	language = models.CharField(max_length=10, choices=LanguageEnums.choices, default=LanguageEnums.EN)
	type = models.CharField(max_length=10, choices=TranslationTypeEnums.choices, default=None, null=True, blank=True)
	note = models.TextField(blank=True, null=True)

	def __str__(self):
		return f"{self.translation} ({self.language})"
