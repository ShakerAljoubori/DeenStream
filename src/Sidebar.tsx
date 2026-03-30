import { GrPlay } from "react-icons/gr";
import { HiOutlineHome } from "react-icons/hi";
import { IoHeadsetOutline, IoHeartOutline } from "react-icons/io5";

// Define the props interface to match App.tsx
interface SidebarProps {
  onNavigate: (page: "home" | "audiobooks") => void;
  currentPage: string;
}

function Sidebar({ onNavigate, currentPage }: SidebarProps) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-20 flex flex-col items-center py-6 bg-app-card border-r border-white/5 z-60">
      
      {/* Brand Logo */}
      <div className="text-brand-primary font-black text-2xl mb-12">
        <button onClick={() => onNavigate("home")} className="cursor-pointer">DS</button>
      </div>

      <div className="flex flex-col gap-6">
        
        {/* Home Button */}
        <div 
          onClick={() => onNavigate("home")}
          className={`p-3 group rounded-xl transition-all cursor-pointer ${
            currentPage === "home" ? "bg-brand-primary/10 text-brand-primary" : "text-text-muted hover:bg-brand-primary/10 hover:text-brand-primary"
          }`}
        >
          <HiOutlineHome className="text-2xl transition-colors" />
        </div>

        {/* Video Lectures (Currently links to Home/Dashboard) */}
        <div className="p-3 group text-text-muted hover:bg-brand-primary/10 rounded-xl transition-all cursor-pointer">
          <GrPlay className="text-xl group-hover:text-brand-primary transition-colors" />
        </div>

        {/* Audio Content Button - Redirects to Spotify-style page */}
        <div 
          onClick={() => onNavigate("audiobooks")}
          className={`p-3 group rounded-xl transition-all cursor-pointer ${
            currentPage === "audiobooks" ? "bg-brand-primary/10 text-brand-primary" : "text-text-muted hover:bg-brand-primary/10 hover:text-brand-primary"
          }`}
        >
          <IoHeadsetOutline className="text-2xl transition-colors" />
        </div>

        {/* My List */}
        <div className="p-3 group text-text-muted hover:bg-brand-primary/10 rounded-xl transition-all cursor-pointer">
          <IoHeartOutline className="text-2xl group-hover:text-brand-primary transition-colors" />
        </div>
      </div>

      {/* Profile Icon */}
      <div className="mt-auto mb-4 w-10 h-10 rounded-full bg-brand-secondary/20 border border-brand-secondary/40 flex items-center justify-center text-brand-secondary cursor-pointer hover:scale-110 transition">
        S
      </div>
    </aside>
  );
}

export default Sidebar;