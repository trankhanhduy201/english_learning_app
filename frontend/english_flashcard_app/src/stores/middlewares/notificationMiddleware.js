import { WS_BASE_URL } from "../../configs/apiConfig";
import throttle from "lodash/throttle";
import {
  WS_CONNECT_THROTTLE_INTERVAL_MS,
  WS_ERROR,
  WS_STATUS,
  WS_WORKER_COMMAND,
  WS_WORKER_EVENT,
} from "../../configs/notificationSocketConfig";
import { issueWebSocketTicket } from "../../services/wsTicketApi";
import { fetchNotifications } from "../actions/notificationAction";
import {
  appendNotification,
  connectNotificationSocket,
  disconnectNotificationSocket,
  setWebSocketStatus,
} from "../slices/notificationSlice";

let worker = null;
let lastConnectedUserId = null;

const setSocketStatus = (store, status) => {
  store.dispatch(setWebSocketStatus(status));
};

const ensureWorker = (store) => {
  if (worker) {
    return worker;
  }

  if (typeof SharedWorker === "undefined") {
    return null;
  }

  worker = new SharedWorker(
    new URL("../../workers/notificationSharedWorker.js", import.meta.url), 
    { type: "module" }
  );
  worker.port.start();
  worker.port.onmessage = ({ data }) => {
    const actionType = data?.type;
    const payload = data?.payload;

    if (actionType === WS_WORKER_EVENT.STATUS) {
      const status = typeof payload === "string" ? payload : payload?.state;
      if (
        status === WS_STATUS.CONNECTED ||
        status === WS_STATUS.DISCONNECTED ||
        status === WS_STATUS.CONNECTING ||
        status === WS_STATUS.ERROR
      ) {
        setSocketStatus(store, status);
      } else if (status === WS_STATUS.RATE_LIMITED) {
        setSocketStatus(store, WS_STATUS.RATE_LIMITED);
      } else if (status === WS_STATUS.AUTH_ERROR) {
        setSocketStatus(store, WS_STATUS.AUTH_ERROR);
        if (lastConnectedUserId) {
          throttledConnectWithTicket(store, lastConnectedUserId);
        }
      } else {
        setSocketStatus(store, status || WS_STATUS.DISCONNECTED);
      }
      return;
    }

    if (actionType === WS_WORKER_EVENT.MESSAGE) {
      const message = payload || {};
      if (message?.notification || message?.type) {
        store.dispatch(appendNotification(message));
      }
    }
  };

  return worker;
};

const buildSocketUrl = async () => {
  const ticketResponse = await issueWebSocketTicket();
  if (ticketResponse?.status === "error") {
    if (ticketResponse?.code === 429) {
      throw new Error(WS_ERROR.TICKET_RATE_LIMITED);
    }
    if (ticketResponse?.code === 401 || ticketResponse?.code === 403) {
      throw new Error(WS_ERROR.TICKET_AUTH_FAILED);
    }
    return null;
  }

  const ticket = ticketResponse?.data?.ticket;
  const signature = ticketResponse?.data?.signature;
  if (!ticket || !signature) {
    return null;
  }

  const socketUrl = new URL(`${WS_BASE_URL}/ws/notify/${signature}`);
  socketUrl.searchParams.set("ticket", ticket);
  return socketUrl.toString();
};

const connectWithTicket = async (store) => {
  const sharedWorker = ensureWorker(store);
  if (!sharedWorker) {
    setSocketStatus(store, WS_STATUS.UNSUPPORTED);
    return false;
  }

  let socketUrl = null;
  try {
    socketUrl = await buildSocketUrl();
  } catch (error) {
    if (error?.message === WS_ERROR.TICKET_RATE_LIMITED) {
      setSocketStatus(store, WS_STATUS.RATE_LIMITED);
      return false;
    }
    if (error?.message === WS_ERROR.TICKET_AUTH_FAILED) {
      setSocketStatus(store, WS_STATUS.AUTH_ERROR);
      return false;
    }
    throw error;
  }

  if (!socketUrl) {
    setSocketStatus(store, WS_STATUS.ERROR);
    return false;
  }

  setSocketStatus(store, WS_STATUS.CONNECTING);
  sharedWorker.port.postMessage({ type: WS_WORKER_COMMAND.CONNECT, payload: socketUrl });
  store.dispatch(fetchNotifications());
  return true;
};

const throttledConnectWithTicket = throttle(
  (store, userId) => {
    connectWithTicket(store)
      .then((connected) => {
        if (connected) {
          lastConnectedUserId = userId;
        }
      })
      .catch(() => {
        setSocketStatus(store, WS_STATUS.ERROR);
      });
  },
  WS_CONNECT_THROTTLE_INTERVAL_MS,
  { leading: true, trailing: true },
);

const notificationMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === connectNotificationSocket.type) {
    const userId = store.getState().user?.id ?? null;
    const websocketStatus = store.getState().notifications?.websocketStatus;

    if (
      !userId ||
      (lastConnectedUserId === userId &&
        (websocketStatus === WS_STATUS.CONNECTED || websocketStatus === WS_STATUS.CONNECTING))
    ) {
      return result;
    }

    throttledConnectWithTicket(store, userId);
  }

  if (action.type === disconnectNotificationSocket.type) {
    lastConnectedUserId = null;
    throttledConnectWithTicket.cancel();

    if (worker) {
      worker.port.postMessage({ type: WS_WORKER_COMMAND.DISCONNECT });
    }

    setSocketStatus(store, WS_STATUS.DISCONNECTED);
  }

  return result;
};

export default notificationMiddleware;
