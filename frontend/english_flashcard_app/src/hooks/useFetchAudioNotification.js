import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { SUCCESS_TYPE } from "../configs/alertConfig";
import { setAlert } from "../stores/slices/alertSlice";
import { markLastSocketMessageAsReceived } from "../stores/slices/notificationSlice";
import { GENERATING_VOCAB_AUDIO_NOTIFY } from "../enums/notificationType";

export default function useFetchAudioNotification() {
  const dispatch = useDispatch();
  const lastSocketMessage = useSelector((state) => state.notifications?.lastSocketMessage ?? null);
  
  const shouldReceiveMessage = useCallback(() => {
    return (
      lastSocketMessage?.status === "pending" && 
      lastSocketMessage?.type === GENERATING_VOCAB_AUDIO_NOTIFY
    );
  }, [lastSocketMessage]);

  const audioDatas = useMemo(() => {
    if (!shouldReceiveMessage()) {
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

  useEffect(() => {
    if (!audioDatas || !shouldReceiveMessage()) {
      return;
    }

    dispatch(
      setAlert({
        type: SUCCESS_TYPE,
        message: "The audios have been generated successfully.",
      })
    );
    dispatch(
      markLastSocketMessageAsReceived({ 
        id: lastSocketMessage.message_id 
      })
    );
  }, [audioDatas, dispatch, lastSocketMessage]);

  return { audioDatas };
}
