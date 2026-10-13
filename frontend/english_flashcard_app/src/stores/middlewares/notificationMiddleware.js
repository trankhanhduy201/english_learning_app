import { getAuthManager } from "auth";
import { WS_BASE_URL } from "../../configs/apiConfig";
import { generateSignature } from "../../services/userApi";
import { fetchNotifications } from "../actions/notificationAction";
import {
  appendNotification,
  setWebSocketStatus,
} from "../slices/notificationSlice";

let worker = null;
let lastConnectedUserId = null;
let lastConnectedUrl = null;

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
    console.log("Received message from SharedWorker:", data);
    const actionType = data?.type;
    const payload = data?.payload;

    if (actionType === "status") {
      const status = payload || "disconnected";
      if (status === "connected" || status === "disconnected" || status === "connecting" || status === "error") {
        store.dispatch(setWebSocketStatus(status));
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

  const authManager = getAuthManager();
  const tokenManager = authManager.getTokenManager();
  const token = await tokenManager.getAccessToken();

  if (!token) {
    return null;
  }

  const response = await generateSignature({ value: userId });
  const signature = response?.data?.signature;

  if (!signature) {
    return null;
  }

  const socketUrl = new URL(`${WS_BASE_URL}/ws/notify/${signature}/`);
  socketUrl.searchParams.set("token", token);
  return socketUrl.toString();
};

const notificationMiddleware = (store) => (next) => (action) => {
  const result = next(action);

  if (action.type === "notification/connect") {
    const userId = store.getState().user?.id ?? null;

    if (!userId || (lastConnectedUserId === userId && lastConnectedUrl)) {
      return result;
    }

    const sharedWorker = ensureWorker(store);
    if (!sharedWorker) {
      store.dispatch(setWebSocketStatus("unsupported"));
      return result;
    }
    
    buildSocketUrl(userId)
      .then((socketUrl) => {
        if (!socketUrl) {
          store.dispatch(setWebSocketStatus("error"));
          return;
        }
        
        lastConnectedUserId = userId;
        lastConnectedUrl = socketUrl;
        store.dispatch(setWebSocketStatus("connecting"));
        sharedWorker.port.postMessage({ type: "connect", payload: socketUrl });
        store.dispatch(fetchNotifications());
      })
      .catch(() => {
        store.dispatch(setWebSocketStatus("error"));
      });
  }

  if (action.type === "notification/disconnect") {
    lastConnectedUserId = null;
    lastConnectedUrl = null;

    if (worker) {
      worker.port.postMessage({ type: "disconnect" });
    }

    store.dispatch(setWebSocketStatus("disconnected"));
  }

  return result;
};

export default notificationMiddleware;
