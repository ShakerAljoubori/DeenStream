import { useState, useRef, useEffect, useCallback } from "react";

interface VideoPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
}

const VolumeIcon = ({ level }: { level: number }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11 5L6 9H2V15H6L11 19V5Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {level > 0 && (
      <path
        d="M19.07 4.93C20.9447 6.80528 21.9979 9.34836 21.9979 12C21.9979 14.6516 20.9447 17.1947 19.07 19.07"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
    {level > 0.5 && (
      <path
        d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 12C17.004 13.3308 16.4774 14.6024 15.54 15.54"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
    {level === 0 && (
      <>
        <line
          x1="23"
          y1="9"
          x2="17"
          y2="15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="17"
          y1="9"
          x2="23"
          y2="15"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    )}
  </svg>
);

const BackIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M11 17L6 12L11 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 17L13 12L18 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ForwardIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M13 17L18 12L13 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 17L11 12L6 7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const FullscreenIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 3H21V9M9 21H3V15M21 3L14 10M3 21L10 14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const VideoPlayer = ({ url, title, onClose }: VideoPlayerProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pulseIcon, setPulseIcon] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(1);
  const [prevVolume, setPrevVolume] = useState(1); // Track volume for mute/unmute toggle

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);
  const requestRef = useRef<number | null>(null);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      const paddedMins = mins < 10 ? `0${mins}` : mins;
      return `${hrs}:${paddedMins}:${secs < 10 ? "0" : ""}${secs}`;
    }
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const triggerAnimation = (icon: string) => {
    setPulseIcon(icon);
    setTimeout(() => setPulseIcon(null), 500);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        triggerAnimation("▶");
      } else {
        videoRef.current.pause();
        triggerAnimation("⏸");
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      if (volume > 0) {
        setPrevVolume(volume);
        setVolume(0);
        videoRef.current.volume = 0;
      } else {
        const newVolume = prevVolume === 0 ? 0.5 : prevVolume;
        setVolume(newVolume);
        videoRef.current.volume = newVolume;
      }
    }
  };

  const skipTime = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(
          videoRef.current.duration,
          videoRef.current.currentTime + amount,
        ),
      );
      if (amount > 0) triggerAnimation("»");
      else triggerAnimation("«");
      updateVisuals();
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement)
      playerContainerRef.current.requestFullscreen();
    else document.exitFullscreen();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) setPrevVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
  };

  const handleSeek = (e: React.MouseEvent | MouseEvent) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const percentage = Math.max(0, Math.min(1, pos));
    const newTime = percentage * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    if (progressFillRef.current)
      progressFillRef.current.style.transform = `scaleX(${percentage}) translate3d(0,0,0)`;
    if (timeTextRef.current)
      timeTextRef.current.innerText = formatTime(newTime);
  };

  const updateVisuals = useCallback(() => {
    if (videoRef.current && progressFillRef.current && !isDragging) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      if (total > 0) {
        const percentage = current / total;
        progressFillRef.current.style.transform = `scaleX(${percentage}) translate3d(0,0,0)`;
        if (timeTextRef.current)
          timeTextRef.current.innerText = formatTime(current);
      }
    }
    requestRef.current = requestAnimationFrame(updateVisuals);
  }, [isDragging]);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      }
      if (e.code === "KeyF") {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.code === "KeyM") {
        e.preventDefault();
        toggleMute();
      }
      if (e.code === "ArrowRight") {
        e.preventDefault();
        skipTime(5);
      }
      if (e.code === "ArrowLeft") {
        e.preventDefault();
        skipTime(-5);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [volume, prevVolume]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) handleSeek(e);
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateVisuals);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [updateVisuals]);

  return (
    <div
      ref={playerContainerRef}
      className={`relative w-full h-full bg-black overflow-hidden select-none transition-all duration-500 ${isFullscreen ? "fixed inset-0 z-[999]" : "aspect-video"}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full cursor-pointer object-contain"
        autoPlay
        playsInline
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onSeeking={() => setIsLoading(true)}
        onSeeked={() => setIsLoading(false)}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="w-12 h-12 border-4 border-white/20 border-t-[#16C47F] rounded-full animate-spin" />
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div
          className={`w-20 h-20 bg-black/50 rounded-full flex items-center justify-center text-white transition-all duration-300 ${pulseIcon ? "opacity-100 scale-125" : "opacity-0 scale-100"}`}
        >
          <span className="text-4xl font-bold">{pulseIcon}</span>
        </div>
      </div>

      <div
        onClick={togglePlay}
        className={`absolute inset-0 cursor-pointer bg-gradient-to-t from-black/90 via-transparent to-black/40 transition-opacity duration-300 ${isHovering || isDragging || !isPlaying ? "opacity-100" : "opacity-0"}`}
      >
        <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center">
          <h4 className="text-white font-medium tracking-wide">{title}</h4>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="bg-white/10 hover:bg-[#16C47F] hover:text-black text-white w-10 h-10 rounded-full flex items-center justify-center transition-all"
          >
            ✕
          </button>
        </div>

        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-0 inset-x-0 p-6 space-y-4 cursor-default"
        >
          <div
            ref={progressBarRef}
            onMouseDown={(e) => {
              e.stopPropagation();
              setIsDragging(true);
              handleSeek(e);
            }}
            className="group relative h-1.5 w-full bg-white/20 rounded-full cursor-pointer overflow-hidden transition-all hover:h-2.5"
          >
            <div
              ref={progressFillRef}
              className="absolute inset-0 bg-[#16C47F] origin-left will-change-transform"
              style={{ transform: "scaleX(0) translate3d(0,0,0)" }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    skipTime(-5);
                  }}
                  className="text-white/60 hover:text-[#16C47F] transition-all"
                >
                  <BackIcon />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="text-white hover:text-[#16C47F] w-8 text-center"
                >
                  <span className="text-3xl">{isPlaying ? "⏸" : "▶"}</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    skipTime(5);
                  }}
                  className="text-white/60 hover:text-[#16C47F] transition-all"
                >
                  <ForwardIcon />
                </button>
              </div>
              <div className="text-sm font-mono text-white/80 tabular-nums">
                <span ref={timeTextRef} className="text-white">
                  0:00
                </span>
                <span className="mx-1 text-white/40">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 group/volume">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="text-white/60 hover:text-white transition-all outline-none"
                >
                  <VolumeIcon level={volume} />
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 rounded-full appearance-none cursor-pointer accent-white"
                  style={{
                    background: `linear-gradient(to right, #16C47F ${volume * 100}%, rgba(255, 255, 255, 0.2) ${volume * 100}%)`,
                  }}
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFullscreen();
                }}
                className="text-white/60 hover:text-[#16C47F] transition-all"
              >
                <FullscreenIcon />
              </button>
              <div className="text-[10px] font-bold text-[#16C47F] uppercase tracking-tighter bg-[#16C47F]/10 px-2 py-1 rounded border border-[#16C47F]/20">
                Lecture Mode
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
