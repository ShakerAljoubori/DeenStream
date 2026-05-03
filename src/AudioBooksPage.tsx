import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { allAudioBooks } from "./data";
import type { AudioBook } from "./data";
import { useFavorites } from "./FavoritesContext";

interface AudioBooksPageProps {
  onBack: () => void;
  onSelectBook: (book: AudioBook) => void;
  user: { name: string; email: string } | null;
}

const AudioBooksPage = ({ onBack, onSelectBook, user }: AudioBooksPageProps) => {
  const { isBookFavorite, toggleBook } = useFavorites();

  return (
    <div className="p-8 pt-24 animate-in fade-in duration-500 min-h-screen bg-app-bg">
      <div className="flex items-center justify-between mb-8 text-white">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Audio <span style={{ background: "linear-gradient(135deg, #f5c451 0%, #e8a820 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Library</span></h1>
          <p className="text-text-muted">Your collection of audiobooks and deep-dives.</p>
        </div>
        <button
          onClick={onBack}
          className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-full border border-white/10 transition-all text-sm font-bold"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {allAudioBooks.map((book) => {
          const saved = isBookFavorite(book.id);
          return (
            <div
              key={book.id}
              className="group p-4 rounded-xl transition-all duration-300 shadow-xl"
              style={{ background: "linear-gradient(145deg, #1a2820 0%, #141414 100%)", border: "1px solid rgba(255,255,255,0.05)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(22,196,127,0.25)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)"}
            >
              <div className="relative aspect-square mb-4 overflow-hidden rounded-lg shadow-2xl">
                <img
                  src={book.image}
                  alt={book.title}
                  onClick={() => onSelectBook(book)}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                />
                {/* Play button on hover */}
                <div
                  onClick={() => onSelectBook(book)}
                  className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 cursor-pointer"
                >
                  <div className="p-3 rounded-full shadow-lg transform hover:scale-110" style={{ background: "linear-gradient(135deg, #22e696 0%, #16c47f 100%)" }}>
                    <span className="text-black text-xl">▶</span>
                  </div>
                </div>
                {/* Heart — always visible if saved, appears on hover if not */}
                {user && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleBook(book.id); }}
                    className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 active:scale-95 ${
                      saved
                        ? "bg-[#16C47F]/20 text-[#16C47F] opacity-100"
                        : "bg-black/40 text-white/60 opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {saved ? <IoHeart className="text-sm" /> : <IoHeartOutline className="text-sm" />}
                  </button>
                )}
              </div>
              <div onClick={() => onSelectBook(book)} className="cursor-pointer">
                <h3 className="font-bold text-white truncate text-lg mb-1">{book.title}</h3>
                <p className="text-sm text-text-muted truncate mb-2">{book.author}</p>
                <span className="text-[10px] text-[#16C47F] font-bold uppercase tracking-widest bg-[#16C47F]/10 px-2 py-1 rounded">
                  {book.episodes.length} Episodes
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AudioBooksPage;
