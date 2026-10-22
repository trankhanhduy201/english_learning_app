export const WS_AUTH_CLOSE_CODE = 4001;
export const WS_CONNECT_THROTTLE_INTERVAL_MS = 2000;

export const WS_STATUS = Object.freeze({
  CONNECTING: "connecting",
  CONNECTED: "connected",
  DISCONNECTED: "disconnected",
  ERROR: "error",
  AUTH_ERROR: "auth_error",
  RATE_LIMITED: "rate_limited",
  UNSUPPORTED: "unsupported",
});

export const WS_WORKER_EVENT = Object.freeze({
  STATUS: "status",
  MESSAGE: "message",
  PONG: "pong",
});

export const WS_WORKER_COMMAND = Object.freeze({
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  PING: "ping",
});

export const WS_ERROR = Object.freeze({
  TICKET_RATE_LIMITED: "WS_TICKET_RATE_LIMITED",
  TICKET_AUTH_FAILED: "WS_TICKET_AUTH_FAILED",
});
