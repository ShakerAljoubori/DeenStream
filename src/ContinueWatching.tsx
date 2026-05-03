import { useState } from "react";
import { motion } from "framer-motion";
import { IoClose } from "react-icons/io5";
import { allSeries } from "./data";
import { useWatchProgress } from "./WatchProgressContext";

interface ContinueWatchingProps {
  onSelectVideo: (seriesId: string, episodeId: number, timestamp: number) => void;
}

function EpisodeThumbnail({ url, fallback, alt }: { url: string; fallback?: string; alt: string }) {
  const [ready, setReady] = useState(false);

  return (
    <div className="absolute inset-0">
      {/* Fallback visible until the video frame is ready */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${ready ? "opacity-0" : "opacity-100"}`}>
        {fallback
          ? <img src={fallback} alt={alt} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center bg-white/5">
              <span className="text-white/20 text-4xl">▶</span>
            </div>
        }
      </div>

      {/* Video seeks to 20% of duration — displayed as a static frame */}
      {url && (
        <video
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`}
          src={url}
          preload="metadata"
          muted
          playsInline
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            if (v.duration > 0) v.currentTime = v.duration * 0.2;
          }}
          onSeeked={() => setReady(true)}
        />
      )}
    </div>
  );
}

function ContinueWatching({ onSelectVideo }: ContinueWatchingProps) {
  const { allProgress, removeProgress } = useWatchProgress();

  const entries = Object.values(allProgress)
    .filter((prog) => prog.seriesId && allSeries.some((s) => s.id === prog.seriesId))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (entries.length === 0) return null;

  return (
    <section className="px-8 mt-12 mb-4">
      <h3 className="text-lg font-bold mb-4 text-text-main">Continue <span style={{ background: "linear-gradient(135deg, #f5c451 0%, #e8a820 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Watching</span></h3>

      <div className="flex flex-wrap gap-4">
        {entries.map((prog) => {
          const series = allSeries.find((s) => s.id === prog.seriesId);
          if (!series) return null;
          const episode = series.episodes.find((e) => e.id === prog.episodeId);
          const pct = prog.duration > 0 ? Math.min((prog.timestamp / prog.duration) * 100, 100) : 0;

          return (
            <div
              key={`${prog.seriesId}:${prog.episodeId}`}
              onClick={() => onSelectVideo(prog.seriesId, prog.episodeId, prog.timestamp)}
              className="group cursor-pointer w-[220px]"
            >
              <motion.div
                layoutId={`thumb-cw-${series.id}`}
                className="relative aspect-video rounded-xl overflow-hidden bg-app-card transition-all duration-300"
                style={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}
                whileHover={{ boxShadow: "0 0 0 1px rgba(22,196,127,0.5), 0 8px 32px rgba(22,196,127,0.18)" }}
              >
                <EpisodeThumbnail
                  url={episode?.url ?? ""}
                  fallback={series.thumbnail}
                  alt={series.title}
                />

                {/* Remove button — visible on hover */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeProgress(prog.seriesId, prog.episodeId); }}
                  className="absolute top-2 right-2 z-10 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95"
                  title="Remove from Continue Watching"
                >
                  <IoClose className="text-sm" />
                </button>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
                  <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${pct}%`, background: "linear-gradient(90deg, #16c47f 0%, #f5c451 100%)" }}
                  />
                </div>
              </motion.div>

              <div className="mt-2">
                <h4 className="text-sm font-semibold text-text-main group-hover:text-brand-primary transition-colors truncate">
                  {series.title}
                </h4>
                <p className="text-xs text-text-muted truncate">
                  {episode?.title ?? "Episode"} · {Math.round(pct)}% watched
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ContinueWatching;
