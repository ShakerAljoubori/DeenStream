import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoHeartOutline, IoHeart, IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { allSeries, allAudioBooks } from "./data";
import type { AudioBook, Series, Episode, AudioEpisode } from "./data";
import { useFavorites } from "./FavoritesContext";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

interface FavoritesProps {
  user: { name: string; email: string } | null;
  onLogin: () => void;
  onRegister: () => void;
  onSelectSeries: (seriesId: string, episodeId?: number) => void;
  onSelectBook: (book: AudioBook, episodeId?: number) => void;
}

// ─── Login Gate ────────────────────────────────────────────────────────────────
function LoginGate({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="text-center space-y-6 max-w-sm">
        <motion.div
          className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 0.05 }}
        >
          <IoHeartOutline className="text-5xl text-white/20" />
        </motion.div>
        <motion.div
          className="space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.13 }}
        >
          <h2 className="text-2xl font-bold text-white">Sign in to see your favorites</h2>
          <p className="text-sm text-white/40 leading-relaxed">
            Save series and bookmark individual lectures to access them anytime.
          </p>
        </motion.div>
        <motion.div
          className="flex gap-3 justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.21 }}
        >
          <button
            onClick={onLogin}
            className="px-6 py-2.5 text-black font-bold rounded-xl hover:brightness-110 transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #22e696 0%, #16c47f 60%, #0db36e 100%)" }}
          >
            Sign In
          </button>
          <button
            onClick={onRegister}
            className="px-6 py-2.5 bg-white/5 text-white font-medium rounded-xl border border-white/10 hover:bg-white/10 transition-all"
          >
            Create Account
          </button>
        </motion.div>
      </div>
    </div>
  );
}

