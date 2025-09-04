import { useEffect, useState } from "react";
import useWebSocket from "../hooks/useWebSocket";
import { generateSignature } from '../services/userApi';
import { WS_BASE_URL } from "../configs/apiConfig";


export default function useFetchAudioNotification(user_id) {
  const [ audioDatas, setAudioDatas ] = useState([]);
  const [ wsUrl, setWsUrl ] = useState();

  useWebSocket(wsUrl, (message) => {
    console.log("Message from server:", message);
    if (message.data) {
      setAudioDatas(JSON.parse(message.data));
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
