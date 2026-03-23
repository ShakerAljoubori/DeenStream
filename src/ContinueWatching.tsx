function ContinueWatching() {
  const movies = [
    {
      id: 1,
      title: "Foundations of Tawheed",
      episodes: "12 Episodes",
      image:
        "https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=400",
    },
    {
      id: 2,
      title: "Purification of the Soul",
      episodes: "Ep. 2 - Sincerity",
      image:
        "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?q=80&w=400",
    },
    {
      id: 3,
      title: "Stories of the Prophets",
      episodes: "8 Episodes",
      image:
        "https://images.unsplash.com/photo-1564683214965-3619addd900d?q=80&w=400",
    },
  ];

  return (
    <section className="px-8 mt-12 mb-20">
      <h3 className="text-lg font-bold mb-4 text-text-main">
        Continue Watching
      </h3>

      {/* We changed grid-cols-3 to grid-cols-4 and md:grid-cols-5 for smaller thumbnails */}
      <div className="flex flex-wrap gap-4">
        {movies.map((movie) => (
          <div key={movie.id} className="group cursor-pointer max-w-[240px]">
            {/* Image Container */}
            <div className="aspect-video rounded-md overflow-hidden bg-app-card border border-white/5 group-hover:border-brand-primary transition-all">
              <img
                src={movie.image}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Text Info - Smaller font sizes */}
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
