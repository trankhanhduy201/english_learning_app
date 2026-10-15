const AUTH_CLOSE_CODE = 4001;
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

  if (socket && sockUrl === url && socket.readyState === WebSocket.OPEN) {
    return;
  }

  if (socket && sockUrl === url && socket.readyState === WebSocket.CONNECTING) {
    return;
  }

  closeSocket();
  sockUrl = url;
  socket = new WebSocket(url);

  socket.onopen = () => {
    emit("status", "connected");
  };

  socket.onmessage = (event) => {
    try {
      emit("message", JSON.parse(event.data));
    } catch (error) {
      emit("message", event.data);
    }
  };

  socket.onerror = () => {
    emit("status", "error");
  };

  socket.onclose = (event) => {
    if (event.code === AUTH_CLOSE_CODE) {
      emit("status", "auth_error");
    }
    socket = null;
    sockUrl = null;
    emit("status", "disconnected");
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
    port.postMessage({ type: "status", payload: socket.readyState === WebSocket.OPEN ? "connected" : "connecting" });
  }

  port.onmessage = (messageEvent) => {
    const { type, payload } = messageEvent.data || {};

    switch (type) {
      case "connect":
        connectSocket(payload);
        break;
      case "disconnect":
        closeSocket();
        emit("status", "disconnected");
        break;
      case "ping":
        port.postMessage({ type: "pong", payload: Date.now() });
        break;
      default:
        break;
    }
  };
};
