from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

from shared.rate_limiters.base import AbstractRedisRateLimiter


def _get_notification_settings():
    notification_settings = getattr(settings, "NOTIFICATIONS", None)
    if notification_settings is None:
        raise ImproperlyConfigured("NOTIFICATIONS settings are required.")
    return notification_settings


class NotificationSendRateLimiter(AbstractRedisRateLimiter):

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


notification_send_rate_limiter = NotificationSendRateLimiter()
