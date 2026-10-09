from django.shortcuts import get_object_or_404
from rest_framework.response import Response

from notifications.models import Notification
from notifications.serializers import NotificationSerializer
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

