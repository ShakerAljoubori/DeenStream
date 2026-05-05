import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { IoPlay, IoPause, IoTimeOutline, IoBookmark, IoBookmarkOutline, IoClose } from "react-icons/io5";
import { useAudioPlayer } from "./AudioPlayerContext";
import { useFavorites } from "./FavoritesContext";
import { useAudioProgress } from "./AudioProgressContext";
import type { AudioBook } from "./data";

interface AudioPlayerPageProps {
  book: AudioBook;
  onBack: () => void;
  user: { name: string; email: string } | null;
  initialEpisodeId?: number;
  initialTimestamp?: number;
}

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
};

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
};

const AudioPlayerPage = ({ book, onBack, user, initialEpisodeId, initialTimestamp }: AudioPlayerPageProps) => {
  const { playEpisode, currentEpisode, currentBook, isPlaying, togglePlay } = useAudioPlayer();
  const { isAudioEpisodeSaved, toggleAudioEpisode } = useFavorites();
  const { allAudioProgress } = useAudioProgress();
  const [pendingBookmark, setPendingBookmark] = useState<number | null>(null);

  useEffect(() => {
    if (initialEpisodeId) {
      const episode = book.episodes.find((e) => e.id === initialEpisodeId);
      if (episode) playEpisode(episode, book, initialTimestamp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCurrentEpisode = (episodeId: number) => currentEpisode?.id === episodeId;

  const lastBookEntry = Object.values(allAudioProgress)
    .filter((e) => e.bookId === book.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={onBack}
      />

      {/* Scrollable overlay */}
      <motion.div
        className="fixed inset-0 z-50 overflow-y-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Sticky close button */}
        <div className="sticky top-0 z-10 flex justify-end px-6 pt-5 pb-0 pointer-events-none">
          <motion.button
            onClick={onBack}
            className="pointer-events-auto w-10 h-10 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.48, duration: 0.25, ease: "easeOut" }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
          >
            <IoClose className="text-lg" />
          </motion.button>
        </div>

        <div className="min-h-screen bg-gradient-to-b from-[#2a2a2a] to-app-bg text-white">
          {/* Header: cover + metadata */}
          <div className="pl-24 pr-6 md:pl-28 md:pr-10 py-8 flex flex-col md:flex-row gap-8 items-end">
            <motion.div
              layoutId={`thumb-audio-${book.id}`}
              className="shrink-0 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
              style={{ borderRadius: 6 }}
              transition={SPRING}
            >
              <img
                src={book.image}
                alt={book.title}
                className="w-48 h-48 md:w-64 md:h-64 object-cover"
                style={{ borderRadius: 6 }}
              />
            </motion.div>

            <motion.div
              className="flex flex-col gap-2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4, ease: "easeOut" }}
            >
              <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">Audiobook</span>
              <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">{book.title}</h1>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>{book.author}</span>
                <span className="text-text-muted">•</span>
                <span className="text-text-muted">{book.episodes.length} Episodes</span>
              </div>
            </motion.div>
          </div>

          {/* Episode list */}
          <div className="pl-24 pr-6 md:pl-28 md:pr-10 pb-16 bg-black/20 backdrop-blur-sm">
            {/* Play button */}
            <div className="flex items-center gap-6 py-8">
              <button
                onClick={() => {
                  if (currentEpisode && currentBook?.id === book.id) togglePlay();
                  else if (book.episodes.length > 0) {
                    if (lastBookEntry) {
                      const ep = book.episodes.find((e) => e.id === lastBookEntry.episodeId) ?? book.episodes[0];
                      playEpisode(ep, book, lastBookEntry.timestamp);
                    } else {
                      playEpisode(book.episodes[0], book);
                    }
                  }
                }}
                className="w-14 h-14 rounded-full flex items-center justify-center text-black hover:scale-105 transition shadow-lg active:scale-95"
                style={{ background: "linear-gradient(135deg, #22e696 0%, #16c47f 60%, #0db36e 100%)", boxShadow: "0 4px 20px rgba(22,196,127,0.35)" }}
              >
                {isPlaying && currentBook?.id === book.id
                  ? <IoPause size={30} />
                  : <IoPlay size={30} className="ml-1" />}
              </button>
            </div>

            {/* Column headers */}
            <div className="grid grid-cols-[40px_1fr_auto_80px] gap-4 px-4 py-2 text-text-muted border-b border-white/10 text-xs font-bold uppercase tracking-wider mb-4">
              <span className="text-center">#</span>
              <span>Title</span>
              <span />
              <div className="flex justify-end pr-4">
                <IoTimeOutline size={18} />
              </div>
            </div>

            {/* Episodes with stagger */}
            <motion.div
              className="flex flex-col"
              variants={listContainer}
              initial="hidden"
              animate="show"
            >
              {book.episodes.map((episode, index) => {
                const isActive = isCurrentEpisode(episode.id);
                const isBookmarked = isAudioEpisodeSaved(book.id, episode.id);
                const epProg = allAudioProgress[`${book.id}:${episode.id}`];
                const savedTimestamp = epProg?.timestamp ?? 0;
                const pct = savedTimestamp > 0 && epProg?.duration
                  ? Math.min((savedTimestamp / epProg.duration) * 100, 100)
                  : 0;

                return (
                  <motion.div
                    key={episode.id}
                    variants={staggerItem}
                    className="relative grid grid-cols-[40px_1fr_auto_80px] gap-4 px-4 py-3 items-center hover:bg-white/5 rounded-md transition-colors group"
                  >
                    {/* Play indicator / number */}
                    <div
                      onClick={() => playEpisode(episode, book, savedTimestamp > 0 ? savedTimestamp : undefined)}
                      className="flex justify-center items-center cursor-pointer"
                    >
                      {isActive && isPlaying ? (
                        <IoPause className="text-brand-primary" size={16} />
                      ) : (
                        <>
                          <span className={`text-sm ${isActive ? "text-brand-primary" : "text-text-muted"} group-hover:hidden`}>
                            {index + 1}
                          </span>
                          <IoPlay className="hidden group-hover:block text-brand-primary" size={16} />
                        </>
                      )}
                    </div>

                    {/* Title + author */}
                    <div
                      onClick={() => playEpisode(episode, book, savedTimestamp > 0 ? savedTimestamp : undefined)}
                      className="flex flex-col min-w-0 cursor-pointer"
                    >
                      <p className={`font-medium truncate transition-colors ${isActive ? "text-brand-primary" : "text-white"} group-hover:text-brand-primary`}>
                        {episode.title}
                      </p>
                      <p className="text-xs text-text-muted truncate">{book.author}</p>
                    </div>

                    {/* Bookmark button */}
                    {user ? (
                      <button
                        onClick={async (e) => { e.stopPropagation(); if (pendingBookmark === episode.id) return; setPendingBookmark(episode.id); await toggleAudioEpisode(book.id, episode.id); setPendingBookmark(null); }}
                        className={`transition-all hover:scale-110 active:scale-95 ${
                          isBookmarked ? "text-[#16C47F]" : "text-white/30 hover:text-white/70"
                        } ${pendingBookmark === episode.id ? "opacity-50 pointer-events-none" : ""}`}
                        title={isBookmarked ? "Remove bookmark" : "Bookmark episode"}
                      >
                        {isBookmarked ? <IoBookmark size={16} /> : <IoBookmarkOutline size={16} />}
                      </button>
                    ) : (
                      <span />
                    )}

                    {/* Duration */}
                    <span className="text-sm text-text-muted text-right pr-4">{episode.duration}</span>

                    {/* Progress bar */}
                    {pct > 0 && (
                      <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-white/10 rounded-full">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: "linear-gradient(90deg, #16c47f 0%, #f5c451 100%)" }}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default AudioPlayerPage;
