import { IoArrowBack, IoPlay, IoPause, IoTimeOutline } from "react-icons/io5";
import { useAudioPlayer } from "./AudioPlayerContext";
import type { AudioBook } from "./data";

interface AudioPlayerPageProps {
  book: AudioBook;
  onBack: () => void;
}

const AudioPlayerPage = ({ book, onBack }: AudioPlayerPageProps) => {
  // Pull the audio controls and state from our global context
  const { playEpisode, currentEpisode, currentBook, isPlaying, togglePlay } = useAudioPlayer();

  // Helper to check if a specific episode is the one currently active
  const isCurrentEpisode = (episodeId: number) => currentEpisode?.id === episodeId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a2a2a] to-app-bg text-white pt-24 animate-in fade-in duration-500">
      
      <div className="p-8 flex flex-col md:flex-row gap-8 items-end relative">
        <button 
          onClick={onBack}
          className="absolute -top-4 left-8 p-2 bg-black/40 rounded-full hover:bg-black/60 transition z-10 border border-white/10"
        >
          <IoArrowBack size={24} />
        </button>
        
        <img 
          src={book.image} 
          alt={book.title} 
          className="w-48 h-48 md:w-64 md:h-64 shadow-[0_8px_40px_rgba(0,0,0,0.5)] rounded-md object-cover" 
        />
        
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">Audiobook</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">{book.title}</h1>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="">{book.author}</span>
            <span className="text-text-muted">•</span>
            <span className="text-text-muted">{book.episodes.length} Episodes</span>
          </div>
        </div>
      </div>

      <div className="p-8 mt-8 bg-black/20 min-h-screen backdrop-blur-sm">
        <div className="flex items-center gap-6 mb-8">
          {/* Main Play Button: Plays first episode or toggles current */}
          <button 
            onClick={() => {
              if (currentEpisode && currentBook?.id === book.id) togglePlay();
              else if (book.episodes.length > 0) playEpisode(book.episodes[0], book);
            }}
            className="w-14 h-14 bg-brand-primary rounded-full flex items-center justify-center text-black hover:scale-105 transition shadow-lg active:scale-95"
          >
            {isPlaying && currentBook?.id === book.id ? <IoPause size={30} /> : <IoPlay size={30} className="ml-1" />}
          </button>
        </div>

        <div className="grid grid-cols-[40px_1fr_80px] gap-4 px-4 py-2 text-text-muted border-b border-white/10 text-xs font-bold uppercase tracking-wider mb-4">
          <span className="text-center">#</span>
          <span>Title</span>
          <div className="flex justify-end pr-4">
            <IoTimeOutline size={18} />
          </div>
        </div>

        <div className="flex flex-col">
          {book.episodes.map((episode, index) => {
            const isActive = isCurrentEpisode(episode.id);
            
            return (
              <div 
                key={episode.id}
                onClick={() => playEpisode(episode, book)}
                className="grid grid-cols-[40px_1fr_80px] gap-4 px-4 py-3 items-center hover:bg-white/5 rounded-md transition-colors group cursor-pointer"
              >
                <div className="flex justify-center items-center">
                  {isActive && isPlaying ? (
                    <IoPause className="text-brand-primary" size={16} />
                  ) : (
                    <>
                      <span className={`text-sm ${isActive ? 'text-brand-primary' : 'text-text-muted'} group-hover:hidden`}>
                        {index + 1}
                      </span>
                      <IoPlay className="hidden group-hover:block text-brand-primary" size={16} />
                    </>
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <p className={`font-medium truncate transition-colors ${isActive ? 'text-brand-primary' : 'text-white'} group-hover:text-brand-primary`}>
                    {episode.title}
                  </p>
                  <p className="text-xs text-text-muted truncate">
                    {book.author}
                  </p>
                </div>

                <span className="text-sm text-text-muted text-right pr-4">
                  {episode.duration}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerPage;