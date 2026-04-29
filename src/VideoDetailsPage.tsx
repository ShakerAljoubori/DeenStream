import { useState, useEffect } from "react";
import { IoHeart, IoHeartOutline, IoBookmark, IoBookmarkOutline } from "react-icons/io5";
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

function VideoDetailsPage({ series, user, onBack, initialEpisodeId, initialTimestamp }: VideoDetailsProps) {
  const startEpisode = series.episodes.find((e) => e.id === initialEpisodeId) ?? series.episodes[0];
  const [currentEpisode, setCurrentEpisode] = useState(startEpisode);
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
    if (hrs > 0) return `${hrs}:${mmss}`;
    return mmss;
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
    <div className="p-8 text-white">
      <button onClick={onBack} className="text-text-muted hover:text-white mb-6 transition-colors">
        ← Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left — player + info */}
        <div className="lg:col-span-2">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            <VideoPlayer
              url={currentEpisode.url}
              title={`${series.title} - ${currentEpisode.title}`}
              onClose={onBack}
              initialTimestamp={seekTo}
              onProgress={(timestamp, duration, snapshot) =>
                saveProgress(series.id, currentEpisode.id, timestamp, duration, snapshot)
              }
            />
          </div>

          <div className="mt-8">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold text-text-main leading-tight">{series.title}</h1>
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
            </div>
            <p className="text-text-muted mt-4 leading-relaxed max-w-3xl">{series.description}</p>
            <div className="mt-6 flex gap-4 text-xs font-medium uppercase tracking-widest text-brand-primary">
              <span>{series.category}</span>
              <span className="text-white/20">|</span>
              <span className="text-text-muted">{series.instructor}</span>
            </div>
          </div>
        </div>

        {/* Right — episode list */}
        <div className="bg-app-card rounded-2xl border border-white/5 flex flex-col h-[calc(100vh-200px)]">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold">Course Content</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {series.episodes.map((ep) => {
              const isActive = currentEpisode.id === ep.id;
              const isBookmarked = isVideoEpisodeSaved(series.id, ep.id);

              return (
                <div
                  key={ep.id}
                  className={`w-full text-left p-4 rounded-xl transition-all border group ${
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
                        {durations[ep.id] || "0:00"}
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoDetailsPage;
