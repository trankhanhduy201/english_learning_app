from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from flashcards.models import TopicMember, Vocabulary
from flashcards.utilities.tasks import (
	generate_vocab_audio_async,
	notify_subscriber_for_accepted_subscription_async,
	notify_topic_owner_for_subscription_async,
)
from users.models import UserProfile


@receiver(post_save, sender=Vocabulary)
def on_vocab_saved(sender, instance, created, **kwargs):
	if not instance.audio:
		user_id = instance.topic.created_by.pk if instance.topic and instance.topic.created_by else None
		generate_vocab_audio_async([instance.pk], user_id=user_id)


@receiver(post_save, sender=get_user_model())
def on_user_saved(sender, instance, created, **kwargs):
	if created:
		UserProfile.objects.get_or_create(user=instance)


@receiver(pre_save, sender=TopicMember)
def on_topic_member_pre_save(sender, instance, **kwargs):
	if instance.pk is None:
		instance._previous_status = None
		return

	instance._previous_status = (
		TopicMember.objects
			.filter(pk=instance.pk)
			.values_list('status', flat=True)
			.first()
	)


@receiver(post_save, sender=TopicMember)
def on_topic_member_saved(sender, instance, created, **kwargs):
	if created:
		notify_topic_owner_for_subscription_async(instance)
		return

	previous_status = getattr(instance, '_previous_status', None)
	if (
		previous_status == TopicMember.TopicMemberStatusEnums.PENDING and
		instance.status == TopicMember.TopicMemberStatusEnums.READ_ONLY
	):
		notify_subscriber_for_accepted_subscription_async(instance)