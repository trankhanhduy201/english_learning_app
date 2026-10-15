import secrets
from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from notifications.models import WebSocketTicket


class WebSocketTicketError(Exception):
    pass


def issue_websocket_ticket(*, user, ttl_seconds=30):
    if user is None or not getattr(user, "is_authenticated", False):
        raise WebSocketTicketError("Authenticated user is required.")

    expires_at = timezone.now() + timedelta(seconds=int(ttl_seconds))
    ticket = secrets.token_urlsafe(32)
    ticket_obj = WebSocketTicket.objects.create(
        user=user,
        ticket=ticket,
        expires_at=expires_at,
    )
    return ticket_obj


def consume_websocket_ticket(raw_ticket):
    if not raw_ticket:
        raise WebSocketTicketError("Ticket is required.")

    now = timezone.now()
    with transaction.atomic():
        ticket = (
            WebSocketTicket.objects.select_related("user")
            .select_for_update()
            .filter(ticket=raw_ticket)
            .first()
        )
        if ticket is None:
            raise WebSocketTicketError("Invalid ticket.")
        if ticket.used_at is not None:
            raise WebSocketTicketError("Ticket has already been used.")
        if ticket.expires_at <= now:
            raise WebSocketTicketError("Ticket has expired.")

        ticket.used_at = now
        ticket.save(update_fields=["used_at"])
        return ticket.user
