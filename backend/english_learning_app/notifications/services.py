import json

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django_redis import get_redis_connection

from flashcards.models import TopicMember
from notifications.models import Notification


def _validate_json_serializable(data):
    json.dumps(data)
    return data


def _serialize_notification(notification):
    return {
        "id": notification.id,
        "title": notification.title,
        "message": notification.message,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat() if notification.created_at else None,
    }


def _get_notification_settings():
    notification_settings = getattr(settings, "NOTIFICATIONS", None)
    if notification_settings is None:
        raise ImproperlyConfigured("NOTIFICATIONS settings are required.")
    return notification_settings


class NotificationSendRateLimiter:
    _INCREMENT_SCRIPT = """
    local current = redis.call('INCR', KEYS[1])
    if current == 1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
    end
    return current
    """

    def __init__(self):
        self._redis_client = None
        self._increment_script = None

    def _get_required_config(self, key):
        notification_settings = _get_notification_settings()
        if key not in notification_settings:
            raise ImproperlyConfigured(f"NOTIFICATIONS['{key}'] is required.")
        return notification_settings[key]

    def get_limit_count(self):
        return int(self._get_required_config("SEND_RATE_LIMIT_COUNT"))

    def get_window_seconds(self):
        return int(self._get_required_config("SEND_RATE_LIMIT_WINDOW_SECONDS"))

    def get_key_prefix(self):
        return str(self._get_required_config("SEND_RATE_LIMIT_KEY_PREFIX"))

    def get_redis_client(self):
        if self._redis_client is None:
            self._redis_client = get_redis_connection("default")
        return self._redis_client

    def get_increment_script(self):
        if self._increment_script is None:
            self._increment_script = self.get_redis_client().register_script(self._INCREMENT_SCRIPT)
        return self._increment_script

    def should_send(self, user_id):
        key = f"{self.get_key_prefix()}:{user_id}"
        current_count = int(self.get_increment_script()(
            keys=[key], 
            args=[self.get_window_seconds()]
        ))
        return current_count <= self.get_limit_count()


class NotificationService:
    def get_user_group_name(self, user_id):
        return f"user_{user_id}"

    def get_topic_group_name(self, topic_id):
        return f"topic_{topic_id}"

    def get_joined_topic_ids(self, member_id):
        return TopicMember.objects.joined_topic_ids(member_id)

    def notify_user(self, *, user_id, title, message, notification_type="notification", data=None):
        if user_id is None:
            raise ValueError("user_id is required.")

        payload_data = {} if data is None else data
        _validate_json_serializable(payload_data)

        notification = Notification.objects.create(
            user_id=user_id,
            title=title,
            message=message,
        )

        payload = {
            "type": notification_type,
            "data": payload_data,
            "notification": _serialize_notification(notification),
        }

        channel_layer = get_channel_layer()
        if channel_layer is None:
            raise RuntimeError("Channel layer is not configured.")

        async_to_sync(channel_layer.group_send)(
            self.get_user_group_name(user_id),
            {
                "type": "send_notification",
                "message": payload,
            },
        )
        return notification


notification_service = NotificationService()
notification_send_rate_limiter = NotificationSendRateLimiter()
