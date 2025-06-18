import { useCallback, useRef } from "react";

const getAudioUrl = (audioData) => {
  const uint8Array = new Uint8Array(
    atob(audioData)
      .split("")
      .map((char) => char.charCodeAt(0)),
  );
  const audioBlob = new Blob([uint8Array], { type: "audio/mpeg" });
  return URL.createObjectURL(audioBlob);
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
    audioData.current = newAudioData;
    audioUrl.current = getAudioUrl(newAudioData);
    audioRef.current.src = audioUrl.current;
    audioRef.current.play();
  });

  return {
    audioRef,
    onPlayAudio,
  };
};

export default useAudio;
