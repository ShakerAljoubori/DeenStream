import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { AudioEpisode, AudioBook } from './data';

interface AudioPlayerContextType {
  currentEpisode: AudioEpisode | null;
  currentBook: AudioBook | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playEpisode: (episode: AudioEpisode, book: AudioBook) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  skip: (seconds: number) => void; // Added
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

  useEffect(() => {
    const audio = audioRef.current;

    const setAudioData = () => setDuration(audio.duration);
    const setAudioTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);

    // Listen for metadata (to get duration) and time updates
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Sync volume state with actual audio object
  useEffect(() => {
    audioRef.current.volume = volume;
  }, [volume]);

  const playEpisode = (episode: AudioEpisode, book: AudioBook) => {
    if (currentEpisode?.id === episode.id && currentBook?.id === book.id) {
      togglePlay();
      return;
    }

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
      if (audioRef.current.src) audioRef.current.play();
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
      // Calculate new time and clamp it between 0 and duration
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
      skip, // Provided to the app
      setVolume 
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
  return context;
};