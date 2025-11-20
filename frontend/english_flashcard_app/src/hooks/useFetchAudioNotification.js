import { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";
import { generateSignature } from '../services/userApi';
import { WS_BASE_URL } from "../configs/apiConfig";

export default function useFetchAudioNotification(user_id) {
  const [ audioDatas, setAudioDatas ] = useState(null);
  const [ wsUrl, setWsUrl ] = useState();

  useWebSocket(wsUrl, (message) => {
    console.log("Message from server:", message);
    try {
      const { type, data } = message;
      if (!type || !data || type !== 'generating_vocab_audio_notify') return;
      setAudioDatas(JSON.parse(data));
    } catch (error) {
      console.error("Error parsing fetching audio message:", error);
      return;
    }
  });

  useEffect(() => {
    if (!user_id) return;
    generateSignature({ value: user_id }).then(data => {
      const signature = data.data.signature
      const wsUrl = user_id ? `${WS_BASE_URL}/ws/notify/${signature}/` : null;
      setWsUrl(wsUrl);
    });
  }, [user_id]);

  return { audioDatas }
}
