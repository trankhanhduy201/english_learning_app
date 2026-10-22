import asyncio
import json
import logging

from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.signing import BadSignature
from django.http import Http404

from notifications.rate_limiters import notification_send_rate_limiter
from notifications.settings import get_notification_setting
from notifications.services import notification_service
from users.services.users import user_signature_service

logger = logging.getLogger(__name__)

AUTH_REJECT_CLOSE_CODE = 4001
CLIENT_MESSAGE_REJECT_CLOSE_CODE = 4003
CONNECTION_TIMEOUT_CLOSE_CODE = 4000
DEFAULT_WEBSOCKET_CONNECTION_TIMEOUT_SECONDS = 1800


class NotificationConsumer(AsyncWebsocketConsumer):
    @staticmethod
    def _get_connection_timeout_seconds():
        return int(
            get_notification_setting(
                "WEBSOCKET_CONNECTION_TIMEOUT_SECONDS",
                default=DEFAULT_WEBSOCKET_CONNECTION_TIMEOUT_SECONDS,
            )
        )

    async def _close_connection_on_timeout(self):
        timeout_seconds = self._get_connection_timeout_seconds()
        try:
            await asyncio.sleep(timeout_seconds)
            user = self.scope.get("user")
            logger.info(
                "Notification websocket connection timed out after %s seconds for user_id=%s",
                timeout_seconds,
                getattr(user, "id", None),
            )
            await self.close(code=CONNECTION_TIMEOUT_CLOSE_CODE)
        except asyncio.CancelledError:
            return

    @database_sync_to_async
    def validate_connection(self):
        user = self.scope.get("user")
        if user is None or not getattr(user, "is_authenticated", False):
            raise PermissionError("User is not authenticated.")

        signed_user_id = self.scope["url_route"]["kwargs"].get("user_id")
        if not signed_user_id:
            raise ValueError("Signed user_id is required.")

        try:
            unsigned_user_id = user_signature_service.unsign(user.id, signed_user_id)
        except (BadSignature, Http404) as exc:
            raise PermissionError("Signed user_id is invalid.") from exc

        if str(user.id) != str(unsigned_user_id):
            raise PermissionError("User ID does not match the signed user ID.")

    @database_sync_to_async
    def get_group_names(self):
        user = self.scope.get("user")
        topic_ids = notification_service.get_joined_topic_ids(user.id)

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
            self.connection_timeout_task = asyncio.create_task(
                self._close_connection_on_timeout()
            )
        except (PermissionError, ValueError) as exc:
            logger.warning("Notification websocket rejected: %s", exc)
            await self.close(code=AUTH_REJECT_CLOSE_CODE)

    async def disconnect(self, close_code):
        timeout_task = getattr(self, "connection_timeout_task", None)
        if timeout_task and not timeout_task.done() and timeout_task is not asyncio.current_task():
            timeout_task.cancel()

        if hasattr(self, "group_names"):
            for group_name in self.group_names:
                await self.channel_layer.group_discard(group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        user = self.scope.get("user")
        query_string = self.scope.get("query_string", b"")
        logger.warning(
            "Suspicious notification websocket inbound message rejected. "
            "user_id=%s client=%s path=%s query_string=%s text_data=%s has_bytes=%s",
            getattr(user, "id", None),
            self.scope.get("client"),
            self.scope.get("path"),
            query_string.decode("utf-8", errors="replace"),
            text_data,
            bytes_data is not None,
        )
        await self.close(code=CLIENT_MESSAGE_REJECT_CLOSE_CODE)

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
