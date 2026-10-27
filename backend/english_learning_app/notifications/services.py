import json

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from flashcards.models import TopicMember
from notifications.models import Notification
from shared.utils import validate_json_serializable


def _serialize_notification(notification):
    if notification is None:
        return None
    
    return {
        "id": notification.id,
        "title": notification.title,
        "message": notification.message,
        "is_read": notification.is_read,
        "created_at": notification.created_at.isoformat() if notification.created_at else None,
    }


class NotificationService:
    def get_user_group_name(self, user_id):
        return f"user_{user_id}"

    def get_topic_group_name(self, topic_id):
        return f"topic_{topic_id}"

    def get_joined_topic_ids(self, member_id):
        return TopicMember.objects.joined_topic_ids(member_id)

    def notify_user(self, *, user_id, title, message, notification_type="notification", data=None, store=True):
        if user_id is None:
            raise ValueError("user_id is required.")

        payload_data = {} if data is None else data
        validate_json_serializable(payload_data)

        notification = None
        if store:
            notification = Notification.objects.create(
                user_id=user_id,
                title=title,
                message=message,
            )

        payload = {
            "type": notification_type,
            "data": payload_data,
            "notification": _serialize_notification(notification)
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
