from urllib.parse import parse_qs

from channels.db import database_sync_to_async

from notifications.auth import WebSocketTicketError, consume_websocket_ticket


def get_ticket_from_scope(scope):
    query_string = scope.get("query_string", b"").decode("utf-8")
    query_params = parse_qs(query_string)
    ticket_values = query_params.get("ticket")
    if not ticket_values:
        return None
    return ticket_values[0]


class NotificationTicketAuthMiddleware:
    def __init__(self, app):
        self.app = app

    @database_sync_to_async
    def authenticate_request(self, scope):
        ticket = get_ticket_from_scope(scope)
        return consume_websocket_ticket(ticket)

    async def __call__(self, scope, receive, send):
        try:
            user = await self.authenticate_request(scope)
        except WebSocketTicketError as e:
            print(f"WebSocket ticket error: {e}")
            await send({"type": "websocket.close", "code": 4001})
            return

        scope["user"] = user
        return await self.app(scope, receive, send)
