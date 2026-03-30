import { IoPlay, IoPause, IoVolumeHighOutline } from "react-icons/io5";
import { MdReplay5, MdForward5 } from "react-icons/md";
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

  if (!currentEpisode || !currentBook) return null;

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate percentage for the green "progress" fill
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#121212] border-t border-white/10 px-4 flex items-center justify-between z-[100] backdrop-blur-md">
      
      {/* Left: Episode Info */}
      <div className="flex items-center gap-4 w-[30%]">
        <img src={currentBook.image} alt={currentBook.title} className="w-12 h-12 rounded shadow-lg object-cover" />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-white truncate hover:underline cursor-pointer">{currentEpisode.title}</span>
          <span className="text-xs text-text-muted truncate hover:underline cursor-pointer">{currentBook.author}</span>
        </div>
      </div>

      {/* Center: Controls & Progress */}
      <div className="flex flex-col items-center gap-2 w-[40%] max-w-xl">
        <div className="flex items-center gap-6">
          <button onClick={() => skip(-5)} className="text-text-muted hover:text-white transition active:scale-90">
            <MdReplay5 size={26} />
          </button>

          <button 
            onClick={togglePlay}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition active:scale-95 shadow-lg"
          >
            {isPlaying ? <IoPause size={24} /> : <IoPlay size={24} className="ml-0.5" />}
          </button>

          <button onClick={() => skip(5)} className="text-text-muted hover:text-white transition active:scale-90">
            <MdForward5 size={26} />
          </button>
        </div>
        
        {/* Progress Bar with Dynamic Green Fill */}
        <div className="flex items-center gap-2 w-full group">
          <span className="text-[10px] text-text-muted min-w-[35px] text-right">
            {formatTime(currentTime)}
          </span>
          
          <input 
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            style={{
              background: `linear-gradient(to right, #16C47F ${progressPercent}%, rgba(255, 255, 255, 0.1) ${progressPercent}%)`
            }}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer accent-[#16C47F] transition-all" 
          />

          <span className="text-[10px] text-text-muted min-w-[35px]">
            {currentEpisode.duration}
          </span>
        </div>
      </div>

      {/* Right: Volume with Dynamic White Fill */}
      <div className="flex items-center justify-end gap-3 w-[30%]">
        <IoVolumeHighOutline size={20} className="text-text-muted" />
        <input 
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          style={{
            background: `linear-gradient(to right, white ${volume * 100}%, rgba(255, 255, 255, 0.1) ${volume * 100}%)`
          }}
          className="w-24 h-1 rounded-full appearance-none cursor-pointer accent-white"
        />
      </div>
    </div>
  );
};

export default AudioStickyPlayer;