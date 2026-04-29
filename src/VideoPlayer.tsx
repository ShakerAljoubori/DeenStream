import { useState, useRef, useEffect, useCallback } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";

interface VideoPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
  initialTimestamp?: number;
  onProgress?: (timestamp: number, duration: number, snapshot?: string) => void;
}

const VolumeIcon = ({ level }: { level: number }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {level > 0 && <path d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
    {level > 0.5 && <path d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 12C17.004 13.3308 16.4774 14.6024 15.54 15.54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}
  </svg>
);

const FullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 3H21V9M9 21H3V15M21 3L14 10M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SeekBackIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 0 1 0 12h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SeekForwardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 0 0 0 12h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const VideoPlayer = ({ url, title, onClose, initialTimestamp, onProgress }: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const lastProgressSaveRef = useRef(0);

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return "0:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  };
  
  // FIX: Using ReturnType<typeof setTimeout> removes the NodeJS namespace error
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { isPlaying: audioIsPlaying, togglePlay: pauseAudio } = useAudioPlayer();

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        if (audioIsPlaying) pauseAudio();
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying, audioIsPlaying, pauseAudio]);

  const captureSnapshot = (): string | undefined => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return undefined;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext("2d");
      if (!ctx) return undefined;
      ctx.drawImage(video, 0, 0, 320, 180);
      return canvas.toDataURL("image/jpeg", 0.7);
    } catch {
      return undefined; // CORS failure — silent fallback
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentProgress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      setProgress(currentProgress);
      setCurrentTime(videoRef.current.currentTime);

      // Save progress every 10 seconds while playing
      if (onProgress && videoRef.current.duration > 0) {
        const now = Date.now();
        if (now - lastProgressSaveRef.current >= 10000) {
          lastProgressSaveRef.current = now;
          onProgress(videoRef.current.currentTime, videoRef.current.duration, captureSnapshot());
        }
      }
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (videoRef.current) {
      const time = (Number(e.target.value) / 100) * videoRef.current.duration;
      videoRef.current.currentTime = time;
      setProgress(Number(e.target.value));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMuteState = !isMuted;
      setIsMuted(newMuteState);
      videoRef.current.muted = newMuteState;
      if (newMuteState) {
        setVolume(0);
      } else {
        setVolume(1);
        videoRef.current.volume = 1;
      }
    }
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const seek = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.currentTime + seconds, videoRef.current.duration));
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden group"
      onMouseMove={handleMouseMove}
      style={{ cursor: showControls ? "default" : "none" }}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => {
          if (videoRef.current) {
            setDuration(videoRef.current.duration);
            if (initialTimestamp && initialTimestamp > 0) {
              videoRef.current.currentTime = initialTimestamp;
            }
          }
        }}
        onClick={togglePlay}
        onPause={() => {
          setIsPlaying(false);
          if (onProgress && videoRef.current && videoRef.current.duration > 0) {
            onProgress(videoRef.current.currentTime, videoRef.current.duration, captureSnapshot());
          }
        }}
      />

      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 transition-opacity duration-500 flex flex-col justify-between p-6 ${showControls ? "opacity-100" : "opacity-0"}`}>
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-white font-bold text-lg drop-shadow-lg">{title}</h3>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#16C47F] animate-pulse" />
              <span className="text-[10px] text-white/60 uppercase tracking-widest font-medium">Now Streaming</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md border border-white/10">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <button onClick={togglePlay} className="w-20 h-20 bg-[#16C47F] rounded-full flex items-center justify-center text-black transform transition-all hover:scale-110 active:scale-95 shadow-2xl shadow-[#16C47F]/20">
            {isPlaying ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
        </div>

        <div className="space-y-4">
          <div className="relative group/progress h-1.5 flex items-center">
            <input type="range" min="0" max="100" value={progress} onChange={handleProgressChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-[#16C47F] rounded-full transition-all duration-100 relative" style={{ width: `${progress}%` }}>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg scale-0 group-hover/progress:scale-100 transition-transform" />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <button onClick={() => seek(-5)} className="flex flex-col items-center gap-0.5 text-white/60 hover:text-white transition-all">
                <SeekBackIcon />
                <span className="text-[8px] font-bold leading-none tracking-wide">5s</span>
              </button>
              <button onClick={togglePlay} className="text-white hover:text-[#16C47F] transition-all">
                {isPlaying ? (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                ) : (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                )}
              </button>
              <button onClick={() => seek(5)} className="flex flex-col items-center gap-0.5 text-white/60 hover:text-white transition-all">
                <SeekForwardIcon />
                <span className="text-[8px] font-bold leading-none tracking-wide">5s</span>
              </button>
              <div className="flex items-center gap-3 group/volume">
                <button onClick={(e) => { e.stopPropagation(); toggleMute(); }} className="text-white/60 hover:text-white transition-all outline-none">
                  <VolumeIcon level={volume} />
                </button>
                <input
                  type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange}
                  className="w-16 h-1 rounded-full appearance-none cursor-pointer accent-white"
                  style={{ background: `linear-gradient(to right, #16C47F ${volume * 100}%, rgba(255, 255, 255, 0.2) ${volume * 100}%)` }}
                />
              </div>
              <button onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }} className="text-white/60 hover:text-[#16C47F] transition-all">
                <FullscreenIcon />
              </button>
              <div className="text-[10px] font-bold text-[#16C47F] uppercase tracking-tighter bg-[#16C47F]/10 px-2 py-1 rounded border border-[#16C47F]/20">
                Lecture Mode
              </div>
            </div>
            <span className="text-xs font-mono text-white/40 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;