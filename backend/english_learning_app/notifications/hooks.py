import logging

from notifications.services import notification_service

logger = logging.getLogger(__name__)


def _notify_from_task_result(task, default_type, default_title, default_message, store=True):
    if not task.success:
        logger.error("Background notification task failed: %s", task.result)
        return

    result = task.result or {}
    user_id = result.get("user_id")
    if user_id is None:
        logger.warning("Skipping notification because user_id is missing in task result.")
        return

    notification_service.notify_user(
        user_id=user_id,
        title=default_title,
        message=default_message,
        notification_type=default_type,
        store=store,
        data=result.get("data", None)
    )


def notify_vocab_audio_hook(task):
    _notify_from_task_result(
        task,
        default_title="Vocabulary audio generated",
        default_message="Your vocabulary audio generation has completed.",
        default_type="generating_vocab_audio_notify",
        store=False
    )


def notify_topic_subscription_request_hook(task):
    _notify_from_task_result(
        task,
        default_title="New topic subscription request",
        default_message="A user wants to join your topic.",
        default_type="topic_subscription_request",
    )


def notify_topic_subscription_accepted_hook(task):
    _notify_from_task_result(
        task,
        default_title="Topic subscription accepted",
        default_message="Your request to join the topic has been accepted.",
        default_type="topic_subscription_accepted",
    )
