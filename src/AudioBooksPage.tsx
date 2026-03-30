import { allAudioBooks } from "./data";
import type { AudioBook } from "./data"; // Use 'import type' to fix the TS error

interface AudioBooksPageProps {
  onBack: () => void;
  onSelectBook: (book: AudioBook) => void;
}

const AudioBooksPage = ({ onBack, onSelectBook }: AudioBooksPageProps) => {
  return (
    <div className="p-8 pt-24 animate-in fade-in duration-500 min-h-screen bg-app-bg">
      <div className="flex items-center justify-between mb-8 text-white">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">Audio Library</h1>
          <p className="text-text-muted">Your collection of audiobooks and deep-dives.</p>
        </div>
        <button 
          onClick={onBack}
          className="bg-white/5 hover:bg-white/10 text-white px-6 py-2 rounded-full border border-white/10 transition-all text-sm font-bold"
        >
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {allAudioBooks.map((book) => (
          <div 
            key={book.id} 
            onClick={() => onSelectBook(book)}
            className="group bg-[#181818] p-4 rounded-xl hover:bg-[#282828] transition-all duration-300 cursor-pointer shadow-xl border border-transparent hover:border-brand-primary/20"
          >
            <div className="relative aspect-square mb-4 overflow-hidden rounded-lg shadow-2xl">
              <img src={book.image} alt={book.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <div className="bg-[#16C47F] p-3 rounded-full shadow-lg transform hover:scale-110">
                  <span className="text-black text-xl">▶</span>
                </div>
              </div>
            </div>
            <h3 className="font-bold text-white truncate text-lg mb-1">{book.title}</h3>
            <p className="text-sm text-text-muted truncate mb-2">{book.author}</p>
            
            <span className="text-[10px] text-[#16C47F] font-bold uppercase tracking-widest bg-[#16C47F]/10 px-2 py-1 rounded">
              {book.episodes.length} Episodes
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AudioBooksPage;