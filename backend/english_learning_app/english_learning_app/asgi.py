"""
ASGI config for english_learning_app project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "english_learning_app.settings",
)

django_asgi_app = get_asgi_application()

from channels.routing import ProtocolTypeRouter, URLRouter
from notifications.routing import notification_websocket_urlpatterns
from notifications.middlewares import NotificationTicketAuthMiddleware

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": NotificationTicketAuthMiddleware(
        URLRouter(notification_websocket_urlpatterns)
    ),
})