from django.db.models.signals import post_save
from django.dispatch import receiver
from flashcards.models import Vocabulary, Topic
from flashcards.utilities.tasks import generate_vocab_audio_async


@receiver(post_save, sender=Vocabulary)
def on_vocab_saved(sender, instance, created, **kwargs):
	if not instance.audio:
		user_id = instance.topic.created_by.pk if instance.topic and instance.topic.created_by else None
		generate_vocab_audio_async([instance.pk], user_id=user_id)