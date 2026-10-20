import { WS_BASE_URL } from "../../configs/apiConfig";
import { issueWebSocketTicket } from "../../services/wsTicketApi";
import { fetchNotifications } from "../actions/notificationAction";
import { generateSignature } from "../../services/userApi";
import {
  appendNotification,
  setWebSocketStatus,
} from "../slices/notificationSlice";

let worker = null;
let lastConnectedUserId = null;
let reconnectingAfterAuthError = false;

const ensureWorker = (store) => {
  if (worker) {
    return worker;
  }

  if (typeof SharedWorker === "undefined") {
    return null;
  }

  worker = new SharedWorker(new URL("../../workers/notificationSharedWorker.js", import.meta.url), { type: "module" });
  worker.port.start();
  worker.port.onmessage = ({ data }) => {
    const actionType = data?.type;
    const payload = data?.payload;

    if (actionType === "status") {
      const status = typeof payload === "string" ? payload : payload?.state;
      if (status === "connected" || status === "disconnected" || status === "connecting" || status === "error") {
        store.dispatch(setWebSocketStatus(status));
      } else if (status === "rate_limited") {
        store.dispatch(setWebSocketStatus("rate_limited"));
      } else if (status === "auth_error") {
        store.dispatch(setWebSocketStatus("auth_error"));
        if (!reconnectingAfterAuthError && lastConnectedUserId) {
          reconnectingAfterAuthError = true;
          connectWithTicket(store, lastConnectedUserId).finally(() => {
            reconnectingAfterAuthError = false;
          });
        }
      } else {
        store.dispatch(setWebSocketStatus(status || "disconnected"));
      }
      return;
    }

    if (actionType === "message") {
      const message = payload || {};
      if (message?.notification || message?.type) {
        store.dispatch(appendNotification(message));
      }
    }
  };

  return worker;
};

const buildSocketUrl = async (userId) => {
  if (!userId) {
    return null;
  }

  const ticketResponse = await issueWebSocketTicket();
  if (ticketResponse?.status === "error") {
    if (ticketResponse?.code === 429) {
      throw new Error("WS_TICKET_RATE_LIMITED");
    }
    if (ticketResponse?.code === 401 || ticketResponse?.code === 403) {
      throw new Error("WS_TICKET_AUTH_FAILED");
    }
    return null;
  }

  const ticket = ticketResponse?.data?.ticket;
  if (!ticket) {
    return null;
  }
  const response = await generateSignature({ value: userId });
  const signature = response?.data?.signature;
  if (!signature) {
    return null;
  }

  const socketUrl = new URL(`${WS_BASE_URL}/ws/notify/${signature}`);
  socketUrl.searchParams.set("ticket", ticket);
  return socketUrl.toString();
};

const connectWithTicket = async (store, userId) => {
  const sharedWorker = ensureWorker(store);
  if (!sharedWorker) {
    store.dispatch(setWebSocketStatus("unsupported"));
    return false;
  }

  let socketUrl = null;
  try {
    socketUrl = await buildSocketUrl(userId);
  } catch (error) {
    if (error?.message === "WS_TICKET_RATE_LIMITED") {
      store.dispatch(setWebSocketStatus("rate_limited"));
      return false;
    }
    if (error?.message === "WS_TICKET_AUTH_FAILED") {
      store.dispatch(setWebSocketStatus("auth_error"));
      return false;
    }
    throw error;
  }

  if (!socketUrl) {
    store.dispatch(setWebSocketStatus("error"));
    return false;
  }

  store.dispatch(setWebSocketStatus("connecting"));
  sharedWorker.port.postMessage({ type: "connect", payload: socketUrl });
  store.dispatch(fetchNotifications());
  return true;
};

const notificationMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === "notification/connect") {
    const userId = store.getState().user?.id ?? null;
    const websocketStatus = store.getState().notifications?.websocketStatus;

    if (
      !userId ||
      (lastConnectedUserId === userId &&
        (websocketStatus === "connected" || websocketStatus === "connecting"))
    ) {
      return result;
    }

    connectWithTicket(store, userId)
      .then((connected) => {
        if (connected) {
          lastConnectedUserId = userId;
        }
      })
      .catch(() => {
        store.dispatch(setWebSocketStatus("error"));
      });
  }

  if (action.type === "notification/disconnect") {
    lastConnectedUserId = null;

    if (worker) {
      worker.port.postMessage({ type: "disconnect" });
    }

    store.dispatch(setWebSocketStatus("disconnected"));
  }

  return result;
};

export default notificationMiddleware;
