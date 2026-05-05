import { IoClose } from "react-icons/io5";
import { useState, useEffect } from "react";
import { allAudioBooks } from "./data";
import { useAudioProgress } from "./AudioProgressContext";
import { useAudioPlayer } from "./AudioPlayerContext";

interface ContinueListeningProps {
  onSelectBook: (bookId: string, episodeId: number, timestamp: number) => void;
}

function ContinueListening({ onSelectBook }: ContinueListeningProps) {
  const { allAudioProgress, removeAudioProgress } = useAudioProgress();
  const { playEpisode, togglePlay, currentEpisode, isPlaying, currentTime, duration } = useAudioPlayer();
  const [confirmKey, setConfirmKey] = useState<string | null>(null);

  const validKeys = (progress: typeof allAudioProgress) =>
    Object.values(progress)
      .filter((p) => p.bookId && allAudioBooks.some((b) => b.id === p.bookId))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .map((p) => `${p.bookId}:${p.episodeId}`);

  const [stableKeys, setStableKeys] = useState<string[]>(() => validKeys(allAudioProgress));

  useEffect(() => {
    const current = validKeys(allAudioProgress);
    setStableKeys((prev) => {
      const added = current.filter((k) => !prev.includes(k));
      const kept = prev.filter((k) => current.includes(k));
      return [...added, ...kept];
    });
  }, [allAudioProgress]);

  if (stableKeys.length === 0) return null;

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || secs <= 0) return "0:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  };

  return (
    <section className="px-8 mt-8 mb-4">
      <h3 className="text-lg font-bold mb-4 text-text-main">Continue <span style={{ background: "linear-gradient(135deg, #f5c451 0%, #e8a820 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Listening</span></h3>

      <div className="flex flex-col gap-2 max-w-2xl">
        {stableKeys.map((key) => {
          const prog = allAudioProgress[key];
          if (!prog) return null;
          const book = allAudioBooks.find((b) => b.id === prog.bookId);
          if (!book) return null;
          const episode = book.episodes.find((e) => e.id === prog.episodeId);
          const epIndex = book.episodes.findIndex((e) => e.id === prog.episodeId);

          const isActive = currentEpisode?.id === prog.episodeId;
          const liveTimestamp = isActive ? currentTime : prog.timestamp;
          const liveDuration = isActive && duration > 0 ? duration : prog.duration;
          const pct = liveDuration > 0 ? Math.min((liveTimestamp / liveDuration) * 100, 100) : 0;
          const timeLeft = liveDuration > 0 ? Math.max(liveDuration - liveTimestamp, 0) : 0;

          return (
            <div
              key={key}
              onClick={() => onSelectBook(prog.bookId, prog.episodeId, prog.timestamp)}
              onMouseLeave={() => { if (confirmKey === key) setConfirmKey(null); }}
              className="group cursor-pointer flex items-center gap-3 px-4 py-3 rounded-xl bg-app-card border border-white/5 hover:border-brand-primary transition-all duration-200"
            >
              {/* Episode number */}
              <div className="shrink-0 w-8 text-center">
                <span className="text-lg font-bold text-text-muted group-hover:text-brand-primary transition-colors leading-none">
                  {epIndex + 1}
                </span>
              </div>

              {/* Cover art */}
              <div className="relative shrink-0 w-12 h-12 rounded-lg overflow-hidden">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Info + progress */}
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-text-muted truncate mb-0.5">{book.title}</p>
                <h4 className="text-sm font-semibold text-text-main group-hover:text-brand-primary transition-colors truncate">
                  {episode?.title ?? `Episode ${epIndex + 1}`}
                </h4>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, transition: isActive ? "none" : "width 0.3s", background: "linear-gradient(90deg, #16c47f 0%, #f5c451 100%)" }}
                    />
                  </div>
                  <span className="text-[10px] text-text-muted tabular-nums shrink-0 w-16 text-right">
                    {timeLeft > 0 ? `${formatTime(timeLeft)} left` : `${Math.round(pct)}%`}
                  </span>
                </div>
              </div>

              {/* Play / Pause button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isActive) {
                    togglePlay();
                  } else if (episode) {
                    playEpisode(episode, book, prog.timestamp);
                  }
                }}
                className="shrink-0 w-8 h-8 rounded-full bg-white/5 group-hover:bg-brand-primary flex items-center justify-center transition-all duration-200"
              >
                {isActive && isPlaying ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 group-hover:text-black transition-colors">
                    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-white/50 group-hover:text-black transition-colors ml-0.5">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Remove button — with inline confirm */}
              {confirmKey === key ? (
                <button
                  onClick={(e) => { e.stopPropagation(); removeAudioProgress(prog.bookId, prog.episodeId); setConfirmKey(null); }}
                  className="shrink-0 px-2 h-6 rounded-full bg-red-500/80 flex items-center justify-center text-white text-[10px] font-bold transition-all duration-200"
                >
                  Sure?
                </button>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); setConfirmKey(key); }}
                  className="shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/15 opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95"
                  title="Remove from Continue Listening"
                >
                  <IoClose className="text-xs" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ContinueListening;
