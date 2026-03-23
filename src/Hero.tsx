function Hero() {
  return (
    <main className="relative min-h-[70vh] flex flex-col justify-center px-8 text-text-main overflow-hidden">
      {/* 1. The Background Image Layer (z-0) */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=1200')",
        }}
      />

      {/* 2. The Main Content Fade Layer (z-10) */}
      {/* This layer still exists; it handles the readability of the text against the image. */}
      <div className="absolute inset-0 z-10 bg-gradient-to-r from-app-bg via-app-bg/60 to-transparent backdrop-blur-sm" />

      {/* NEW: 3. The Bottom Vignette Layer (z-11) */}
      {/* We are creating a NEW absolute layer that sits slightly higher than the main fade.
          'bg-gradient-to-t' = Gradient to Top (Starts from app-bg at the bottom).
          'from-app-bg' = Start with our dark background color.
          'via-app-bg/80' = Slowly fade to the same color, but translucent.
          'to-transparent' = End fully transparent about halfway up the hero. */}
      <div className="absolute inset-0 z-11 bg-gradient-to-t from-app-bg via-app-bg/80 to-transparent" />

      {/* 4. The Content Layer (z-20 so it stays on top) */}
      <div className="relative z-20 max-w-2xl mt-[-8rem]">
        {/* ... (Your existing title, description, and button code remains here) ... */}
        <h2 className="text-6xl font-extrabold leading-tight tracking-tighter">
          Experience Spiritual{" "}
          <span className="text-brand-primary">Clarity</span>
        </h2>
        {/* ... */}
      </div>
    </main>
  );
}

export default Hero;
