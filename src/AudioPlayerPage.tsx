import { useEffect } from "react";
import { IoArrowBack, IoPlay, IoPause, IoTimeOutline, IoBookmark, IoBookmarkOutline } from "react-icons/io5";
import { useAudioPlayer } from "./AudioPlayerContext";
import { useFavorites } from "./FavoritesContext";
import { useAudioProgress } from "./AudioProgressContext";
import type { AudioBook } from "./data";

interface AudioPlayerPageProps {
  book: AudioBook;
  onBack: () => void;
  user: { name: string; email: string } | null;
  initialEpisodeId?: number;
  initialTimestamp?: number;
}

const AudioPlayerPage = ({ book, onBack, user, initialEpisodeId, initialTimestamp }: AudioPlayerPageProps) => {
  const { playEpisode, currentEpisode, currentBook, isPlaying, togglePlay } = useAudioPlayer();
  const { isAudioEpisodeSaved, toggleAudioEpisode } = useFavorites();
  const { allAudioProgress } = useAudioProgress();

  // Resume from saved position on mount (from Continue Listening)
  useEffect(() => {
    if (initialEpisodeId) {
      const episode = book.episodes.find((e) => e.id === initialEpisodeId);
      if (episode) playEpisode(episode, book, initialTimestamp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isCurrentEpisode = (episodeId: number) => currentEpisode?.id === episodeId;

  // Find the most recently updated in-progress episode for this book
  const lastBookEntry = Object.values(allAudioProgress)
    .filter((e) => e.bookId === book.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2a2a2a] to-app-bg text-white pt-24 animate-in fade-in duration-500">

      <div className="p-8 flex flex-col md:flex-row gap-8 items-end relative">
        <button
          onClick={onBack}
          className="absolute -top-4 left-8 p-2 bg-black/40 rounded-full hover:bg-black/60 transition z-10 border border-white/10"
        >
          <IoArrowBack size={24} />
        </button>

        <img
          src={book.image}
          alt={book.title}
          className="w-48 h-48 md:w-64 md:h-64 shadow-[0_8px_40px_rgba(0,0,0,0.5)] rounded-md object-cover"
        />

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-primary">Audiobook</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-2">{book.title}</h1>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span>{book.author}</span>
            <span className="text-text-muted">•</span>
            <span className="text-text-muted">{book.episodes.length} Episodes</span>
          </div>
        </div>
      </div>

      <div className="p-8 mt-8 bg-black/20 min-h-screen backdrop-blur-sm">
        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={() => {
              if (currentEpisode && currentBook?.id === book.id) togglePlay();
              else if (book.episodes.length > 0) {
                // Resume from most recently played episode, or start at episode 1
                if (lastBookEntry) {
                  const ep = book.episodes.find((e) => e.id === lastBookEntry.episodeId) ?? book.episodes[0];
                  playEpisode(ep, book, lastBookEntry.timestamp);
                } else {
                  playEpisode(book.episodes[0], book);
                }
              }
            }}
            className="w-14 h-14 bg-brand-primary rounded-full flex items-center justify-center text-black hover:scale-105 transition shadow-lg active:scale-95"
          >
            {isPlaying && currentBook?.id === book.id
              ? <IoPause size={30} />
              : <IoPlay size={30} className="ml-1" />}
          </button>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[40px_1fr_auto_80px] gap-4 px-4 py-2 text-text-muted border-b border-white/10 text-xs font-bold uppercase tracking-wider mb-4">
          <span className="text-center">#</span>
          <span>Title</span>
          <span />
          <div className="flex justify-end pr-4">
            <IoTimeOutline size={18} />
          </div>
        </div>

        <div className="flex flex-col">
          {book.episodes.map((episode, index) => {
            const isActive = isCurrentEpisode(episode.id);
            const isBookmarked = isAudioEpisodeSaved(book.id, episode.id);
            const epProg = allAudioProgress[`${book.id}:${episode.id}`];
            const savedTimestamp = epProg?.timestamp ?? 0;
            const pct = savedTimestamp > 0 && epProg?.duration
              ? Math.min((savedTimestamp / epProg.duration) * 100, 100)
              : 0;

            return (
              <div
                key={episode.id}
                className="relative grid grid-cols-[40px_1fr_auto_80px] gap-4 px-4 py-3 items-center hover:bg-white/5 rounded-md transition-colors group"
              >
                {/* Play indicator / number */}
                <div
                  onClick={() => playEpisode(episode, book, savedTimestamp > 0 ? savedTimestamp : undefined)}
                  className="flex justify-center items-center cursor-pointer"
                >
                  {isActive && isPlaying ? (
                    <IoPause className="text-brand-primary" size={16} />
                  ) : (
                    <>
                      <span className={`text-sm ${isActive ? "text-brand-primary" : "text-text-muted"} group-hover:hidden`}>
                        {index + 1}
                      </span>
                      <IoPlay className="hidden group-hover:block text-brand-primary" size={16} />
                    </>
                  )}
                </div>

                {/* Title + author */}
                <div
                  onClick={() => playEpisode(episode, book, savedTimestamp > 0 ? savedTimestamp : undefined)}
                  className="flex flex-col min-w-0 cursor-pointer"
                >
                  <p className={`font-medium truncate transition-colors ${isActive ? "text-brand-primary" : "text-white"} group-hover:text-brand-primary`}>
                    {episode.title}
                  </p>
                  <p className="text-xs text-text-muted truncate">{book.author}</p>
                </div>

                {/* Bookmark button */}
                {user ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleAudioEpisode(book.id, episode.id); }}
                    className={`transition-all hover:scale-110 active:scale-95 ${
                      isBookmarked ? "text-[#16C47F]" : "text-white/30 hover:text-white/70"
                    }`}
                    title={isBookmarked ? "Remove bookmark" : "Bookmark episode"}
                  >
                    {isBookmarked
                      ? <IoBookmark size={16} />
                      : <IoBookmarkOutline size={16} />}
                  </button>
                ) : (
                  <span />
                )}

                {/* Duration */}
                <span className="text-sm text-text-muted text-right pr-4">{episode.duration}</span>

                {/* Progress bar — shown only for the episode with saved progress */}
                {pct > 0 && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-white/10 rounded-full">
                    <div
                      className="h-full bg-brand-primary rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerPage;
