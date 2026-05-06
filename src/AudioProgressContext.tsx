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

const API = "http://localhost:5000/api/audio-progress";
const makeKey = (bookId: string, episodeId: number) => `${bookId}:${episodeId}`;
const getToken = () => localStorage.getItem("token");

const loadFromStorage = (key: string): Record<string, AudioProgressEntry> => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveToStorage = (key: string, data: Record<string, AudioProgressEntry>) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch {}
};

const AudioProgressContext = createContext<AudioProgressContextType | undefined>(undefined);

export const AudioProgressProvider = ({ children }: { children: React.ReactNode }) => {
  const { userId } = useAuth();
  const lsKey = userId ? `ds_audio_progress_${userId}` : "ds_audio_progress_guest";

  const [allAudioProgress, setAllAudioProgress] = useState<Record<string, AudioProgressEntry>>(() =>
    loadFromStorage(lsKey)
  );

  // When userId changes (login/logout/switch), load the right data source
  useEffect(() => {
    if (!userId) {
      setAllAudioProgress(loadFromStorage("ds_audio_progress_guest"));
      return;
    }

    const token = getToken();
    if (!token) {
      setAllAudioProgress(loadFromStorage(lsKey));
      return;
    }

    // Logged in — fetch all entries from server
    fetch(API, { headers: { "x-auth-token": token } })
      .then((r) => r.json())
      .then((entries: Array<{ bookId: string; episodeId: number; timestamp: number; duration: number; updatedAt: string }>) => {
        const map: Record<string, AudioProgressEntry> = {};
        for (const e of entries) {
          map[makeKey(e.bookId, e.episodeId)] = {
            bookId: e.bookId,
            episodeId: e.episodeId,
            timestamp: e.timestamp,
            duration: e.duration,
            updatedAt: e.updatedAt,
          };
        }
        setAllAudioProgress(map);
        // Mirror to localStorage as offline cache
        saveToStorage(lsKey, map);
      })
      .catch(() => {
        // Server unreachable — fall back to cached localStorage
        setAllAudioProgress(loadFromStorage(lsKey));
      });
  }, [userId, lsKey]);

  const saveAudioProgress = useCallback((
    bookId: string,
    episodeId: number,
    timestamp: number,
    duration: number
  ) => {
    if (timestamp < 10) return;

    const key = makeKey(bookId, episodeId);

    // Episode finished — remove from Continue Listening
    if (duration > 0 && timestamp / duration > 0.95) {
      setAllAudioProgress((prev) => {
        if (!prev[key]) return prev;
        const next = { ...prev };
        delete next[key];
        saveToStorage(lsKey, next);
        return next;
      });

      if (userId) {
        const token = getToken();
        if (token) {
          fetch(`${API}/${bookId}/${episodeId}`, {
            method: "DELETE",
            headers: { "x-auth-token": token },
          }).catch(() => {});
        }
      }
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
      saveToStorage(lsKey, next);
      return next;
    });

    if (userId) {
      const token = getToken();
      if (token) {
        fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-auth-token": token },
          body: JSON.stringify({ bookId, episodeId, timestamp, duration }),
        }).catch(() => {});
      }
    }
  }, [lsKey, userId]);

  const removeAudioProgress = useCallback((bookId: string, episodeId: number) => {
    const key = makeKey(bookId, episodeId);
    setAllAudioProgress((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      saveToStorage(lsKey, next);
      return next;
    });

    if (userId) {
      const token = getToken();
      if (token) {
        fetch(`${API}/${bookId}/${episodeId}`, {
          method: "DELETE",
          headers: { "x-auth-token": token },
        }).catch(() => {});
      }
    }
  }, [lsKey, userId]);

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
