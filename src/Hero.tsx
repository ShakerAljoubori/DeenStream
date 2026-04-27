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

      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://e3.365dm.com/17/06/1600x900/0ee0f52eb177ff5801a44709978412578c6378b714792605ab2e0cad9586f2a8_3973042.jpg?20170608032802')" }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-app-bg via-app-bg/40 to-transparent backdrop-blur-[2px]" />
      <div className="absolute inset-0 z-11 bg-gradient-to-t from-app-bg via-transparent" />

      <div className="relative z-20 max-w-2xl mt-12">
        <div className="inline-block px-3 py-1 mb-6 rounded-full bg-brand-primary/20 border border-brand-primary/30">
          <span className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Featured</span>
        </div>

        <div className="mb-4">
          <h2 className="text-4xl md:text-5xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-md">
            Tawheed - The Three <br /> Fundamental Principles
          </h2>
          <h3 className="text-3xl md:text-4xl font-bold text-brand-primary mt-2 drop-shadow-sm">
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
          <button
            onClick={() => onPlay(TAWHEED_SERIES_ID)}
            className="flex items-center gap-2 bg-brand-primary text-app-bg px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:brightness-110 cursor-pointer shadow-lg shadow-brand-primary/20"
          >
            <span className="text-lg">▶</span>
            Play Lecture
          </button>

          <button
            onClick={() => onPlay(TAWHEED_SERIES_ID)}
            className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-3 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:bg-white/10 cursor-pointer backdrop-blur-md"
          >
            <span className="text-lg font-black">ⓘ</span>
            More Info
          </button>

          {user && (
            <button
              onClick={() => toggleSeries(TAWHEED_SERIES_ID)}
              className={`p-3 rounded-lg border font-bold transition-all duration-300 hover:scale-105 cursor-pointer backdrop-blur-md ${
                saved
                  ? "bg-[#16C47F]/20 border-[#16C47F]/40 text-[#16C47F]"
                  : "bg-white/5 border-white/10 text-white/60 hover:text-white"
              }`}
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
