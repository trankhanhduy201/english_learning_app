import {
  WS_AUTH_CLOSE_CODE,
  WS_STATUS,
  WS_WORKER_COMMAND,
  WS_WORKER_EVENT,
} from "../configs/notificationSocketConfig";

const ports = new Set();
let socket = null;
let sockUrl = null;

const emit = (type, payload) => {
  ports.forEach((port) => {
    port.postMessage({ type, payload });
  });
};

const closeSocket = () => {
  if (!socket) {
    return;
  }

  socket.onopen = null;
  socket.onmessage = null;
  socket.onerror = null;
  socket.onclose = null;
  socket.close();
  socket = null;
  sockUrl = null;
};

const connectSocket = (url) => {
  if (!url) {
    return;
  }

  if (socket && 
      sockUrl === url && 
      socket.readyState === WebSocket.OPEN) {
    return;
  }

  if (socket && 
      sockUrl === url && 
      socket.readyState === WebSocket.CONNECTING) {
    return;
  }

  closeSocket();
  sockUrl = url;
  socket = new WebSocket(url);

  socket.onopen = () => {
    emit(WS_WORKER_EVENT.STATUS, WS_STATUS.CONNECTED);
  };

  socket.onmessage = (event) => {
    try {
      emit(WS_WORKER_EVENT.MESSAGE, JSON.parse(event.data));
    } catch (error) {
      emit(WS_WORKER_EVENT.MESSAGE, event.data);
    }
  };

  socket.onerror = () => {
    emit(WS_WORKER_EVENT.STATUS, WS_STATUS.ERROR);
  };

  socket.onclose = (event) => {
    if (event.code === WS_AUTH_CLOSE_CODE) {
      emit(WS_WORKER_EVENT.STATUS, WS_STATUS.AUTH_ERROR);
    }
    socket = null;
    sockUrl = null;
    emit(WS_WORKER_EVENT.STATUS, WS_STATUS.DISCONNECTED);
  };
};

// eslint-disable-next-line no-restricted-globals
self.onconnect = (event) => {
  const port = event.ports[0];

  if (!port) {
    return;
  }

  ports.add(port);

  if (socket) {
    port.postMessage({
      type: WS_WORKER_EVENT.STATUS,
      payload: socket.readyState === WebSocket.OPEN 
        ? WS_STATUS.CONNECTED 
        : WS_STATUS.CONNECTING,
    });
  }

  port.onmessage = (messageEvent) => {
    const { type, payload } = messageEvent.data || {};

    switch (type) {
      case WS_WORKER_COMMAND.CONNECT:
        connectSocket(payload);
        break;
      case WS_WORKER_COMMAND.DISCONNECT:
        closeSocket();
        emit(WS_WORKER_EVENT.STATUS, WS_STATUS.DISCONNECTED);
        break;
      case WS_WORKER_COMMAND.PING:
        port.postMessage({ type: WS_WORKER_EVENT.PONG, payload: Date.now() });
        break;
      default:
        break;
    }
  };
};
