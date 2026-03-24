import { useState, useRef, useEffect, useCallback } from 'react';

interface VideoPlayerProps {
  url: string;
  title: string;
  onClose: () => void;
}

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 17L6 12L11 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 17L13 12L18 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ForwardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13 17L18 12L13 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6 17L11 12L6 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Fullscreen Icon Component
const FullscreenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 3H21V9M9 21H3V15M21 3L14 10M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VideoPlayer = ({ url, title, onClose }: VideoPlayerProps) => {
  const [isHovering, setIsHovering] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null); // Ref for the whole UI
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const timeTextRef = useRef<HTMLSpanElement>(null);
  const requestRef = useRef<number | null>(null);

  // --- Logic Helpers ---
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const skipTime = (amount: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(videoRef.current.duration, videoRef.current.currentTime + amount));
      updateVisuals();
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleSeek = (e: React.MouseEvent | MouseEvent) => {
    if (!progressBarRef.current || !videoRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const percentage = Math.max(0, Math.min(1, pos));
    const newTime = percentage * videoRef.current.duration;
    videoRef.current.currentTime = newTime;
    if (progressFillRef.current) progressFillRef.current.style.transform = `scaleX(${percentage}) translate3d(0,0,0)`;
    if (timeTextRef.current) timeTextRef.current.innerText = formatTime(newTime);
  };

  const updateVisuals = useCallback(() => {
    if (videoRef.current && progressFillRef.current && !isDragging) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      if (total > 0) {
        const percentage = current / total;
        progressFillRef.current.style.transform = `scaleX(${percentage}) translate3d(0,0,0)`;
        if (timeTextRef.current) timeTextRef.current.innerText = formatTime(current);
      }
    }
    requestRef.current = requestAnimationFrame(updateVisuals);
  }, [isDragging]);

  const togglePlay = () => {
    if (videoRef.current) {
      videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
      setIsPlaying(!videoRef.current.paused);
    }
  };

  // --- Effects ---
  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
      if (e.code === 'KeyF') { e.preventDefault(); toggleFullscreen(); }
      if (e.code === 'ArrowRight') skipTime(5);
      if (e.code === 'ArrowLeft') skipTime(-5);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => { if (isDragging) handleSeek(e); };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(updateVisuals);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [updateVisuals]);

  return (
    <div className="fixed inset-0 z-[999] bg-black/95 flex items-center justify-center p-4 md:p-20 backdrop-blur-sm select-none">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div 
        ref={playerContainerRef}
        className={`relative w-full max-w-5xl aspect-video bg-black overflow-hidden transition-all duration-500
          ${isFullscreen ? 'max-w-none h-screen rounded-0' : 'rounded-2xl shadow-[0_0_50px_rgba(22,196,127,0.2)] border border-white/10'}
        `}
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
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* UI Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 transition-opacity duration-300 ${isHovering || isDragging ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-center">
            <h4 className="text-white font-medium tracking-wide">{title}</h4>
            <button onClick={onClose} className="bg-white/10 hover:bg-[#16C47F] hover:text-black text-white w-10 h-10 rounded-full flex items-center justify-center transition-all">✕</button>
          </div>

          <div className="absolute bottom-0 inset-x-0 p-6 space-y-4">
            <div 
              ref={progressBarRef} 
              onMouseDown={(e) => { e.stopPropagation(); setIsDragging(true); handleSeek(e); }}
              onClick={(e) => { e.stopPropagation(); handleSeek(e); }}
              className="group relative h-1.5 w-full bg-white/20 rounded-full cursor-pointer overflow-hidden transition-all hover:h-2.5"
            >
              <div ref={progressFillRef} className="absolute inset-0 bg-[#16C47F] origin-left will-change-transform" style={{ transform: 'scaleX(0) translate3d(0,0,0)' }} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <button onClick={(e) => { e.stopPropagation(); skipTime(-5); }} className="text-white/60 hover:text-[#16C47F] transition-all hover:scale-110 active:scale-95">
                    <BackIcon />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="text-white hover:text-[#16C47F] transition-all hover:scale-110 active:scale-90 w-8 text-center">
                    <span className="text-3xl">{isPlaying ? '⏸' : '▶'}</span>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); skipTime(5); }} className="text-white/60 hover:text-[#16C47F] transition-all hover:scale-110 active:scale-95">
                    <ForwardIcon />
                  </button>
                </div>
                
                <div className="text-sm font-mono text-white/80 tabular-nums">
                  <span ref={timeTextRef} className="text-white">0:00</span>
                  <span className="mx-1 text-white/40">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                  className="text-white/60 hover:text-[#16C47F] transition-all hover:scale-110"
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
    </div>
  );
};

export default VideoPlayer;