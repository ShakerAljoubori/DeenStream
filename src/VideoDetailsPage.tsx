import { useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import type { Series } from "./data"; 

interface VideoDetailsProps {
  series: Series;
  onBack: () => void;
}

function VideoDetailsPage({ series, onBack }: VideoDetailsProps) {
  const [currentEpisode, setCurrentEpisode] = useState(series.episodes[0]);
  const [durations, setDurations] = useState<{ [key: number]: string }>({});

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const mmss = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    
    if (hrs > 0) return `${hrs}:${mmss}`;
    return mmss;
  };

  useEffect(() => {
    series.episodes.forEach((ep) => {
      if (ep.duration) {
        setDurations(prev => ({ ...prev, [ep.id]: ep.duration! }));
        return;
      }
      const video = document.createElement("video");
      video.src = ep.url;
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        setDurations(prev => ({ ...prev, [ep.id]: formatTime(video.duration) }));
      };
    });
  }, [series]);

  return (
    <div className="p-8 text-white">
      <button onClick={onBack} className="text-text-muted hover:text-white mb-6 transition-colors">
        ← Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            <VideoPlayer 
              url={currentEpisode.url} 
              title={`${series.title} - ${currentEpisode.title}`}
              onClose={onBack}
            />
          </div>
          <div className="mt-8">
            <h1 className="text-3xl font-bold text-text-main leading-tight">{series.title}</h1>
            <p className="text-text-muted mt-4 leading-relaxed max-w-3xl">{series.description}</p>
            <div className="mt-6 flex gap-4 text-xs font-medium uppercase tracking-widest text-brand-primary">
              <span>{series.category}</span>
              <span className="text-white/20">|</span>
              <span className="text-text-muted">{series.instructor}</span>
            </div>
          </div>
        </div>

        <div className="bg-app-card rounded-2xl border border-white/5 flex flex-col h-[calc(100vh-200px)]">
          <div className="p-6 border-b border-white/5">
            <h2 className="text-xl font-bold">Course Content</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {series.episodes.map((ep) => (
              <button
                key={ep.id}
                onClick={() => setCurrentEpisode(ep)}
                className={`w-full text-left p-4 rounded-xl transition-all border ${
                  currentEpisode.id === ep.id 
                  ? "bg-brand-primary/10 border-brand-primary text-brand-primary" 
                  : "bg-transparent border-transparent text-text-muted hover:bg-white/5"
                }`}
              >
                <div className="flex justify-between items-center">
                  {/* FIXED: Removed "Part {ep.id}:" prefix */}
                  <span className="text-sm font-medium">{ep.title}</span>
                  <span className="text-[10px] font-mono">{durations[ep.id] || "0:00"}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoDetailsPage;