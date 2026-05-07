import { useState, useRef, useEffect, useCallback } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { allSeries, allAudioBooks } from "./data";
import type { Series, AudioBook, Episode, AudioEpisode } from "./data";

interface NavbarProps {
  onSelectSeries: (seriesId: string, episodeId?: number) => void;
  onSelectBook: (bookId: string, episodeId?: number) => void;
}

interface EpisodeHit {
  seriesId: string;
  seriesTitle: string;
  thumbnail?: string;
  episode: Episode;
}

interface AudioEpisodeHit {
  bookId: string;
  bookTitle: string;
  image: string;
  episode: AudioEpisode;
}

interface SearchResults {
  series: Series[];
  books: AudioBook[];
  videoEpisodes: EpisodeHit[];
  audioEpisodes: AudioEpisodeHit[];
}

function Navbar({ onSelectSeries, onSelectBook }: NavbarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>({ series: [], books: [], videoEpisodes: [], audioEpisodes: [] });
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = useCallback((q: string) => {
    const lower = q.toLowerCase().trim();
    if (!lower) {
      setResults({ series: [], books: [], videoEpisodes: [], audioEpisodes: [] });
      return;
    }
    const series = allSeries.filter(s =>
      s.title.toLowerCase().includes(lower) ||
      s.instructor.toLowerCase().includes(lower) ||
      s.category.toLowerCase().includes(lower)
    ).slice(0, 4);

    const books = allAudioBooks.filter(b =>
      b.title.toLowerCase().includes(lower) ||
      b.author.toLowerCase().includes(lower)
    ).slice(0, 4);

    const videoEpisodes: EpisodeHit[] = [];
    for (const s of allSeries) {
      for (const ep of s.episodes) {
        if (ep.title.toLowerCase().includes(lower)) {
          videoEpisodes.push({ seriesId: s.id, seriesTitle: s.title, thumbnail: s.thumbnail, episode: ep });
          if (videoEpisodes.length >= 4) break;
        }
      }
      if (videoEpisodes.length >= 4) break;
    }

    const audioEpisodes: AudioEpisodeHit[] = [];
    for (const b of allAudioBooks) {
      for (const ep of b.episodes) {
        if (ep.title.toLowerCase().includes(lower)) {
          audioEpisodes.push({ bookId: b.id, bookTitle: b.title, image: b.image, episode: ep });
          if (audioEpisodes.length >= 4) break;
        }
      }
      if (audioEpisodes.length >= 4) break;
    }

    setResults({ series, books, videoEpisodes, audioEpisodes });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), 150);
  };

  const clearSearch = () => {
    setQuery("");
    setResults({ series: [], books: [], videoEpisodes: [], audioEpisodes: [] });
  };

  const handleSelect = (type: "series" | "book" | "video-episode" | "audio-episode", id: string, episodeId?: number) => {
    clearSearch();
    if (type === "series") onSelectSeries(id);
    else if (type === "book") onSelectBook(id);
    else if (type === "video-episode") onSelectSeries(id, episodeId);
    else onSelectBook(id, episodeId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") clearSearch();
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) clearSearch();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isOpen = query.trim().length > 0;
  const hasResults = results.series.length > 0 || results.books.length > 0 || results.videoEpisodes.length > 0 || results.audioEpisodes.length > 0;

  return (
    <nav className="fixed top-0 left-0 w-full z-[55] flex items-center justify-between pl-24 pr-8 py-4 backdrop-blur-md" style={{ background: "linear-gradient(180deg, rgba(10,24,16,0.92) 0%, rgba(8,12,9,0.7) 100%)", borderBottom: "1px solid rgba(22, 196, 127, 0.18)" }}>

      {/* Left spacer */}
      <div className="flex-1 hidden md:block" />

      {/* Centered search bar */}
      <div className="flex-1 flex justify-center items-center">
        <div ref={containerRef} className="relative flex items-center group">
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors text-lg z-10" />

          <input
            type="text"
            value={query}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search lectures..."
            className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm text-text-main placeholder:text-text-muted/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/30 focus:bg-white/10 transition-all duration-300 ease-in-out w-40 focus:w-[min(320px,calc(100vw-2rem))]"
          />

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-[min(320px,calc(100vw-2rem))] rounded-xl shadow-2xl overflow-hidden z-50" style={{ background: "linear-gradient(145deg, #1a2e22 0%, #111111 100%)", border: "1px solid rgba(22, 196, 127, 0.15)" }}>
              {hasResults ? (
                <>
                  {results.series.length > 0 && (
                    <>
                      <div className="px-4 py-2 text-xs font-medium text-white/30 uppercase tracking-wider">
                        Series
                      </div>
                      {results.series.map(s => (
                        <button
                          key={s.id}
                          onMouseDown={() => handleSelect("series", s.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors"
                        >
                          {s.thumbnail ? (
                            <img src={s.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm text-white truncate">{s.title}</div>
                            <div className="text-xs text-white/40">{s.instructor} · {s.category}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {results.videoEpisodes.length > 0 && (
                    <>
                      <div className={`px-4 py-2 text-xs font-medium text-white/30 uppercase tracking-wider ${results.series.length > 0 ? "border-t border-white/5" : ""}`}>
                        Episodes
                      </div>
                      {results.videoEpisodes.map(hit => (
                        <button
                          key={`${hit.seriesId}-${hit.episode.id}`}
                          onMouseDown={() => handleSelect("video-episode", hit.seriesId, hit.episode.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors"
                        >
                          {hit.thumbnail ? (
                            <img src={hit.thumbnail} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-white/10 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="text-sm text-white truncate">{hit.episode.title}</div>
                            <div className="text-xs text-white/40 truncate">{hit.seriesTitle} · {hit.episode.duration}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {results.books.length > 0 && (
                    <>
                      <div className={`px-4 py-2 text-xs font-medium text-white/30 uppercase tracking-wider ${results.series.length > 0 || results.videoEpisodes.length > 0 ? "border-t border-white/5" : ""}`}>
                        Audio
                      </div>
                      {results.books.map(b => (
                        <button
                          key={b.id}
                          onMouseDown={() => handleSelect("book", b.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors"
                        >
                          <img src={b.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm text-white truncate">{b.title}</div>
                            <div className="text-xs text-white/40">{b.author}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {results.audioEpisodes.length > 0 && (
                    <>
                      <div className={`px-4 py-2 text-xs font-medium text-white/30 uppercase tracking-wider ${results.series.length > 0 || results.videoEpisodes.length > 0 || results.books.length > 0 ? "border-t border-white/5" : ""}`}>
                        Audio Episodes
                      </div>
                      {results.audioEpisodes.map(hit => (
                        <button
                          key={`${hit.bookId}-${hit.episode.id}`}
                          onMouseDown={() => handleSelect("audio-episode", hit.bookId, hit.episode.id)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 text-left transition-colors"
                        >
                          <img src={hit.image} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0">
                            <div className="text-sm text-white truncate">{hit.episode.title}</div>
                            <div className="text-xs text-white/40 truncate">{hit.bookTitle} · {hit.episode.duration}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                </>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-white/30">
                  No results for "{query}"
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right spacer */}
      <div className="flex-1 hidden md:block" />
    </nav>
  );
}

export default Navbar;
