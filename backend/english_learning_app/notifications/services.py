import json

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

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


class NotificationService:
    def get_group_name(self, user_id):
        return f"user_{user_id}"

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
            self.get_group_name(user_id),
            {
                "type": "send_notification",
                "message": payload,
            },
        )
        return notification


notification_service = NotificationService()

