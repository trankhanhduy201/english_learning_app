from django.conf import settings
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from notifications.auth import issue_websocket_ticket
from notifications.models import Notification
from notifications.serializers import NotificationSerializer
from notifications.throttles import TicketIssuanceRateThrottle
from shared.views.bases import BaseAPIView
from users.services.users import user_signature_service


def _get_cached_notification_user_signature(user_id, ttl_seconds):
    cache_key = f"notifications:ws-signature:{user_id}"
    signature = cache.get(cache_key)
    if signature:
        return signature

    signature = user_signature_service.sign(user_id, str(user_id))
    cache.set(cache_key, signature, timeout=ttl_seconds)
    return signature


class NotificationListView(BaseAPIView):
    http_method_names = ["get", "options"]

    def get(self, request):
        queryset = Notification.objects.filter(user=request.user).order_by("-created_at")
        serializer = NotificationSerializer(queryset, many=True)
        return Response(serializer.data)


class NotificationMarkReadView(BaseAPIView):
    http_method_names = ["post", "patch", "options"]

    def _mark_as_read(self, request, notification_id):
        notification = get_object_or_404(
            Notification.objects.filter(user=request.user),
            id=notification_id,
        )

        if not notification.is_read:
            notification.is_read = True
            notification.save(update_fields=["is_read"])

        return Response(NotificationSerializer(notification).data)

    def post(self, request, notification_id):
        return self._mark_as_read(request, notification_id)

    def patch(self, request, notification_id):
        return self._mark_as_read(request, notification_id)


class WebSocketTicketView(BaseAPIView):
    http_method_names = ["post", "options"]
    throttle_classes = [TicketIssuanceRateThrottle]

    def post(self, request):
        notification_settings = getattr(settings, "NOTIFICATIONS", {})
        ttl_seconds = int(notification_settings.get("WEBSOCKET_TICKET_TTL_SECONDS", 30))
        if ttl_seconds <= 0:
            raise ValidationError("Notification websocket ticket TTL must be greater than zero.")
        signature_cache_seconds = int(notification_settings.get("WEBSOCKET_SIGNATURE_CACHE_SECONDS", 3600))
        if signature_cache_seconds <= 0:
            raise ValidationError("Notification websocket signature cache TTL must be greater than zero.")

        ticket_obj = issue_websocket_ticket(user=request.user, ttl_seconds=ttl_seconds)
        signature = _get_cached_notification_user_signature(
            request.user.id,
            ttl_seconds=signature_cache_seconds,
        )
        return Response(
            {
                "ticket": ticket_obj.ticket,
                "signature": signature,
                "expires_at": ticket_obj.expires_at.isoformat(),
            },
            status=status.HTTP_201_CREATED,
        )
