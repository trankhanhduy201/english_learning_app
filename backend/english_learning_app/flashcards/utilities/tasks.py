from django_q.tasks import async_task
from flashcards.models import TopicMember
from flashcards.tasks import (
    generate_vocab_audio_binary,
    send_topic_subscription_accepted_notification,
    send_topic_subscription_request_notification,
)


def generate_vocab_audio_async(vocab_ids, user_id=None, chunk_size=20):
    vocab_ids = [vocab_ids[i:i + chunk_size] for i in range(0, len(vocab_ids), chunk_size)]
    for ids in vocab_ids:
        async_task(
            generate_vocab_audio_binary, 
            ids, 
            user_id, 
            hook='notifications.hooks.notify_vocab_audio_hook'
        )


def notify_topic_owner_for_subscription_async(topic_member):
    topic = getattr(topic_member, 'topic', None)
    if topic is None or topic.created_by is None:
        return

    owner_id = topic.created_by.id
    if owner_id is None or owner_id == topic_member.member.id:
        return

    async_task(
        send_topic_subscription_request_notification,
        user_id=owner_id,
        payload={
            "topic_id": topic.id,
            "topic_name": topic.name,
            "member_id": topic_member.member.id,
            "member_name": topic_member.member.get_full_name()
        },
        hook='notifications.hooks.notify_topic_subscription_request_hook',
    )


def notify_subscriber_for_accepted_subscription_async(topic_member):
    if topic_member.status != TopicMember.TopicMemberStatusEnums.READ_ONLY:
        return

    async_task(
        send_topic_subscription_accepted_notification,
        user_id=topic_member.member.id,
        payload={
            "topic_id": topic_member.topic.id,
            "topic_name": topic_member.topic.name,
            "member_id": topic_member.member.id,
			"member_name": topic_member.member.get_full_name()
        },
        hook='notifications.hooks.notify_topic_subscription_accepted_hook',
    )
