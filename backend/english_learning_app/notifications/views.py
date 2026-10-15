from django.conf import settings
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from notifications.auth import issue_websocket_ticket
from notifications.models import Notification
from notifications.serializers import NotificationSerializer
from notifications.throttles import TicketIssuanceRateThrottle
from shared.views.bases import BaseAPIView


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
        ttl_seconds = int(
            getattr(settings, "NOTIFICATIONS", {}).get("WEBSOCKET_TICKET_TTL_SECONDS", 30)
        )
        if ttl_seconds <= 0:
            raise ValidationError("Notification websocket ticket TTL must be greater than zero.")

        ticket_obj = issue_websocket_ticket(user=request.user, ttl_seconds=ttl_seconds)
        return Response(
            {
                "ticket": ticket_obj.ticket,
                "expires_at": ticket_obj.expires_at.isoformat(),
            },
            status=status.HTTP_201_CREATED,
        )
