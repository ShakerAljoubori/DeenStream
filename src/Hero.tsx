import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { useFavorites } from "./FavoritesContext";

interface HeroProps {
  onPlay: (seriesId: string) => void;
  user: { name: string; email: string } | null;
}

function Hero({ onPlay, user }: HeroProps) {
  const TAWHEED_SERIES_ID = "tawheed-01";
  const { isSeriesFavorite, toggleSeries } = useFavorites();
  const saved = isSeriesFavorite(TAWHEED_SERIES_ID);

  return (
    <main className="relative min-h-[85vh] flex flex-col justify-center px-12 text-text-main overflow-hidden">

      {/* Background image */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://e3.365dm.com/17/06/1600x900/0ee0f52eb177ff5801a44709978412578c6378b714792605ab2e0cad9586f2a8_3973042.jpg?20170608032802')" }}
      />

      {/* Left fade — image bleeds to black cleanly */}
      <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(90deg, #080808 30%, rgba(8,8,8,0.7) 60%, rgba(8,8,8,0.1) 100%)" }} />

      {/* Bottom fade — hero floor connects to page */}
      <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(to top, #080808 0%, rgba(8,8,8,0.5) 20%, transparent 50%)" }} />

      {/* Top fade */}
      <div className="absolute inset-0 z-10" style={{ background: "linear-gradient(to bottom, rgba(8,8,8,0.4) 0%, transparent 30%)" }} />

      <div className="relative z-20 max-w-2xl mt-12">

        {/* Featured badge — gold */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-6 rounded-full" style={{ background: "rgba(245,196,81,0.1)", border: "1px solid rgba(245,196,81,0.3)" }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#f5c451" }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#f5c451" }}>Featured</span>
        </div>

        <div className="mb-4">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-md">
            Tawheed - The Three <br /> Fundamental Principles
          </h2>

          {/* Subtitle in gold gradient */}
          <h3
            className="text-3xl md:text-4xl font-bold mt-2"
            style={{
              background: "linear-gradient(135deg, #f5c451 0%, #e8a820 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Al-Usool Ath-Thalaathah
          </h3>
        </div>

        <p className="text-sm font-medium text-text-muted mb-6">
          Sheikh Ahmad Musa Jibril • 37 Episodes • Aqeedah
        </p>

        <p className="text-text-muted max-w-lg leading-relaxed mb-10 line-clamp-3">
          This is a course on Tawheed taught by Shaykh Ahmad Musa Jibril, focusing on the Explanation of the Three Fundamental Principles of Islam (Al-Usool Ath-Thalaathah).
        </p>

        <div className="flex gap-4 items-center">

          {/* Primary CTA — green gradient with glow */}
          <button
            onClick={() => onPlay(TAWHEED_SERIES_ID)}
            className="flex items-center gap-2 text-black px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:brightness-110 cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #22e696 0%, #16c47f 60%, #0db36e 100%)",
              boxShadow: "0 0 28px rgba(22,196,127,0.45), 0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            <span className="text-lg">▶</span>
            Play Lecture
          </button>

          {/* Secondary CTA — glassmorphism with green-to-gold gradient border */}
          <button
            onClick={() => onPlay(TAWHEED_SERIES_ID)}
            className="flex items-center gap-2 text-white px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 cursor-pointer"
            style={{
              background: "linear-gradient(rgba(255,255,255,0.07), rgba(255,255,255,0.04)) padding-box, linear-gradient(135deg, rgba(22,196,127,0.5), rgba(245,196,81,0.4)) border-box",
              border: "1px solid transparent",
              backdropFilter: "blur(12px)",
            }}
          >
            <span className="text-lg font-black">ⓘ</span>
            More Info
          </button>

          {user && (
            <button
              onClick={() => toggleSeries(TAWHEED_SERIES_ID)}
              className="p-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 cursor-pointer"
              style={saved
                ? { background: "rgba(22,196,127,0.15)", border: "1px solid rgba(22,196,127,0.4)", color: "#16c47f" }
                : { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.6)" }}
              title={saved ? "Remove from favorites" : "Save to favorites"}
            >
              {saved ? <IoHeart className="text-xl" /> : <IoHeartOutline className="text-xl" />}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}

export default Hero;
