import { useCallback, useRef } from "react";

const getAudioUrl = (audioData) => {
  try {
    const uint8Array = new Uint8Array(
      atob(audioData)
        .split("")
        .map((char) => char.charCodeAt(0)),
    );
    const audioBlob = new Blob([uint8Array], { type: "audio/mpeg" });
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error("Error decoding audio data:", error);
    return null;
  }
};

const useAudio = () => {
  const audioRef = useRef(null);
  const audioData = useRef(null);
  const audioUrl = useRef(null);

  const onPlayAudio = useCallback((newAudioData) => {
    if (newAudioData === audioData.current) {
      audioRef.current.play();
      return;
    }
    const audioUrlObj = getAudioUrl(newAudioData);
    if (audioUrlObj) {
      audioData.current = newAudioData;
      audioUrl.current = getAudioUrl(newAudioData);
      audioRef.current.src = audioUrl.current;
      audioRef.current.play();
    }
  });

  return {
    audioRef,
    onPlayAudio,
  };
};

export default useAudio;
