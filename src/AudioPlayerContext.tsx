import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { AudioEpisode, AudioBook } from './data';
import { useAudioProgress } from './AudioProgressContext';

interface AudioPlayerContextType {
  currentEpisode: AudioEpisode | null;
  currentBook: AudioBook | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playEpisode: (episode: AudioEpisode, book: AudioBook, startAt?: number) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skip: (seconds: number) => void;
  setVolume: (volume: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentEpisode, setCurrentEpisode] = useState<AudioEpisode | null>(null);
  const [currentBook, setCurrentBook] = useState<AudioBook | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);

  const audioRef = useRef<HTMLAudioElement>(new Audio());
  // Seek target for when a new src is loading (can't seek until loadeddata fires)
  const pendingSeekRef = useRef<number>(0);
  // Debounce ref: stores Date.now() of last progress save
  const lastProgressSaveRef = useRef<number>(0);
  // Refs to avoid stale closures inside event handlers
  const currentBookRef = useRef<AudioBook | null>(null);
  const currentEpisodeRef = useRef<AudioEpisode | null>(null);

  const { saveAudioProgress } = useAudioProgress();

  useEffect(() => { currentBookRef.current = currentBook; }, [currentBook]);
  useEffect(() => { currentEpisodeRef.current = currentEpisode; }, [currentEpisode]);

  useEffect(() => {
    const audio = audioRef.current;

    const handleLoadedData = () => {
      setDuration(audio.duration);
      if (pendingSeekRef.current > 0) {
        audio.currentTime = pendingSeekRef.current;
        pendingSeekRef.current = 0;
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration > 0 && currentBookRef.current && currentEpisodeRef.current) {
        const now = Date.now();
        if (now - lastProgressSaveRef.current >= 10000) {
          lastProgressSaveRef.current = now;
          saveAudioProgress(
            currentBookRef.current.id,
            currentEpisodeRef.current.id,
            audio.currentTime,
            audio.duration
          );
        }
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handlePause = () => {
      setIsPlaying(false);
      if (audio.duration > 0 && currentBookRef.current && currentEpisodeRef.current) {
        saveAudioProgress(
          currentBookRef.current.id,
          currentEpisodeRef.current.id,
          audio.currentTime,
          audio.duration
        );
      }
    };

    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('pause', handlePause);
    };
  }, [saveAudioProgress]);

  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const playEpisode = (episode: AudioEpisode, book: AudioBook, startAt?: number) => {
    if (currentEpisode?.id === episode.id && currentBook?.id === book.id) {
      if (startAt && startAt > 0) {
        audioRef.current.currentTime = startAt;
      }
      if (!isPlaying) {
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    pendingSeekRef.current = startAt ?? 0;
    audioRef.current.src = episode.url;
    audioRef.current.play();
    setCurrentEpisode(episode);
    setCurrentBook(book);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      if (audioRef.current.src) {
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.min(
        Math.max(0, audioRef.current.currentTime + seconds),
        duration
      );
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  return (
    <AudioPlayerContext.Provider value={{
      currentEpisode,
      currentBook,
      isPlaying,
      currentTime,
      duration,
      volume,
      playEpisode,
      togglePlay,
      seek,
      skip,
      setVolume
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
