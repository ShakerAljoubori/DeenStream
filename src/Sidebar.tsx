import { useState, useEffect, useRef } from "react";
import { GrPlay } from "react-icons/gr";
import { IoHeadsetOutline, IoHeartOutline } from "react-icons/io5";
import { HiOutlineUserCircle } from "react-icons/hi";
import { useAudioPlayer } from "./AudioPlayerContext";

interface SidebarProps {
  onNavigate: (page: "home" | "audiobooks" | "login" | "register") => void;
  currentPage: string;
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

function Sidebar({ onNavigate, currentPage, user, onLogout }: SidebarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { currentBook, currentEpisode } = useAudioPlayer();

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
      <div className="text-brand-primary font-black text-2xl mb-12">
        <button 
          onClick={() => onNavigate("home")} 
          className="cursor-pointer hover:opacity-80 transition-opacity outline-none"
        >
          DS
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-8">
        <button
          onClick={() => onNavigate("home")}
          className={`p-3 rounded-2xl transition-all duration-300 group ${
            currentPage === "home"
              ? "bg-brand-primary text-black shadow-lg shadow-brand-primary/20"
              : "text-white/40 hover:text-white hover:bg-white/5"
          }`}
        >
          <GrPlay className="text-xl" />
        </button>

        <button
          onClick={() => onNavigate("audiobooks")}
          className={`p-3 rounded-2xl transition-all duration-300 group ${
            currentPage === "audiobooks"
              ? "bg-brand-primary text-black shadow-lg shadow-brand-primary/20"
              : "text-white/40 hover:text-white hover:bg-white/5"
          }`}
        >
          <IoHeadsetOutline className="text-xl" />
        </button>

        <button className="p-3 rounded-2xl text-white/40 hover:text-white hover:bg-white/5 transition-all duration-300">
          <IoHeartOutline className="text-xl" />
        </button>
      </nav>

      <div className="relative" ref={menuRef}>
        {showProfileMenu && (
          <div 
            /* Moved down to bottom-[74px] to better utilize the vertical space */
            className={`absolute left-16 ${
              currentBook || currentEpisode ? "bottom-[74px]" : "bottom-0"
            } mb-2 w-48 bg-[#1A1A1A] border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden animate-in fade-in slide-in-from-left-4 duration-200`}
          >
            {user ? (
              <>
                <div className="px-4 py-3 border-b border-white/5">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                  <p className="text-xs text-white/40 truncate">{user.email}</p>
                </div>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  onClick={() => {
                    onLogout();
                    setShowProfileMenu(false);
                  }}
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-brand-primary/20 hover:text-brand-primary transition-colors"
                  onClick={() => {
                    onNavigate("login");
                    setShowProfileMenu(false);
                  }}
                >
                  Login
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-brand-primary/20 hover:text-brand-primary transition-colors"
                  onClick={() => {
                    onNavigate("register");
                    setShowProfileMenu(false);
                  }}
                >
                  Register
                </button>
              </>
            )}
          </div>
        )}

        <div
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`${
            currentBook || currentEpisode ? "mb-24" : "mb-4"
          } w-10 h-10 rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-all border font-bold ${
            showProfileMenu
              ? "bg-brand-primary/20 border-brand-primary text-brand-primary"
              : "bg-brand-secondary/20 border-brand-secondary/40 text-brand-secondary"
          }`}
        >
          {user ? (
            user.name.charAt(0).toUpperCase()
          ) : (
            <HiOutlineUserCircle className="text-2xl" />
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;