import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";

export interface AudioProgressEntry {
  bookId: string;
  episodeId: number;
  timestamp: number;
  duration: number;
  updatedAt: string;
}

interface AudioProgressContextType {
  getAudioProgress: (bookId: string, episodeId: number) => AudioProgressEntry | null;
  saveAudioProgress: (bookId: string, episodeId: number, timestamp: number, duration: number) => void;
  removeAudioProgress: (bookId: string, episodeId: number) => void;
  allAudioProgress: Record<string, AudioProgressEntry>;
}

const makeKey = (bookId: string, episodeId: number) => `${bookId}:${episodeId}`;

const loadFromStorage = (key: string): Record<string, AudioProgressEntry> => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const AudioProgressContext = createContext<AudioProgressContextType | undefined>(undefined);

export const AudioProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const { userId } = useAuth();
  const lsKey = userId ? `ds_audio_progress_${userId}` : "ds_audio_progress_guest";

  const [allAudioProgress, setAllAudioProgress] = useState<Record<string, AudioProgressEntry>>(() => loadFromStorage(lsKey));

  useEffect(() => {
    setAllAudioProgress(loadFromStorage(lsKey));
  }, [lsKey]);

  const saveAudioProgress = useCallback((
    bookId: string,
    episodeId: number,
    timestamp: number,
    duration: number
  ) => {
    if (timestamp < 10) return;

    const key = makeKey(bookId, episodeId);

    // Episode finished — remove it from Continue Listening
    if (duration > 0 && timestamp / duration > 0.95) {
      setAllAudioProgress((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        try { localStorage.setItem(lsKey, JSON.stringify(next)); } catch {}
        return next;
      });
      return;
    }

    const entry: AudioProgressEntry = {
      bookId,
      episodeId,
      timestamp,
      duration,
      updatedAt: new Date().toISOString(),
    };

    setAllAudioProgress((prev) => {
      const next = { ...prev, [key]: entry };
      try { localStorage.setItem(lsKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [lsKey]);

  const removeAudioProgress = useCallback((bookId: string, episodeId: number) => {
    const key = makeKey(bookId, episodeId);
    setAllAudioProgress((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      try { localStorage.setItem(lsKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [lsKey]);

  const getAudioProgress = useCallback(
    (bookId: string, episodeId: number): AudioProgressEntry | null =>
      allAudioProgress[makeKey(bookId, episodeId)] ?? null,
    [allAudioProgress]
  );

  return (
    <AudioProgressContext.Provider value={{ getAudioProgress, saveAudioProgress, removeAudioProgress, allAudioProgress }}>
      {children}
    </AudioProgressContext.Provider>
  );
};

export const useAudioProgress = () => {
  const ctx = useContext(AudioProgressContext);
  if (!ctx) throw new Error("useAudioProgress must be used within AudioProgressProvider");
  return ctx;
};
