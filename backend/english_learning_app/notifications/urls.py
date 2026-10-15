from django.urls import path

from notifications.views import (
    NotificationListView,
    NotificationMarkReadView,
    WebSocketTicketView,
)


urlpatterns = [
    path("notifications/", NotificationListView.as_view(), name="notification_list"),
    path(
        "notifications/ws-ticket/",
        WebSocketTicketView.as_view(),
        name="notification_websocket_ticket",
    ),
    path(
        "notifications/<int:notification_id>/read",
        NotificationMarkReadView.as_view(),
        name="notification_mark_read",
    ),
]
