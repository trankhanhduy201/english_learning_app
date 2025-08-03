import { useEffect, useRef } from "react";
import { WS_BASE_URL } from "../configs/apiConfig";

export default function useWebSocket(userId, onMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const ws = new WebSocket(`${WS_BASE_URL}/ws/notify/${userId}/`);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (onMessage) onMessage(data);
    };

    ws.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    ws.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.close();
    };
  }, [userId, onMessage]);

  return socketRef.current;
}
