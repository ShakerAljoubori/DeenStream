function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-app-bg/60 backdrop-blur-md border-b border-white/5">
      {/* Brand Logo */}
      <h1 className="text-2xl font-bold text-brand-primary tracking-tighter cursor-pointer">
        DEENSTREAM
      </h1>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-8 text-sm font-medium text-text-muted">
        <a href="#" className="hover:text-brand-primary transition">
          Home
        </a>
        <a href="#" className="hover:text-brand-primary transition">
          Movies
        </a>
        <a href="#" className="hover:text-brand-primary transition">
          New & Popular
        </a>
        <a href="#" className="hover:text-brand-primary transition">
          My List
        </a>
      </div>

      {/* Profile/Search Placeholder */}
      <div className="text-text-main text-sm font-medium cursor-pointer hover:text-brand-primary">
        Search
      </div>
    </nav>
  );
}

export default Navbar;
