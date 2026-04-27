import { allAudioBooks } from "./data";
import { useAudioProgress } from "./AudioProgressContext";

interface ContinueListeningProps {
  onSelectBook: (bookId: string, episodeId: number, timestamp: number) => void;
}

function ContinueListening({ onSelectBook }: ContinueListeningProps) {
  const { allAudioProgress } = useAudioProgress();

  const booksWithProgress = allAudioBooks
    .filter((b) => allAudioProgress[b.id])
    .sort((a, b) =>
      allAudioProgress[b.id].updatedAt.localeCompare(allAudioProgress[a.id].updatedAt)
    );

  if (booksWithProgress.length === 0) return null;

  return (
    <section className="px-8 mt-8 mb-4">
      <h3 className="text-lg font-bold mb-4 text-text-main">Continue Listening</h3>

      <div className="flex flex-wrap gap-4">
        {booksWithProgress.map((book) => {
          const prog = allAudioProgress[book.id];
          const episode = book.episodes.find((e) => e.id === prog.episodeId);
          const pct = prog.duration > 0 ? Math.min((prog.timestamp / prog.duration) * 100, 100) : 0;

          return (
            <div
              key={book.id}
              onClick={() => onSelectBook(book.id, prog.episodeId, prog.timestamp)}
              className="group cursor-pointer w-[160px]"
            >
              <div className="relative w-[160px] h-[160px] rounded-xl overflow-hidden bg-app-card border border-white/5 group-hover:border-brand-primary transition-all duration-300">
                <img
                  src={book.image}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

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
