from django.conf import settings
from django.db import models
from django.utils.translation import gettext as _
from flashcards.managers.topics import TopicManager
from flashcards.managers.topic_members import TopicMemberManager
from flashcards.managers.translations import TranslationManager
from flashcards.managers.vocabs import VocabManager

# https://books.agiliq.com/projects/django-orm-cookbook/en/latest/index.html

def topic_image_upload_to(instance, filename):
    return f'uploads/topics/{filename}'


def user_avatar_upload_to(instance, filename):
	return f'uploads/avatars/user_{instance.user_id}/{filename}'


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
	class TopicStatusEnums(models.TextChoices):
		PRIVATE = ('private', _('Private'))
		PUBLIC = ('public', _('Public'))

	name = models.CharField(max_length=100)
	learning_language = models.CharField(max_length=10, choices=LanguageEnums.choices, default=LanguageEnums.EN)
	descriptions = models.TextField(blank=True, null=True)
	image_path = models.ImageField(upload_to=topic_image_upload_to, default=None, null=True, blank=True)
	status = models.CharField(max_length=15, choices=TopicStatusEnums.choices, default=TopicStatusEnums.PRIVATE)

	members = models.ManyToManyField(
		settings.AUTH_USER_MODEL,
		through="TopicMember",
		related_name="topics"
	)

	objects = TopicManager()

	def __str__(self):
		return self.name
	
	@classmethod
	def get_accessible_statuses(cls):
		return [
			cls.TopicStatusEnums.PUBLIC
		]


class TopicMember(models.Model):
	class TopicMemberStatusEnums(models.TextChoices):
		PENDING = ('pending', _('Pending'))
		READ_ONLY = ('read_only', _('Read only'))
		EDITABLE = ('editable', _('Editable'))
		BLOCK = ('block', _('Block'))

	member = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="topic_members")
	topic = models.ForeignKey("Topic", on_delete=models.CASCADE, related_name="topic_members")
	status = models.CharField(max_length=20, choices=TopicMemberStatusEnums.choices, default=TopicMemberStatusEnums.READ_ONLY)
	joined_at = models.DateField(auto_now_add=True)

	objects = TopicMemberManager()

	class Meta:
		unique_together = ("member", "topic")  # prevent duplicates

	def __str__(self):
		return f"{self.member} ↔ {self.topic}"
	
	@classmethod
	def get_accessible_statuses(cls):
		return [
			cls.TopicMemberStatusEnums.PENDING,
			cls.TopicMemberStatusEnums.READ_ONLY,
			cls.TopicMemberStatusEnums.EDITABLE
		]


class Vocabulary(CreatedBy):
	word = models.CharField(max_length=100)
	topic = models.ForeignKey(Topic, related_name='vocabularies', on_delete=models.CASCADE, null=True)
	language = models.CharField(max_length=10, choices=LanguageEnums.choices, default=LanguageEnums.EN)
	audio = models.BinaryField(null=True)
	descriptions = models.TextField(blank=True, null=True)

	objects = VocabManager()

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

	objects = TranslationManager()

	class Meta:
		indexes = [
			models.Index(fields=['language', 'vocabulary'])
		]

	def __str__(self):
		return f"{self.translation} ({self.language})"


class UserProfile(models.Model):
	user = models.OneToOneField(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='profile'
	)
	avatar = models.ImageField(upload_to=user_avatar_upload_to, default=None, null=True, blank=True)
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