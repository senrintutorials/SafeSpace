// Utility for reliable, audible audio playback and microphone MediaRecorder MIME types across browsers

export function getSupportedAudioMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'audio/webm';
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/aac',
    'audio/ogg'
  ];
  for (const t of types) {
    if (MediaRecorder.isTypeSupported(t)) {
      return t;
    }
  }
  return 'audio/webm';
}

export function isRealMediaUrl(url?: string | null): boolean {
  if (!url) return false;
  return (
    url.startsWith('blob:') ||
    url.startsWith('data:') ||
    url.startsWith('http://') ||
    url.startsWith('https://')
  );
}

export interface PlayAudibleRecordingOptions {
  audioUrl?: string | null;
  textFallback?: string;
  durationSec?: number;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export function playAudibleRecording({
  audioUrl,
  textFallback,
  onEnd,
  onError
}: PlayAudibleRecordingOptions): () => void {
  // Cancel any active SpeechSynthesis utterance first
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  let currentAudio: HTMLAudioElement | null = null;
  let isStopped = false;

  const stop = () => {
    isStopped = true;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (onEnd) onEnd();
  };

  const hasRealUrl = isRealMediaUrl(audioUrl);

  if (hasRealUrl && audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      currentAudio = audio;
      audio.volume = 1.0;
      audio.muted = false;

      audio.onended = () => {
        if (!isStopped && onEnd) onEnd();
      };

      audio.onerror = (e) => {
        console.warn("Audio element playback error, using speech synthesis fallback:", e);
        playSpeechFallback();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio element play() blocked, using speech synthesis fallback:", err);
          playSpeechFallback();
        });
      }
      return stop;
    } catch (err) {
      console.warn("Audio object creation error:", err);
      playSpeechFallback();
      return stop;
    }
  } else {
    playSpeechFallback();
    return stop;
  }

  function playSpeechFallback() {
    if (isStopped) return;

    const speechText = (textFallback && textFallback.trim().length > 0)
      ? textFallback.replace(/^[🎙️🗣️🔊\s]+/u, '')
      : "Recorded voice note.";

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(speechText);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onend = () => {
          if (!isStopped && onEnd) onEnd();
        };
        utterance.onerror = (e) => {
          console.warn("Speech synthesis error:", e);
          if (!isStopped && onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
      } catch (_) {
        if (!isStopped && onEnd) onEnd();
      }
    } else {
      if (!isStopped && onEnd) onEnd();
    }
  }
}


