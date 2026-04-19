import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import type { AudioEpisode, AudioBook } from './data';

interface AudioPlayerContextType {
  currentEpisode: AudioEpisode | null;
  currentBook: AudioBook | null;
  isPlaying: boolean; // TypeScript needs this to stop the red lines
  currentTime: number;
  duration: number;
  volume: number;
  playEpisode: (episode: AudioEpisode, book: AudioBook) => void;
  togglePlay: () => void; // TypeScript needs this to stop the red lines
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

  useEffect(() => {
    const audio = audioRef.current;

    const setAudioData = () => {
      setDuration(audio.duration);
    };

    const setAudioTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadeddata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadeddata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

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