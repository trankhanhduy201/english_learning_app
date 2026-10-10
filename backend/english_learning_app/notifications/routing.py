from django.urls import path

from notifications.consumers import NotificationConsumer


websocket_urlpatterns = [
    path("ws/notify/<str:user_id>/", NotificationConsumer.as_asgi()),
]

