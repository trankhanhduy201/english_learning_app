from notifications.settings import get_notification_setting
from shared.rate_limiters.base import AbstractRedisRateLimiter


class NotificationSendRateLimiter(AbstractRedisRateLimiter):

    def _get_required_config(self, key):
        return get_notification_setting(key, required=True)

    def get_limit_count(self):
        return int(self._get_required_config("SEND_RATE_LIMIT_COUNT"))

    def get_window_seconds(self):
        return int(self._get_required_config("SEND_RATE_LIMIT_WINDOW_SECONDS"))

    def get_key_prefix(self):
        return str(self._get_required_config("SEND_RATE_LIMIT_KEY_PREFIX"))


notification_send_rate_limiter = NotificationSendRateLimiter()
