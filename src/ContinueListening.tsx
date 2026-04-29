import { IoClose } from "react-icons/io5";
import { allAudioBooks } from "./data";
import { useAudioProgress } from "./AudioProgressContext";

interface ContinueListeningProps {
  onSelectBook: (bookId: string, episodeId: number, timestamp: number) => void;
}

function ContinueListening({ onSelectBook }: ContinueListeningProps) {
  const { allAudioProgress, removeAudioProgress } = useAudioProgress();

  const entries = Object.values(allAudioProgress)
    .filter((prog) => prog.bookId && allAudioBooks.some((b) => b.id === prog.bookId))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (entries.length === 0) return null;

  return (
    <section className="px-8 mt-8 mb-4">
      <h3 className="text-lg font-bold mb-4 text-text-main">Continue Listening</h3>

      <div className="flex flex-wrap gap-4">
        {entries.map((prog) => {
          const book = allAudioBooks.find((b) => b.id === prog.bookId);
          if (!book) return null;
          const episode = book.episodes.find((e) => e.id === prog.episodeId);
          const pct = prog.duration > 0 ? Math.min((prog.timestamp / prog.duration) * 100, 100) : 0;

          return (
            <div
              key={`${prog.bookId}:${prog.episodeId}`}
              onClick={() => onSelectBook(prog.bookId, prog.episodeId, prog.timestamp)}
              className="group cursor-pointer w-[160px]"
            >
              <div className="relative w-[160px] h-[160px] rounded-xl overflow-hidden bg-app-card border border-white/5 group-hover:border-brand-primary transition-all duration-300">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Remove button — visible on hover */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeAudioProgress(prog.bookId, prog.episodeId); }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-95"
                  title="Remove from Continue Listening"
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
                <h4 className="text-sm font-semibold text-text-main group-hover:text-brand-primary transition-colors line-clamp-2">
                  {book.title}
                </h4>
                <p className="text-xs text-text-muted truncate">
                  {episode?.title ?? "Episode"} · {Math.round(pct)}% listened
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default ContinueListening;
