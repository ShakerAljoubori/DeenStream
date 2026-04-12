import { useState, useEffect, useRef } from "react";
import { GrPlay } from "react-icons/gr";
import { IoHeadsetOutline, IoHeartOutline } from "react-icons/io5";

interface SidebarProps {
  // Updated to include login and register types
  onNavigate: (page: "home" | "audiobooks" | "login" | "register") => void;
  currentPage: string;
}

function Sidebar({ onNavigate, currentPage }: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <aside className="fixed left-0 top-0 h-screen w-20 flex flex-col items-center py-6 bg-app-card border-r border-white/5 z-60">
      {/* Brand Logo */}
      <div className="text-brand-primary font-black text-2xl mb-12">
        <button onClick={() => onNavigate("home")} className="cursor-pointer">
          DS
        </button>
      </div>

      <div className="flex flex-col gap-6">
        {/* Video Lectures */}
        <div
          onClick={() => onNavigate("home")}
          className={`p-3 group rounded-xl transition-all cursor-pointer ${
            currentPage === "home"
              ? "bg-brand-primary/10 text-brand-primary"
              : "text-text-muted hover:bg-brand-primary/10 hover:text-brand-primary"
          }`}
        >
          <GrPlay className="text-xl transition-colors" />
        </div>

        {/* Audio Content */}
        <div
          onClick={() => onNavigate("audiobooks")}
          className={`p-3 group rounded-xl transition-all cursor-pointer ${
            currentPage === "audiobooks"
              ? "bg-brand-primary/10 text-brand-primary"
              : "text-text-muted hover:bg-brand-primary/10 hover:text-brand-primary"
          }`}
        >
          <IoHeadsetOutline className="text-2xl transition-colors" />
        </div>

        {/* My List */}
        <div className="p-3 group text-text-muted hover:bg-brand-primary/10 rounded-xl transition-all cursor-pointer">
          <IoHeartOutline className="text-2xl group-hover:text-brand-primary transition-colors" />
        </div>
      </div>

      {/* Profile Section */}
      <div className="mt-auto relative" ref={menuRef}>
        {/* Pop-up Menu */}
        {showProfileMenu && (
          <div className="absolute left-16 bottom-0 mb-2 w-32 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl py-2 z-70 animate-in fade-in slide-in-from-left-2 duration-200">
            <button
              className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-brand-primary/20 hover:text-brand-primary transition-colors"
              onClick={() => {
                onNavigate("login"); // Added redirection
                setShowProfileMenu(false);
              }}
            >
              Login
            </button>
            <button
              className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-brand-primary/20 hover:text-brand-primary transition-colors"
              onClick={() => {
                onNavigate("register"); // Added redirection
                setShowProfileMenu(false);
              }}
            >
              Register
            </button>
          </div>
        )}

        {/* Profile Icon */}
        <div
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`mb-4 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all border ${
            showProfileMenu
              ? "bg-brand-primary/20 border-brand-primary text-brand-primary"
              : "bg-brand-secondary/20 border-brand-secondary/40 text-brand-secondary"
          }`}
        >
          S
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
