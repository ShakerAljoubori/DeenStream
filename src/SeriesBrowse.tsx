import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { allSeries } from "./data";
import { useFavorites } from "./FavoritesContext";

interface SeriesBrowseProps {
  onSelectSeries: (seriesId: string) => void;
  user: { name: string; email: string } | null;
}

function SeriesBrowse({ onSelectSeries, user }: SeriesBrowseProps) {
  const { isSeriesFavorite, toggleSeries } = useFavorites();
  const [pendingHeart, setPendingHeart] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(allSeries.map((s) => s.category)))];
  const filtered = activeCategory === "All" ? allSeries : allSeries.filter((s) => s.category === activeCategory);

  return (
    <section className="px-8 mt-4 mb-12">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <h3 className="text-lg font-bold text-text-main">All Series</h3>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ color: "#f5c451", background: "rgba(245,196,81,0.1)", border: "1px solid rgba(245,196,81,0.25)" }}
        >
          {filtered.length}
        </span>
        <div className="flex gap-2 ml-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="relative text-xs font-bold px-3 py-1 rounded-full"
              style={{
                color: activeCategory === cat ? "#000" : "rgba(255,255,255,0.5)",
                border: activeCategory === cat ? "none" : "1px solid rgba(255,255,255,0.08)",
                background: activeCategory === cat ? "transparent" : "rgba(255,255,255,0.05)",
              }}
            >
              {activeCategory === cat && (
                <motion.div
                  layoutId="series-cat-pill"
                  className="absolute inset-0 rounded-full"
                  style={{ background: "linear-gradient(135deg, #22e696 0%, #16c47f 100%)" }}
                  transition={{ type: "spring", stiffness: 420, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <AnimatePresence mode="popLayout">
        {filtered.map((series, i) => {
          const saved = isSeriesFavorite(series.id);
          return (
            <motion.div
              key={series.id}
              layout
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1, transition: { type: "spring", stiffness: 350, damping: 28, delay: Math.min(i * 0.045, 0.25) } }}
              exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.15 } }}
              onClick={() => onSelectSeries(series.id)}
              className="group cursor-pointer w-[220px]"
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

                {/* Category badge with gradient border */}
                <span
                  className="absolute bottom-2 left-2 text-[9px] font-bold uppercase tracking-widest backdrop-blur-sm px-2 py-1 rounded"
                  style={{ color: "#16c47f", background: "rgba(0,0,0,0.65)", border: "1px solid rgba(22,196,127,0.3)" }}
                >
                  {series.category}
                </span>

                {user && (
                  <button
                    onClick={async (e) => { e.stopPropagation(); if (pendingHeart === series.id) return; setPendingHeart(series.id); await toggleSeries(series.id); setPendingHeart(null); }}
                    className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-sm transition-all hover:scale-110 active:scale-95 ${
                      saved ? "" : "opacity-0 group-hover:opacity-100"
                    } ${pendingHeart === series.id ? "opacity-50 pointer-events-none" : ""}`}
                    style={saved
                      ? { background: "rgba(22,196,127,0.2)", color: "#16c47f" }
                      : { background: "rgba(0,0,0,0.5)", color: "rgba(255,255,255,0.6)" }}
                    title={saved ? "Remove from favorites" : "Save to favorites"}
                  >
                    {saved ? <IoHeart className="text-xs" /> : <IoHeartOutline className="text-xs" />}
                  </button>
                )}
              </motion.div>

              <div className="mt-2 px-0.5">
                <h4 className="text-sm font-semibold text-text-main group-hover:text-brand-primary transition-colors leading-snug line-clamp-2">
                  {series.title}
                </h4>
                <p className="text-xs text-text-muted mt-0.5 truncate">{series.instructor}</p>
                {/* Gold episode count */}
                <p className="text-xs mt-0.5 font-medium" style={{ color: "rgba(245,196,81,0.6)" }}>
                  {series.episodes.length} episodes
                </p>
              </div>
            </motion.div>
          );
        })}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default SeriesBrowse;
