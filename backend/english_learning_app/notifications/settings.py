from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

_MISSING = object()


def get_notification_settings():
    notification_settings = getattr(settings, "NOTIFICATIONS", None)
    if notification_settings is None:
        raise ImproperlyConfigured("NOTIFICATIONS settings are required.")
    return notification_settings


def get_notification_setting(key, default=_MISSING, *, required=False):
    notification_settings = get_notification_settings()
    if key in notification_settings:
        return notification_settings[key]
    if required:
        raise ImproperlyConfigured(f"NOTIFICATIONS['{key}'] is required.")
    if default is _MISSING:
        return None
    return default
