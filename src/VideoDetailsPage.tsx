import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { IoHeart, IoHeartOutline, IoBookmark, IoBookmarkOutline, IoClose } from "react-icons/io5";
import VideoPlayer from "./VideoPlayer";
import { useFavorites } from "./FavoritesContext";
import { useWatchProgress } from "./WatchProgressContext";
import type { Series, Episode } from "./data";

interface VideoDetailsProps {
  series: Series;
  user: { name: string; email: string } | null;
  onBack: () => void;
  initialEpisodeId?: number;
  initialTimestamp?: number;
}

// The spring that drives the thumbnail → player morph
const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

// Shared item: fades in and rises 20px, driven by its parent's staggerChildren
const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

// Container for the three metadata lines below the player
const metaContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.42 } },
};

// Container for the episode list scroll area
const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
};

function VideoDetailsPage({ series, user, onBack, initialEpisodeId, initialTimestamp }: VideoDetailsProps) {
  const startEpisode = series.episodes.find((e) => e.id === initialEpisodeId) ?? series.episodes[0];
  const [currentEpisode, setCurrentEpisode] = useState<Episode>(startEpisode);
  const [seekTo, setSeekTo] = useState<number | undefined>(initialTimestamp);
  const [durations, setDurations] = useState<{ [key: number]: string }>({});

  const { isSeriesFavorite, toggleSeries, isVideoEpisodeSaved, toggleVideoEpisode } = useFavorites();
  const { saveProgress } = useWatchProgress();
  const seriesSaved = isSeriesFavorite(series.id);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const mmss = `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    return hrs > 0 ? `${hrs}:${mmss}` : mmss;
  };

  useEffect(() => {
    series.episodes.forEach((ep) => {
      if (ep.duration) {
        setDurations((prev) => ({ ...prev, [ep.id]: ep.duration! }));
        return;
      }
      const video = document.createElement("video");
      video.src = ep.url;
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setDurations((prev) => ({ ...prev, [ep.id]: formatTime(video.duration) }));
      };
    });
  }, [series]);

  return (
    <>
      {/* Scrim — click outside to dismiss */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        onClick={onBack}
      />

      {/* Overlay panel */}
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
            aria-label="Close"
          >
            <IoClose className="text-lg" />
          </motion.button>
        </div>

        <div className="px-6 md:px-10 pt-4 pb-16 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Left column: player + metadata ── */}
            <div className="lg:col-span-2">

              {/* Morphing player — layoutId bridges this to the thumbnail card */}
              <motion.div
                layoutId={`thumb-${series.id}`}
                className="aspect-video bg-black overflow-hidden border border-white/5 shadow-2xl shadow-black/60"
                style={{ borderRadius: 16 }}
                transition={SPRING}
              >
                <VideoPlayer
                  url={currentEpisode.url}
                  title={`${series.title} — ${currentEpisode.title}`}
                  onClose={onBack}
                  initialTimestamp={seekTo}
                  poster={series.thumbnail}
                  onProgress={(timestamp, duration, snapshot) =>
                    saveProgress(series.id, currentEpisode.id, timestamp, duration, snapshot)
                  }
                />
              </motion.div>

              {/* Metadata — staggered after the player spring settles */}
              <motion.div
                className="mt-8"
                variants={metaContainer}
                initial="hidden"
                animate="show"
              >
                {/* Title row + favorite button */}
                <motion.div
                  variants={staggerItem}
                  className="flex items-start justify-between gap-4"
                >
                  <h1 className="text-2xl md:text-3xl font-bold text-text-main leading-tight">
                    {series.title}
                  </h1>
                  {user && (
                    <button
                      onClick={() => toggleSeries(series.id)}
                      className={`shrink-0 p-2.5 rounded-xl border transition-all hover:scale-110 active:scale-95 ${
                        seriesSaved
                          ? "bg-[#16C47F]/10 border-[#16C47F]/30 text-[#16C47F]"
                          : "bg-white/5 border-white/10 text-white/40 hover:text-white"
                      }`}
                      title={seriesSaved ? "Remove from favorites" : "Save series"}
                    >
                      {seriesSaved ? <IoHeart className="text-xl" /> : <IoHeartOutline className="text-xl" />}
                    </button>
                  )}
                </motion.div>

                {/* Description */}
                <motion.p
                  variants={staggerItem}
                  className="text-text-muted mt-4 leading-relaxed max-w-3xl"
                >
                  {series.description}
                </motion.p>

                {/* Category / instructor */}
                <motion.div
                  variants={staggerItem}
                  className="mt-6 flex gap-4 text-xs font-medium uppercase tracking-widest text-brand-primary"
                >
                  <span>{series.category}</span>
                  <span className="text-white/20">|</span>
                  <span className="text-text-muted">{series.instructor}</span>
                </motion.div>
              </motion.div>
            </div>

            {/* ── Right column: episode list ── */}
            <motion.div
              className="bg-app-card rounded-2xl border border-white/5 flex flex-col h-[calc(100vh-160px)]"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold">Course Content</h2>
                <p className="text-xs text-text-muted mt-1">{series.episodes.length} episodes</p>
              </div>

              {/* Each row staggered inside its own container */}
              <motion.div
                className="flex-1 overflow-y-auto p-4 space-y-2"
                variants={listContainer}
                initial="hidden"
                animate="show"
              >
                {series.episodes.map((ep) => {
                  const isActive = currentEpisode.id === ep.id;
                  const isBookmarked = isVideoEpisodeSaved(series.id, ep.id);

                  return (
                    <motion.div
                      key={ep.id}
                      variants={staggerItem}
                      className={`w-full text-left p-4 rounded-xl transition-colors border group ${
                        isActive
                          ? "bg-brand-primary/10 border-brand-primary"
                          : "bg-transparent border-transparent hover:bg-white/5"
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <button
                          onClick={() => { setCurrentEpisode(ep); setSeekTo(undefined); }}
                          className="flex-1 text-left min-w-0"
                        >
                          <span className={`text-sm font-medium truncate block ${isActive ? "text-brand-primary" : "text-text-muted"}`}>
                            {ep.title}
                          </span>
                        </button>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-white/30">
                            {durations[ep.id] || "—"}
                          </span>
                          {user && (
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleVideoEpisode(series.id, ep.id); }}
                              className={`transition-all hover:scale-110 active:scale-95 ${
                                isBookmarked ? "text-[#16C47F]" : "text-white/30 hover:text-white/70"
                              }`}
                              title={isBookmarked ? "Remove bookmark" : "Bookmark episode"}
                            >
                              {isBookmarked
                                ? <IoBookmark className="text-sm" />
                                : <IoBookmarkOutline className="text-sm" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </>
  );
}

export default VideoDetailsPage;
