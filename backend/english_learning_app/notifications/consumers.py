import json
import logging

from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.signing import BadSignature
from django.http import Http404

from flashcards.models import TopicMember
from notifications.services import notification_send_rate_limiter, notification_service
from users.services.users import UserSignatureService

logger = logging.getLogger(__name__)


class NotificationConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.user_signature_service = UserSignatureService()

    @database_sync_to_async
    def validate_connection(self):
        user = self.scope.get("user")
        if user is None or not getattr(user, "is_authenticated", False):
            raise PermissionError("User is not authenticated.")

        signed_user_id = self.scope["url_route"]["kwargs"].get("user_id")
        if not signed_user_id:
            raise ValueError("Signed user_id is required.")

        try:
            unsigned_user_id = self.user_signature_service.unsign(user.id, signed_user_id)
        except (BadSignature, Http404) as exc:
            raise PermissionError("Signed user_id is invalid.") from exc

        if str(user.id) != str(unsigned_user_id):
            raise PermissionError("User ID does not match the signed user ID.")

    @database_sync_to_async
    def get_group_names(self):
        user = self.scope.get("user")
        topic_ids = TopicMember.objects.joined_topic_ids(user.id)

        return [
            notification_service.get_user_group_name(user.id),
            *[
                notification_service.get_topic_group_name(topic_id)
                for topic_id in topic_ids
            ],
        ]

    async def connect(self):
        try:
            await self.validate_connection()
            self.group_names = await self.get_group_names()
            for group_name in self.group_names:
                await self.channel_layer.group_add(group_name, self.channel_name)
            await self.accept()
        except (PermissionError, ValueError) as exc:
            logger.warning("Notification websocket rejected: %s", exc)
            await self.close(code=4001)

    async def disconnect(self, close_code):
        if hasattr(self, "group_names"):
            for group_name in self.group_names:
                await self.channel_layer.group_discard(group_name, self.channel_name)

    async def receive(self, text_data):
        return

    async def send_notification(self, event):
        user = self.scope.get("user")
        if user is None or not getattr(user, "is_authenticated", False):
            raise RuntimeError("Authenticated user is required for notifications.")

        should_send = await sync_to_async(
            notification_send_rate_limiter.should_send,
            thread_sensitive=False,
        )(user.id)
        if not should_send:
            logger.warning("Notification send rate limit exceeded for user_id=%s", user.id)
            return

        await self.send(text_data=json.dumps(event["message"]))
