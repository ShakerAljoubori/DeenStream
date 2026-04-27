import React, { createContext, useContext, useState, useCallback } from "react";

export interface ProgressEntry {
  episodeId: number;
  timestamp: number;
  duration: number;
  updatedAt: string;
}

interface WatchProgressContextType {
  getProgress: (seriesId: string) => ProgressEntry | null;
  saveProgress: (seriesId: string, episodeId: number, timestamp: number, duration: number) => void;
  allProgress: Record<string, ProgressEntry>;
}

const LS_KEY = "ds_watch_progress";

const loadFromStorage = (): Record<string, ProgressEntry> => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const WatchProgressContext = createContext<WatchProgressContextType | undefined>(undefined);

export const WatchProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const [allProgress, setAllProgress] = useState<Record<string, ProgressEntry>>(loadFromStorage);

  const saveProgress = useCallback((
    seriesId: string,
    episodeId: number,
    timestamp: number,
    duration: number
  ) => {
    // Skip if too early in the video or nearly finished (95%+)
    if (timestamp < 10) return;
    if (duration > 0 && timestamp / duration > 0.95) return;

    const entry: ProgressEntry = {
      episodeId,
      timestamp,
      duration,
      updatedAt: new Date().toISOString(),
    };

    setAllProgress((prev) => {
      const next = { ...prev, [seriesId]: entry };
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const getProgress = useCallback(
    (seriesId: string): ProgressEntry | null => allProgress[seriesId] ?? null,
    [allProgress]
  );

  return (
    <WatchProgressContext.Provider value={{ getProgress, saveProgress, allProgress }}>
      {children}
    </WatchProgressContext.Provider>
  );
};

export const useWatchProgress = () => {
  const ctx = useContext(WatchProgressContext);
  if (!ctx) throw new Error("useWatchProgress must be used within WatchProgressProvider");
  return ctx;
};
