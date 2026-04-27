import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { allSeries } from "./data";
import { useFavorites } from "./FavoritesContext";

interface SeriesBrowseProps {
  onSelectSeries: (seriesId: string) => void;
  user: { name: string; email: string } | null;
}

function SeriesBrowse({ onSelectSeries, user }: SeriesBrowseProps) {
  const { isSeriesFavorite, toggleSeries } = useFavorites();

  return (
    <section className="px-8 mt-4 mb-12">
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-lg font-bold text-text-main">All Series</h3>
        <span className="text-xs font-bold text-[#16C47F] bg-[#16C47F]/10 border border-[#16C47F]/20 px-2 py-0.5 rounded-full">
          {allSeries.length}
        </span>
      </div>

      <div className="flex flex-wrap gap-4">
        {allSeries.map((series) => {
          const saved = isSeriesFavorite(series.id);
          return (
            <div
              key={series.id}
              onClick={() => onSelectSeries(series.id)}
              className="group cursor-pointer w-[220px]"
            >
              <div className="relative aspect-video rounded-xl overflow-hidden bg-app-card border border-white/5 group-hover:border-brand-primary transition-all duration-300">
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

                <span className="absolute bottom-2 left-2 text-[9px] font-bold text-[#16C47F] uppercase tracking-widest bg-black/60 backdrop-blur-sm px-2 py-1 rounded">
                  {series.category}
                </span>

                {user && (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleSeries(series.id); }}
                    className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 active:scale-95 ${
                      saved
                        ? "bg-[#16C47F]/20 text-[#16C47F]"
                        : "bg-black/50 text-white/60 opacity-0 group-hover:opacity-100"
                    }`}
                    title={saved ? "Remove from favorites" : "Save to favorites"}
                  >
                    {saved ? <IoHeart className="text-xs" /> : <IoHeartOutline className="text-xs" />}
                  </button>
                )}
              </div>

              <div className="mt-2 px-0.5">
                <h4 className="text-sm font-semibold text-text-main group-hover:text-brand-primary transition-colors leading-snug line-clamp-2">
                  {series.title}
                </h4>
                <p className="text-xs text-text-muted mt-0.5 truncate">{series.instructor}</p>
                <p className="text-xs text-white/25 mt-0.5">{series.episodes.length} episodes</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default SeriesBrowse;
