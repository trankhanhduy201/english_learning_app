import json
import logging

from notifications.services import notification_service

logger = logging.getLogger(__name__)


def notify_vocab_audio_hook(task):
    if not task.success:
        logger.error("Vocabulary audio task failed: %s", task.result)
        return

    result = task.result
    user_id = result.get("user_id")
    if user_id is None:
        logger.warning("Skipping notification because user_id is missing in task result.")
        return

    notification_service.notify_user(
        user_id=user_id,
        title="Vocabulary audio generated",
        message="Your vocabulary audio generation has completed.",
        notification_type="generating_vocab_audio_notify",
        data=json.dumps(result.get("audios", {})),
    )
