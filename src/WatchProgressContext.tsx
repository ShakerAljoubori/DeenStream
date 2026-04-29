import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./AuthContext";

export interface ProgressEntry {
  seriesId: string;
  episodeId: number;
  timestamp: number;
  duration: number;
  snapshot?: string;
  updatedAt: string;
}

interface WatchProgressContextType {
  getProgress: (seriesId: string, episodeId: number) => ProgressEntry | null;
  saveProgress: (seriesId: string, episodeId: number, timestamp: number, duration: number, snapshot?: string) => void;
  removeProgress: (seriesId: string, episodeId: number) => void;
  allProgress: Record<string, ProgressEntry>;
}

const makeKey = (seriesId: string, episodeId: number) => `${seriesId}:${episodeId}`;

const loadFromStorage = (key: string): Record<string, ProgressEntry> => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const WatchProgressContext = createContext<WatchProgressContextType | undefined>(undefined);

export const WatchProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const { userId } = useAuth();
  const lsKey = userId ? `ds_watch_progress_${userId}` : "ds_watch_progress_guest";

  const [allProgress, setAllProgress] = useState<Record<string, ProgressEntry>>(() => loadFromStorage(lsKey));

  useEffect(() => {
    setAllProgress(loadFromStorage(lsKey));
  }, [lsKey]);

  const saveProgress = useCallback((
    seriesId: string,
    episodeId: number,
    timestamp: number,
    duration: number,
    snapshot?: string
  ) => {
    if (timestamp < 10) return;

    const key = makeKey(seriesId, episodeId);

    // Episode finished — remove it from Continue Watching
    if (duration > 0 && timestamp / duration > 0.95) {
      setAllProgress((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        try { localStorage.setItem(lsKey, JSON.stringify(next)); } catch {}
        return next;
      });
      return;
    }

    const entry: ProgressEntry = {
      seriesId,
      episodeId,
      timestamp,
      duration,
      ...(snapshot ? { snapshot } : {}),
      updatedAt: new Date().toISOString(),
    };

    setAllProgress((prev) => {
      const next = { ...prev, [key]: entry };
      try { localStorage.setItem(lsKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [lsKey]);

  const removeProgress = useCallback((seriesId: string, episodeId: number) => {
    const key = makeKey(seriesId, episodeId);
    setAllProgress((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      try { localStorage.setItem(lsKey, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [lsKey]);

  const getProgress = useCallback(
    (seriesId: string, episodeId: number): ProgressEntry | null =>
      allProgress[makeKey(seriesId, episodeId)] ?? null,
    [allProgress]
  );

  return (
    <WatchProgressContext.Provider value={{ getProgress, saveProgress, removeProgress, allProgress }}>
      {children}
    </WatchProgressContext.Provider>
  );
};

export const useWatchProgress = () => {
  const ctx = useContext(WatchProgressContext);
  if (!ctx) throw new Error("useWatchProgress must be used within WatchProgressProvider");
  return ctx;
};
