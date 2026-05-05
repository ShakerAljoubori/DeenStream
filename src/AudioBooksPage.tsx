import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [pendingHeart, setPendingHeart] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(allAudioBooks.map((b) => b.category)))];
  const filtered = activeCategory === "All" ? allAudioBooks : allAudioBooks.filter((b) => b.category === activeCategory);

  return (
    <div className="p-8 pt-24 animate-in fade-in duration-500 min-h-screen bg-app-bg">
      <div className="flex items-center justify-between mb-8 text-white">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Audio <span style={{ background: "linear-gradient(135deg, #f5c451 0%, #e8a820 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Library</span></h1>
          <p className="text-text-muted">Your collection of audiobooks and deep-dives.</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="relative text-xs font-bold px-3 py-1 rounded-full"
                style={{
                  color: activeCategory === cat ? "#000" : "rgba(255,255,255,0.5)",
                  border: activeCategory === cat ? "none" : "1px solid rgba(255,255,255,0.08)",
                  background: activeCategory === cat ? "transparent" : "rgba(255,255,255,0.05)",
                }}
              >
                {activeCategory === cat && (
                  <motion.div
                    layoutId="audio-cat-pill"
                    className="absolute inset-0 rounded-full"
                    style={{ background: "linear-gradient(135deg, #22e696 0%, #16c47f 100%)" }}
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={onBack}
          className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-full border border-white/10 transition-all text-sm font-bold"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <AnimatePresence mode="popLayout">
        {filtered.map((book, i) => {
          const saved = isBookFavorite(book.id);
          return (
            <motion.div
              key={book.id}
              layout
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1, transition: { type: "spring", stiffness: 350, damping: 28, delay: Math.min(i * 0.045, 0.25) } }}
              exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.15 } }}
              className="group p-4 rounded-xl shadow-xl"
              style={{ background: "linear-gradient(145deg, #1a2820 0%, #141414 100%)", border: "1px solid rgba(255,255,255,0.05)" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(22,196,127,0.25)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)"}
            >
              <motion.div
                layoutId={`thumb-audio-${book.id}`}
                className="relative aspect-square mb-4 overflow-hidden shadow-2xl"
                style={{ borderRadius: 8 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
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
                    onClick={async (e) => { e.stopPropagation(); if (pendingHeart === book.id) return; setPendingHeart(book.id); await toggleBook(book.id); setPendingHeart(null); }}
                    className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 active:scale-95 ${
                      saved
                        ? "bg-[#16C47F]/20 text-[#16C47F] opacity-100"
                        : "bg-black/40 text-white/60 opacity-0 group-hover:opacity-100"
                    } ${pendingHeart === book.id ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {saved ? <IoHeart className="text-sm" /> : <IoHeartOutline className="text-sm" />}
                  </button>
                )}
              </motion.div>
              <div onClick={() => onSelectBook(book)} className="cursor-pointer">
                <h3 className="font-bold text-white truncate text-lg mb-1">{book.title}</h3>
                <p className="text-sm text-text-muted truncate mb-2">{book.author}</p>
                <span className="text-[10px] text-[#16C47F] font-bold uppercase tracking-widest bg-[#16C47F]/10 px-2 py-1 rounded">
                  {book.episodes.length} Episodes
                </span>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AudioBooksPage;
