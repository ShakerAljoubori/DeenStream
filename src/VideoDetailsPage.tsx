import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

const SPRING = { type: "spring" as const, stiffness: 300, damping: 30 };

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 30 },
  },
};

const metaContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.42 } },
};

const listContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } },
};

// Per-episode thumbnail overlay.
// Shows series thumbnail immediately, then crossfades to the episode-specific
// static image if it loads (onLoad). If the URL 404s (onError), stays on the
// series thumbnail. Dismissed via CSS opacity when video starts playing.
// pointer-events-none so all VideoPlayer controls receive clicks through it.
function EpisodePoster({
  thumbnail,
  fallback,
  dismissed,
}: {
  thumbnail?: string;
  fallback?: string;
  dismissed: boolean;
}) {
  const [episodeReady, setEpisodeReady] = useState(false);

  // Reset crossfade state whenever the episode's thumbnail changes
  useEffect(() => { setEpisodeReady(false); }, [thumbnail]);

  return (
    <div
      className={`absolute inset-0 z-20 pointer-events-none overflow-hidden transition-opacity duration-300 ${
        dismissed ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Series thumbnail — instant, always available */}
      {fallback && (
        <img
          src={fallback}
          alt=""
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
            episodeReady ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Episode thumbnail — crossfades in on successful load, silent on 404 */}
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
            episodeReady ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setEpisodeReady(true)}
          onError={() => setEpisodeReady(false)}
        />
      )}

      {/* Play button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-20 h-20 bg-[#16C47F] rounded-full flex items-center justify-center shadow-2xl shadow-[#16C47F]/30">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-black ml-1">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Animated equalizer bars shown on the active episode row
const NowPlayingBars = () => (
  <div className="flex items-end gap-[2.5px] shrink-0" style={{ height: 13, width: 13 }}>
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        className="flex-1 rounded-full bg-brand-primary origin-bottom"
        animate={{ scaleY: [0.3, 1, 0.5, 0.85, 0.3] }}
        transition={{ repeat: Infinity, duration: 1.1, delay: i * 0.16, ease: "easeInOut" }}
        style={{ height: "100%" }}
      />
    ))}
  </div>
);

function VideoDetailsPage({ series, user, onBack, initialEpisodeId, initialTimestamp }: VideoDetailsProps) {
  const startEpisode = series.episodes.find((e) => e.id === initialEpisodeId) ?? series.episodes[0];
  const [currentEpisode, setCurrentEpisode] = useState<Episode>(startEpisode);
  const [seekTo, setSeekTo] = useState<number | undefined>(initialTimestamp);
  const [durations, setDurations] = useState<{ [key: number]: string }>({});
  const [shouldAutoPlay, setShouldAutoPlay] = useState(!!initialEpisodeId);

  const activeEpisodeRef = useRef<HTMLDivElement>(null);
  const [episodePosterDismissed, setEpisodePosterDismissed] = useState(false);

  useEffect(() => { setEpisodePosterDismissed(shouldAutoPlay); }, [currentEpisode.id, shouldAutoPlay]);

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

  // Scroll active episode into view whenever it changes
  useEffect(() => {
    activeEpisodeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentEpisode.id]);

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

              {/* layoutId bridges thumbnail → player on open/close.
                  AnimatePresence inside handles the episode-switch crossfade. */}
              <motion.div
                layoutId={`thumb-${series.id}`}
                className="relative aspect-video bg-black overflow-hidden border border-white/5 shadow-2xl shadow-black/60"
                style={{ borderRadius: 16 }}
                transition={SPRING}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentEpisode.id}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.025 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.975 }}
                    transition={{
                      opacity: { duration: 0.22, ease: "easeInOut" },
                      scale: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
                    }}
                  >
                    <VideoPlayer
                      url={currentEpisode.url}
                      title={`${series.title} — ${currentEpisode.title}`}
                      onClose={onBack}
                      initialTimestamp={seekTo}
                      poster={series.thumbnail}
                      autoPlay={shouldAutoPlay}
                      onPlayStart={() => setEpisodePosterDismissed(true)}
                      onProgress={(timestamp, duration, snapshot) =>
                        saveProgress(series.id, currentEpisode.id, timestamp, duration, snapshot)
                      }
                    />
                    <EpisodePoster
                      thumbnail={currentEpisode.thumbnail}
                      fallback={series.thumbnail}
                      dismissed={episodePosterDismissed}
                    />
                  </motion.div>
                </AnimatePresence>
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
                  <div className="min-w-0">
                    <h1 className="text-2xl md:text-3xl font-bold text-text-main leading-tight">
                      {series.title}
                    </h1>
                  </div>

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
              className="rounded-2xl flex flex-col h-[calc(100vh-160px)]"
              style={{ background: "linear-gradient(180deg, #162318 0%, #111111 100%)", border: "1px solid rgba(22,196,127,0.14)" }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="p-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h2 className="text-xl font-bold">Course Content</h2>
                <p className="text-xs mt-1 font-medium" style={{ color: "rgba(245,196,81,0.7)" }}>
                  {series.episodes.length} episodes
                </p>
              </div>

              <motion.div
                className="flex-1 overflow-y-auto p-3 space-y-1"
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
                      ref={isActive ? activeEpisodeRef : null}
                      variants={staggerItem}
                      className="relative rounded-xl"
                    >
                      {/* Single layoutId pill that physically slides between rows */}
                      {isActive && (
                        <motion.div
                          layoutId="active-episode-bg"
                          className="absolute inset-0 rounded-xl bg-brand-primary/10 border border-brand-primary/50"
                          transition={SPRING}
                        />
                      )}

                      <button
                        onClick={() => { setCurrentEpisode(ep); setSeekTo(undefined); setShouldAutoPlay(true); }}
                        className="relative z-10 w-full text-left p-3.5 flex items-center gap-3 rounded-xl"
                      >
                        {/* Episode number */}
                        <span
                          className={`shrink-0 text-[10px] font-mono tabular-nums w-5 text-center transition-colors duration-300 ${
                            isActive ? "text-brand-primary" : "text-white/25"
                          }`}
                        >
                          {String(ep.id).padStart(2, "0")}
                        </span>

                        {/* Title */}
                        <span
                          className={`flex-1 text-sm font-medium truncate transition-colors duration-300 ${
                            isActive ? "text-brand-primary" : "text-text-muted"
                          }`}
                        >
                          {ep.title}
                        </span>

                        {/* Equalizer bars — fade in on active, fade out on switch */}
                        <AnimatePresence>
                          {isActive && (
                            <motion.span
                              className="shrink-0"
                              initial={{ opacity: 0, scale: 0.6 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.6 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                              <NowPlayingBars />
                            </motion.span>
                          )}
                        </AnimatePresence>

                        {/* Duration + bookmark */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-white/25 tabular-nums">
                            {durations[ep.id] || "—"}
                          </span>
                          {user && (
                            <span
                              role="button"
                              onClick={(e) => { e.stopPropagation(); toggleVideoEpisode(series.id, ep.id); }}
                              className={`transition-all hover:scale-110 active:scale-95 cursor-pointer ${
                                isBookmarked ? "text-[#16C47F]" : "text-white/30 hover:text-white/70"
                              }`}
                              title={isBookmarked ? "Remove bookmark" : "Bookmark episode"}
                            >
                              {isBookmarked
                                ? <IoBookmark className="text-sm" />
                                : <IoBookmarkOutline className="text-sm" />}
                            </span>
                          )}
                        </div>
                      </button>
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