// ─── Saved Series Tab ──────────────────────────────────────────────────────────
function SavedSeriesTab({
  onSelectSeries,
  onSelectBook,
}: {
  onSelectSeries: (id: string, episodeId?: number) => void;
  onSelectBook: (book: AudioBook, episodeId?: number) => void;
}) {
  const { seriesIds, bookIds, toggleSeries, toggleBook } = useFavorites();
  const series = allSeries.filter((s) => seriesIds.includes(s.id));
  const books = allAudioBooks.filter((b) => bookIds.includes(b.id));

  if (series.length === 0 && books.length === 0) {
    return (
      <EmptyState
        icon={<IoHeartOutline className="text-4xl text-white/20" />}
        text="No saved series yet"
        sub="Tap the heart icon on any series or audiobook to save it here."
      />
    );
  }

  return (
    <div className="space-y-10">
      {series.length > 0 && (
        <section className="space-y-4">
          <SectionHeader label="Video Lectures" count={series.length} />
          <div className="flex flex-wrap gap-4">
            <AnimatePresence mode="popLayout">
              {series.map((s, i) => (
                <SeriesCard
                  key={s.id}
                  series={s}
                  index={i}
                  onSelect={() => onSelectSeries(s.id)}
                  onRemove={() => toggleSeries(s.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
      {books.length > 0 && (
        <section className="space-y-4">
          <SectionHeader label="Audio Books" count={books.length} />
          <div className="flex flex-wrap gap-4">
            <AnimatePresence mode="popLayout">
              {books.map((b, i) => (
                <BookCard
                  key={b.id}
                  book={b}
                  index={i}
                  onSelect={() => onSelectBook(b)}
                  onRemove={() => toggleBook(b.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Saved Lectures Tab ────────────────────────────────────────────────────────
function SavedLecturesTab({
  onSelectSeries,
  onSelectBook,
}: {
  onSelectSeries: (id: string, episodeId?: number) => void;
  onSelectBook: (book: AudioBook, episodeId?: number) => void;
}) {
  const { videoEpisodes, audioEpisodes, toggleVideoEpisode, toggleAudioEpisode } = useFavorites();

  type VideoGroup = { series: Series; episodes: Episode[] };
  const videoGroups = videoEpisodes.reduce<Record<string, VideoGroup>>((acc, { seriesId, episodeId }) => {
    const series = allSeries.find((s) => s.id === seriesId);
    if (!series) return acc;
    const episode = series.episodes.find((e) => e.id === episodeId);
    if (!episode) return acc;
    if (!acc[seriesId]) acc[seriesId] = { series, episodes: [] };
    acc[seriesId].episodes.push(episode);
    return acc;
  }, {});

  type AudioGroup = { book: AudioBook; episodes: AudioEpisode[] };
  const audioGroups = audioEpisodes.reduce<Record<string, AudioGroup>>((acc, { bookId, episodeId }) => {
    const book = allAudioBooks.find((b) => b.id === bookId);
    if (!book) return acc;
    const episode = book.episodes.find((e) => e.id === episodeId);
    if (!episode) return acc;
    if (!acc[bookId]) acc[bookId] = { book, episodes: [] };
    acc[bookId].episodes.push(episode);
    return acc;
  }, {});

  const hasVideo = Object.keys(videoGroups).length > 0;
  const hasAudio = Object.keys(audioGroups).length > 0;

  if (!hasVideo && !hasAudio) {
    return (
      <EmptyState
        icon={<IoBookmarkOutline className="text-4xl text-white/20" />}
        text="No bookmarked lectures yet"
        sub="Tap the bookmark icon on any episode to save it here."
      />
    );
  }

  return (
    <div className="space-y-10">
      {hasVideo && (
        <section className="space-y-4">
          <SectionHeader label="Video Lectures" count={videoEpisodes.length} />
          <div className="space-y-6">
            {Object.values(videoGroups).map(({ series, episodes }) => (
              <div key={series.id} className="space-y-2">
                <button
                  onClick={() => onSelectSeries(series.id)}
                  className="text-xs font-bold text-[#16C47F] uppercase tracking-widest hover:underline"
                >
                  {series.title}
                </button>
                <AnimatePresence mode="popLayout">
                  {episodes.map((ep, i) => (
                    <EpisodeRow
                      key={ep.id}
                      index={i}
                      title={ep.title}
                      duration={ep.duration}
                      onPlay={() => onSelectSeries(series.id, ep.id)}
                      onRemove={() => toggleVideoEpisode(series.id, ep.id)}
                      isVideo
                    />
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      )}
      {hasAudio && (
        <section className="space-y-4">
          <SectionHeader label="Audio Lectures" count={audioEpisodes.length} />
          <div className="space-y-6">
            {Object.values(audioGroups).map(({ book, episodes }) => (
              <div key={book.id} className="space-y-2">
                <button
                  onClick={() => onSelectBook(book)}
                  className="text-xs font-bold text-[#16C47F] uppercase tracking-widest hover:underline"
                >
                  {book.title}
                </button>
                <AnimatePresence mode="popLayout">
                  {episodes.map((ep, i) => (
                    <EpisodeRow
                      key={ep.id}
                      index={i}
                      title={ep.title}
                      duration={ep.duration}
                      onPlay={() => onSelectBook(book, ep.id)}
                      onRemove={() => toggleAudioEpisode(book.id, ep.id)}
                      isVideo={false}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Shared sub-components ─────────────────────────────────────────────────────
function EmptyState({ icon, text, sub }: { icon: React.ReactNode; text: string; sub: string }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-24 text-center space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...spring }}
    >
      <motion.div
        className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        {icon}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.12 }}
      >
        <h2 className="text-xl font-semibold text-white/60">{text}</h2>
        <p className="text-sm text-white/30 max-w-xs mt-1">{sub}</p>
      </motion.div>
    </motion.div>
  );
}

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-bold text-white">{label}</h2>
      <span className="text-xs font-bold text-[#16C47F] bg-[#16C47F]/10 border border-[#16C47F]/20 px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
}

function SeriesCard({
  series, index, onSelect, onRemove,
}: {
  series: Series; index: number; onSelect: () => void; onRemove: () => void;
}) {
  return (
    <motion.div
      className="group cursor-pointer w-[220px]"
      onClick={onSelect}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ ...spring, delay: Math.min(index * 0.05, 0.3) }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        layoutId={`thumb-${series.id}`}
        className="relative aspect-video rounded-xl overflow-hidden bg-app-card transition-all duration-300"
        style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}
        whileHover={{ boxShadow: "0 0 0 1px rgba(22,196,127,0.5), 0 8px 32px rgba(22,196,127,0.18)" }}
      >
        {series.thumbnail ? (
          <img
            src={series.thumbnail}
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <span className="text-white/20 text-4xl">▶</span>
          </div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-[#16C47F] hover:scale-110 transition-all active:scale-95"
        >
          <IoHeart className="text-sm" />
        </button>
      </motion.div>
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-semibold text-white group-hover:text-[#16C47F] transition-colors leading-snug">{series.title}</h3>
        <p className="text-xs text-white/40 mt-0.5">{series.instructor}</p>
        <p className="text-xs text-white/25 mt-0.5">{series.episodes.length} episodes</p>
      </div>
    </motion.div>
  );
}

function BookCard({
  book, index, onSelect, onRemove,
}: {
  book: AudioBook; index: number; onSelect: () => void; onRemove: () => void;
}) {
  return (
    <motion.div
      className="group p-3 rounded-xl w-[190px]"
      style={{ background: "linear-gradient(145deg, #1a2820 0%, #141414 100%)", border: "1px solid rgba(255,255,255,0.05)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(22,196,127,0.25)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)"; }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ ...spring, delay: Math.min(index * 0.05, 0.3) }}
      whileTap={{ scale: 0.97 }}
    >
      <motion.div
        layoutId={`thumb-audio-${book.id}`}
        className="relative aspect-square mb-3 overflow-hidden shadow-xl"
        style={{ borderRadius: 8 }}
        transition={spring}
        onClick={onSelect}
      >
        <img
          src={book.image}
          alt={book.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 cursor-pointer"
        />
        <div
          onClick={onSelect}
          className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-y-1 group-hover:translate-y-0 cursor-pointer"
        >
          <div className="p-2 rounded-full shadow-lg hover:scale-110 transition-transform" style={{ background: "linear-gradient(135deg, #22e696 0%, #16c47f 100%)" }}>
            <span className="text-black text-sm">▶</span>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute top-2 left-2 w-7 h-7 rounded-full bg-[#16C47F]/20 flex items-center justify-center text-[#16C47F] hover:scale-110 transition-all active:scale-95"
        >
          <IoHeart className="text-xs" />
        </button>
      </motion.div>
      <div onClick={onSelect} className="cursor-pointer">
        <h3 className="font-bold text-white text-sm mb-0.5 leading-snug">{book.title}</h3>
        <p className="text-xs text-white/40">{book.author}</p>
        <span className="text-[10px] text-[#16C47F] font-bold uppercase tracking-widest mt-1 inline-block">
          {book.episodes.length} Episodes
        </span>
      </div>
    </motion.div>
  );
}

function EpisodeRow({
  index, title, duration, onPlay, onRemove, isVideo,
}: {
  index: number;
  title: string;
  duration: string;
  onPlay: () => void;
  onRemove: () => void;
  isVideo: boolean;
}) {
  return (
    <motion.div
      className="flex items-center justify-between px-4 py-3 bg-app-card rounded-xl border border-white/5 hover:border-white/10 transition-colors group"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ ...spring, delay: Math.min(index * 0.04, 0.24) }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        <p className="text-xs text-white/30">{duration}</p>
      </div>
      <div className="flex items-center gap-3 ml-4 shrink-0">
        <button
          onClick={onPlay}
          className="text-xs font-bold text-black px-3 py-1 rounded-lg hover:brightness-110 transition-all active:scale-95"
          style={{ background: "linear-gradient(135deg, #22e696 0%, #16c47f 100%)" }}
        >
          {isVideo ? "Watch" : "Listen"}
        </button>
        <button onClick={onRemove} className="text-[#16C47F] hover:scale-110 transition-all active:scale-95">
          <IoBookmark className="text-base" />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Page root ─────────────────────────────────────────────────────────────────
function Favorites({ user, onLogin, onRegister, onSelectSeries, onSelectBook }: FavoritesProps) {
  const [tab, setTab] = useState<"series" | "lectures">("series");
  const [direction, setDirection] = useState(1);

  if (!user) return <LoginGate onLogin={onLogin} onRegister={onRegister} />;

  function switchTab(t: "series" | "lectures") {
    setDirection(t === "lectures" ? 1 : -1);
    setTab(t);
  }

  return (
    <div className="p-8 pt-24 space-y-8 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.05 }}
      >
        <h1 className="text-3xl font-bold text-white mb-1">Favorites</h1>
        <p className="text-white/40 text-sm">{user.name}</p>
      </motion.div>

      <motion.div
        className="flex gap-1 p-1 bg-white/5 rounded-xl w-fit border border-white/5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring, delay: 0.13 }}
      >
        {(["series", "lectures"] as const).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`relative px-5 py-2 rounded-lg text-sm font-bold transition-colors ${tab === t ? "text-black" : "text-white/40 hover:text-white"}`}
          >
            {tab === t && (
              <motion.div
                layoutId="favorites-tab-pill"
                className="absolute inset-0 rounded-lg"
                style={{ background: "linear-gradient(135deg, #22e696 0%, #16c47f 60%, #0db36e 100%)", boxShadow: "0 2px 12px rgba(22,196,127,0.3)" }}
                transition={spring}
              />
            )}
            <span className="relative z-10">{t === "series" ? "Saved Series" : "Saved Lectures"}</span>
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: direction * 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction * -20 }}
          transition={spring}
        >
          {tab === "series"
            ? <SavedSeriesTab onSelectSeries={onSelectSeries} onSelectBook={onSelectBook} />
            : <SavedLecturesTab onSelectSeries={onSelectSeries} onSelectBook={onSelectBook} />
          }
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default Favorites;
