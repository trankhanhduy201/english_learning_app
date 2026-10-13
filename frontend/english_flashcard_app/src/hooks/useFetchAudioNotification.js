import { useMemo } from "react";
import { useSelector } from "react-redux";
import { GENERATING_VOCAB_AUDIO_NOTIFY } from "../enums/notificationType";

export default function useFetchAudioNotification() {
  const lastSocketMessage = useSelector((state) => state.notifications?.lastSocketMessage ?? null);

  const audioDatas = useMemo(() => {
    if (!lastSocketMessage || 
        lastSocketMessage.type !== GENERATING_VOCAB_AUDIO_NOTIFY) {
      return null;
    }

    try {
      const rawData = lastSocketMessage.data;
      if (!rawData) {
        return null;
      }

      return typeof rawData === "string" ? JSON.parse(rawData) : rawData;
    } catch (error) {
      console.error("Error parsing audio notification payload:", error);
      return null;
    }
  }, [lastSocketMessage]);

  return { audioDatas };
}
