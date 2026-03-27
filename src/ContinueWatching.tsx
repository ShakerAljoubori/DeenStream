// 1. Add the Interface for props
interface ContinueWatchingProps {
  onSelectVideo: () => void;
}

function ContinueWatching({ onSelectVideo }: ContinueWatchingProps) {
  const movies = [
    {
      id: 1,
      title: "Tawheed - The Three Fundamental Principles",
      episodes: "37 Episodes",
      image: "https://e3.365dm.com/17/06/1600x900/0ee0f52eb177ff5801a44709978412578c6378b714792605ab2e0cad9586f2a8_3973042.jpg?20170608032802",
    },
    // ... rest of your movies
  ];

  return (
    <section className="px-8 mt-12 mb-20">
      <h3 className="text-lg font-bold mb-4 text-text-main">Continue Watching</h3>

      <div className="flex flex-wrap gap-4">
        {movies.map((movie) => (
          <div 
            key={movie.id} 
            // 2. Add the onClick handler here
            onClick={() => movie.id === 1 && onSelectVideo()} 
            className="group cursor-pointer max-w-[240px]"
          >
            <div className="aspect-video rounded-md overflow-hidden bg-app-card border border-white/5 group-hover:border-brand-primary transition-all">
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            <div className="mt-2">
              <h4 className="text-sm font-semibold text-text-main group-hover:text-brand-primary transition truncate">
                {movie.title}
              </h4>
              <p className="text-xs text-text-muted">{movie.episodes}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ContinueWatching;