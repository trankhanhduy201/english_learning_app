from django.db import models
from django.utils.translation import gettext as _


class Topic(models.Model):
	name = models.CharField(max_length=100)

	def __str__(self):
		return self.name


class Vocabulary(models.Model):
	word = models.CharField(max_length=100)
	topic = models.ForeignKey(Topic, related_name='vocabularies', on_delete=models.CASCADE)

	def __str__(self):
		return self.word


class Translation(models.Model):
	class LanguageEnums(models.TextChoices):
		EN = ('en', _('English'))

	vocabulary = models.ForeignKey(Vocabulary, related_name='translations', on_delete=models.CASCADE)
	translation = models.CharField(max_length=200)
	language = models.CharField(max_length=10, choices=LanguageEnums.choices, default=LanguageEnums.EN)

	def __str__(self):
		return f"{self.translation} ({self.language})"
