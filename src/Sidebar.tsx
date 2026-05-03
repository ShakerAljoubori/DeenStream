import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GrPlay } from "react-icons/gr";
import { IoHeadsetOutline, IoHeartOutline } from "react-icons/io5";
import { HiOutlineUserCircle } from "react-icons/hi";
import { useAudioPlayer } from "./AudioPlayerContext";

interface SidebarProps {
  onNavigate: (page: "home" | "audiobooks" | "login" | "register" | "favorites") => void;
  currentPage: string;
  user: { name: string; email: string } | null;
  onLogout: () => void;
}

const NAV_ACTIVE_STYLE = {
  background: "linear-gradient(135deg, #22e696 0%, #16c47f 60%, #0db36e 100%)",
};

const POPUP_STYLE = {
  background: "linear-gradient(145deg, #1a2e22 0%, #111111 100%)",
  border: "1px solid rgba(22, 196, 127, 0.18)",
};

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
    <aside
      className="fixed left-0 top-0 h-screen w-20 flex flex-col items-center py-6 z-60"
      style={{
        background: "linear-gradient(180deg, #152b1f 0%, #101f16 35%, #0d1710 65%, #080808 100%)",
        borderRight: "1px solid rgba(22, 196, 127, 0.18)",
      }}
    >
      {/* DS Logo — green-to-gold gradient text */}
      <div className="font-black text-2xl mb-12">
        <button
          onClick={() => onNavigate("home")}
          className="cursor-pointer hover:opacity-80 transition-opacity outline-none"
          style={{
            background: "linear-gradient(135deg, #16c47f 0%, #f5c451 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          DS
        </button>
      </div>

      <nav className="flex-1 flex flex-col gap-8">
        <motion.button
          onClick={() => onNavigate("home")}
          className="p-3 rounded-2xl"
          style={currentPage === "home"
            ? { ...NAV_ACTIVE_STYLE, color: "#000", boxShadow: "0 4px 20px rgba(22, 196, 127, 0.35)" }
            : { color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={e => { if (currentPage !== "home") (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={e => { if (currentPage !== "home") (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.8, rotate: -12 }}
          transition={{ type: "spring", stiffness: 420, damping: 20 }}
        >
          <GrPlay className="text-xl" />
        </motion.button>

        <motion.button
          onClick={() => onNavigate("audiobooks")}
          className="p-3 rounded-2xl"
          style={currentPage === "audiobooks"
            ? { ...NAV_ACTIVE_STYLE, color: "#000", boxShadow: "0 4px 20px rgba(22, 196, 127, 0.35)" }
            : { color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={e => { if (currentPage !== "audiobooks") (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={e => { if (currentPage !== "audiobooks") (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.8, rotate: 12 }}
          transition={{ type: "spring", stiffness: 420, damping: 20 }}
        >
          <IoHeadsetOutline className="text-xl" />
        </motion.button>

        <motion.button
          onClick={() => onNavigate("favorites")}
          className="p-3 rounded-2xl"
          style={currentPage === "favorites"
            ? { ...NAV_ACTIVE_STYLE, color: "#000", boxShadow: "0 4px 20px rgba(22, 196, 127, 0.35)" }
            : { color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={e => { if (currentPage !== "favorites") (e.currentTarget as HTMLElement).style.color = "#fff"; }}
          onMouseLeave={e => { if (currentPage !== "favorites") (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)"; }}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.75, rotate: -10 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
        >
          <IoHeartOutline className="text-xl" />
        </motion.button>
      </nav>

      <div className="relative" ref={menuRef}>
        <AnimatePresence>
          {showProfileMenu && (
            <motion.div
              className={`absolute left-16 ${
                currentBook || currentEpisode ? "bottom-[74px]" : "bottom-0"
              } mb-2 w-48 rounded-2xl shadow-2xl py-2 overflow-hidden`}
              style={POPUP_STYLE}
              initial={{ opacity: 0, x: -10, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
            >
              {user ? (
                <>
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-white/40 truncate">{user.email}</p>
                  </div>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    onClick={() => { onLogout(); setShowProfileMenu(false); }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-brand-primary/20 hover:text-brand-primary transition-colors"
                    onClick={() => { onNavigate("login"); setShowProfileMenu(false); }}
                  >
                    Login
                  </button>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-white/80 hover:bg-brand-primary/20 hover:text-brand-primary transition-colors"
                    onClick={() => { onNavigate("register"); setShowProfileMenu(false); }}
                  >
                    Register
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`${
            currentBook || currentEpisode ? "mb-24" : "mb-4"
          } w-10 h-10 rounded-full flex items-center justify-center cursor-pointer font-bold`}
          style={showProfileMenu
            ? { background: "rgba(22,196,127,0.2)", border: "1px solid #16c47f", color: "#16c47f" }
            : { background: "rgba(245,196,81,0.15)", border: "1px solid rgba(245,196,81,0.35)", color: "#f5c451" }}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.82, rotate: 12 }}
          animate={showProfileMenu
            ? { boxShadow: "0 0 0 3px rgba(22,196,127,0.25), 0 0 18px rgba(22,196,127,0.2)" }
            : { boxShadow: "0 0 0 0px rgba(22,196,127,0)" }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
        >
          {user ? user.name.charAt(0).toUpperCase() : <HiOutlineUserCircle className="text-2xl" />}
        </motion.div>
      </div>
    </aside>
  );
}

export default Sidebar;
