from rest_framework.throttling import UserRateThrottle


class TicketIssuanceRateThrottle(UserRateThrottle):
    scope = "ticket_issuance"
