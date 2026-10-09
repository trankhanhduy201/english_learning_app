from notifications.models import Notification
from shared.serializers.bases import BaseSerializer


class NotificationSerializer(BaseSerializer):
    class Meta(BaseSerializer.Meta):
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "is_read",
            "created_at",
        ]
        read_only_fields = fields

