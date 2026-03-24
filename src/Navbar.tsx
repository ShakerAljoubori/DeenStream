import { IoSearchOutline } from "react-icons/io5";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between pl-24 pr-8 py-4 bg-app-bg/40 backdrop-blur-md border-b border-white/5">
      
      {/* 1. Left Spacer (Balances the sidebar logo) */}
      <div className="flex-1 hidden md:block"></div>

      {/* 2. Centered Expanding Search Bar */}
      <div className="flex-1 flex justify-center items-center">
        <div className="relative group flex items-center">
          {/* Magnifying Glass Icon */}
          <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-brand-primary transition-colors text-lg z-10" />
          
          <input 
            type="text" 
            placeholder="Search lectures..." 
            className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-sm text-text-main placeholder:text-text-muted/40 focus:outline-none focus:ring-1 focus:ring-brand-primary/30 focus:bg-white/10 transition-all duration-300 ease-in-out w-40 focus:w-80"
          />
        </div>
      </div>

      {/* 3. Right Spacer */}
      <div className="flex-1 hidden md:block"></div>

    </nav>
  );
}

export default Navbar;