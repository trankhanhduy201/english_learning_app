import { useEffect, useRef } from "react";

export default function useWebSocket(url, onMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!url) {
      console.warn("WebSocket URL is not provided");
      return;
    }
    
    const ws = new WebSocket(url);
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      if (message && onMessage) {
        onMessage(message);
      }
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
  }, [url, onMessage]);

  return socketRef.current;
}
