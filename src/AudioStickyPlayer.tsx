import { IoPlay, IoPause, IoVolumeHighOutline, IoClose } from "react-icons/io5";
import { MdReplay5, MdForward5 } from "react-icons/md";
import { useState, useEffect } from "react";
import { useAudioPlayer } from "./AudioPlayerContext";

const AudioStickyPlayer = () => {
  const {
    currentEpisode,
    currentBook,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seek,
    skip,
    volume,
    setVolume
  } = useAudioPlayer();

  const [dismissed, setDismissed] = useState(false);

  // Re-show the player whenever a new episode is started
  useEffect(() => {
    setDismissed(false);
  }, [currentEpisode?.id]);

  if (!currentEpisode || !currentBook || dismissed) return null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTogglePlay = () => {
    if (!isPlaying) {
      const videos = document.querySelectorAll("video");
      videos.forEach((video) => {
        if (!video.paused) video.pause();
      });
    }
    togglePlay();
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#121212] border-t border-white/10 px-4 flex items-center justify-between z-[100] backdrop-blur-md">
      <div className="flex items-center gap-4 w-[30%]">
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
          <img src={currentBook.image} alt={currentBook.title} className="w-full h-full object-cover" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-white truncate">{currentEpisode.title}</h4>
          <p className="text-xs text-text-muted truncate">{currentBook.author}</p>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 w-[40%]">
        <div className="flex items-center gap-6">
          <button onClick={() => skip(-5)} className="text-text-muted hover:text-white transition-colors">
            <MdReplay5 size={24} />
          </button>
          <button 
            onClick={handleTogglePlay}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 transition-transform"
          >
            {isPlaying ? <IoPause size={24} /> : <IoPlay size={24} className="ml-1" />}
          </button>
          <button onClick={() => skip(5)} className="text-text-muted hover:text-white transition-colors">
            <MdForward5 size={24} />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full max-w-md">
          <span className="text-[10px] text-text-muted min-w-[35px] text-right">{formatTime(currentTime)}</span>
          <input 
            type="range" min="0" max={duration || 0} value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            style={{ background: `linear-gradient(to right, #16C47F ${progressPercent}%, rgba(255, 255, 255, 0.1) ${progressPercent}%)` }}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer accent-[#16C47F] transition-all" 
          />
          <span className="text-[10px] text-text-muted min-w-[35px]">{currentEpisode.duration}</span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 w-[30%]">
        <IoVolumeHighOutline size={20} className="text-text-muted" />
        <input
          type="range" min="0" max="1" step="0.01" value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{ background: `linear-gradient(to right, #ffffff ${volume * 100}%, rgba(255, 255, 255, 0.1) ${volume * 100}%)` }}
          className="w-24 h-1 rounded-full appearance-none cursor-pointer accent-white"
        />
        <button
          onClick={() => { if (isPlaying) togglePlay(); setDismissed(true); }}
          className="ml-2 w-7 h-7 rounded-full flex items-center justify-center text-text-muted hover:text-white hover:bg-white/10 transition-all duration-200"
          title="Dismiss player"
        >
          <IoClose size={16} />
        </button>
      </div>
    </div>
  );
};

export default AudioStickyPlayer;