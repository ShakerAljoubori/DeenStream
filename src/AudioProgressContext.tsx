import React, { createContext, useContext, useState, useCallback } from "react";

export interface AudioProgressEntry {
  episodeId: number;
  timestamp: number;
  duration: number;
  updatedAt: string;
}

interface AudioProgressContextType {
  getAudioProgress: (bookId: string) => AudioProgressEntry | null;
  saveAudioProgress: (bookId: string, episodeId: number, timestamp: number, duration: number) => void;
  allAudioProgress: Record<string, AudioProgressEntry>;
}

const LS_KEY = "ds_audio_progress";

const loadFromStorage = (): Record<string, AudioProgressEntry> => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const AudioProgressContext = createContext<AudioProgressContextType | undefined>(undefined);

export const AudioProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [allAudioProgress, setAllAudioProgress] = useState<Record<string, AudioProgressEntry>>(loadFromStorage);

  const saveAudioProgress = useCallback((
    bookId: string,
    episodeId: number,
    timestamp: number,
    duration: number
  ) => {
    if (timestamp < 10) return;
    if (duration > 0 && timestamp / duration > 0.95) return;

    const entry: AudioProgressEntry = {
      episodeId,
      timestamp,
      duration,
      updatedAt: new Date().toISOString(),
    };

    setAllAudioProgress((prev) => {
      const next = { ...prev, [bookId]: entry };
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const getAudioProgress = useCallback(
    (bookId: string): AudioProgressEntry | null => allAudioProgress[bookId] ?? null,
    [allAudioProgress]
  );

  return (
    <AudioProgressContext.Provider value={{ getAudioProgress, saveAudioProgress, allAudioProgress }}>
      {children}
    </AudioProgressContext.Provider>
  );
};

export const useAudioProgress = () => {
  const ctx = useContext(AudioProgressContext);
  if (!ctx) throw new Error("useAudioProgress must be used within AudioProgressProvider");
  return ctx;
};
