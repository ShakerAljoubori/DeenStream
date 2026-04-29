import { IoClose } from "react-icons/io5";
import { allSeries } from "./data";
import { useWatchProgress } from "./WatchProgressContext";

interface ContinueWatchingProps {
  onSelectVideo: (seriesId: string, episodeId: number, timestamp: number) => void;
}

function ContinueWatching({ onSelectVideo }: ContinueWatchingProps) {
  const { allProgress, removeProgress } = useWatchProgress();

  const entries = Object.values(allProgress)
    .filter((prog) => prog.seriesId && allSeries.some((s) => s.id === prog.seriesId))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (entries.length === 0) return null;

  return (
    <section className="px-8 mt-12 mb-4">
      <h3 className="text-lg font-bold mb-4 text-text-main">Continue Watching</h3>

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
              <div className="relative aspect-video rounded-xl overflow-hidden bg-app-card border border-white/5 group-hover:border-brand-primary transition-all duration-300">
                {series.thumbnail ? (
                  <img
                    src={series.thumbnail}
                    alt={series.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/5">
                    <span className="text-white/20 text-4xl">▶</span>
                  </div>
                )}

                {/* Remove button — visible on hover */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeProgress(prog.seriesId, prog.episodeId); }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95"
                  title="Remove from Continue Watching"
                >
                  <IoClose className="text-sm" />
                </button>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-[#16C47F] transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

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
