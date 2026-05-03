import { useState, useEffect, useRef } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import gsap from "gsap";
import Navbar from "./Navbar";
import Hero from "./Hero";
import ContinueWatching from "./ContinueWatching";
import ContinueListening from "./ContinueListening";
import SeriesBrowse from "./SeriesBrowse";
import Sidebar from "./Sidebar";
import VideoDetailsPage from "./VideoDetailsPage";
import AudioBooksPage from "./AudioBooksPage";
import AudioPlayerPage from "./AudioPlayerPage";
import AudioStickyPlayer from "./AudioStickyPlayer";
import Login from "./Login";
import Register from "./Register";
import Favorites from "./Favorites";
import { useFavorites } from "./FavoritesContext";
import { useAuth } from "./AuthContext";
import { allSeries, allAudioBooks } from "./data";
import type { Series, AudioBook } from "./data";

type Page = "home" | "video" | "audiobooks" | "login" | "register" | "favorites";

interface User {
  id: string;
  name: string;
  email: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedAudioBook, setSelectedAudioBook] = useState<AudioBook | null>(null);
  const [initialEpisodeId, setInitialEpisodeId] = useState<number | undefined>();
  const [initialTimestamp, setInitialTimestamp] = useState<number | undefined>();
  const [initialAudioEpisodeId, setInitialAudioEpisodeId] = useState<number | undefined>();
  const [initialAudioTimestamp, setInitialAudioTimestamp] = useState<number | undefined>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Tracks what page we came FROM so the home page knows whether to
  // start blurred (returning from video) or faded (fresh load / other page).
  const prevPageRef = useRef<Page>("home");

  // Saved scroll offset so we can restore position after closing the video overlay.
  const savedScrollRef = useRef(0);

  // GSAP page transition curtain
  const overlayRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);

  const { fetchFavorites, clearFavorites } = useFavorites();
  const { setUserId } = useAuth();

  // On mount: restore session + load favorites if token exists
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch("http://localhost:5000/api/users/me", {
            headers: { "x-auth-token": token },
          });
          if (response.ok) {
            const userData = await response.json();
            const id = userData._id ?? userData.id;
            setUser({ id, name: userData.name, email: userData.email });
            setUserId(id);
            fetchFavorites();
          } else {
            localStorage.removeItem("token");
          }
        } catch (error) {
          console.error("Auth check failed:", error);
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const handleOpenVideo = (seriesId: string, episodeId?: number, timestamp?: number) => {
    const series = allSeries.find((s) => s.id === seriesId);
    if (series) {
      // Lock body scroll SYNCHRONOUSLY — before React re-renders and before
      // Framer Motion measures the card's getBoundingClientRect().
      // Using position:fixed + top:-scrollY preserves the visual scroll offset
      // so the card's viewport position stays identical after locking.
      savedScrollRef.current = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollRef.current}px`;
      document.body.style.width = "100%";

      prevPageRef.current = currentPage;
      setSelectedSeries(series);
      setInitialEpisodeId(episodeId);
      setInitialTimestamp(timestamp);
      setCurrentPage("video");
    }
  };

  const handleOpenBook = (bookId: string, episodeId?: number, timestamp?: number) => {
    const book = allAudioBooks.find((b) => b.id === bookId);
    if (book) {
      setSelectedAudioBook(book);
      setInitialAudioEpisodeId(episodeId);
      setInitialAudioTimestamp(timestamp);
      setCurrentPage("audiobooks");
    }
  };

  const navigateTo = (page: Page) => {
    if (page === currentPage) return;

    // Video close: let Framer Motion layoutId morph play unobstructed — skip curtain.
    if (currentPage === "video") {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, savedScrollRef.current);
      prevPageRef.current = "video";
      setCurrentPage(page);
      setSelectedAudioBook(null);
      setSelectedSeries(null);
      setInitialEpisodeId(undefined);
      setInitialTimestamp(undefined);
      setInitialAudioEpisodeId(undefined);
      setInitialAudioTimestamp(undefined);
      return;
    }

    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    prevPageRef.current = currentPage;

    gsap.timeline({ onComplete: () => { isTransitioningRef.current = false; } })
      .set(overlayRef.current, { y: "100%" })
      .to(overlayRef.current, { y: "0%", duration: 0.42, ease: "power3.inOut" })
      .call(() => {
        setCurrentPage(page);
        setSelectedAudioBook(null);
        setSelectedSeries(null);
        setInitialEpisodeId(undefined);
        setInitialTimestamp(undefined);
        setInitialAudioEpisodeId(undefined);
        setInitialAudioTimestamp(undefined);
        window.scrollTo(0, 0);
      })
      .to(overlayRef.current, { y: "-100%", duration: 0.42, ease: "power3.inOut", delay: 0.05 });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setUserId(null);
    clearFavorites();
    setCurrentPage("home");
  };

  if (loading) return <div className="min-h-screen bg-app-bg" />;

  return (
    // LayoutGroup coordinates layoutId animations across separate AnimatePresence trees
    <LayoutGroup>
      <div className="min-h-screen bg-app-bg text-white relative">
        <Sidebar
          onNavigate={navigateTo}
          currentPage={currentPage}
          user={user}
          onLogout={handleLogout}
        />

        <div className="pl-20">
          <Navbar onSelectSeries={handleOpenVideo} onSelectBook={handleOpenBook} />

          <main className="pb-24">
            <AnimatePresence>
              {currentPage === "home" && (
                <motion.div
                  key="home"
                  className="pt-4"
                  initial={
                    prevPageRef.current === "video"
                      ? { opacity: 0.6, filter: "blur(10px)" }
                      : { opacity: 0, filter: "blur(0px)" }
                  }
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0.6, filter: "blur(10px)" }}
                  transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
                >
                  <Hero onPlay={handleOpenVideo} user={user} />
                  <ContinueWatching onSelectVideo={handleOpenVideo} />
                  <ContinueListening onSelectBook={handleOpenBook} />
                  <SeriesBrowse onSelectSeries={handleOpenVideo} user={user} />
                </motion.div>
              )}

              {currentPage === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Login
                    onSwitch={() => setCurrentPage("register")}
                    onLogin={(userData: User) => {
                      setUser(userData);
                      setUserId(userData.id);
                      fetchFavorites();
                      setCurrentPage("home");
                    }}
                  />
                </motion.div>
              )}

              {currentPage === "register" && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Register
                    onSwitch={() => setCurrentPage("login")}
                    onRegister={(userData: User) => {
                      setUser(userData);
                      setUserId(userData.id);
                      fetchFavorites();
                      setCurrentPage("home");
                    }}
                  />
                </motion.div>
              )}

              {currentPage === "favorites" && (
                <motion.div
                  key="favorites"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Favorites
                    user={user}
                    onLogin={() => setCurrentPage("login")}
                    onRegister={() => setCurrentPage("register")}
                    onSelectSeries={(seriesId, episodeId) => handleOpenVideo(seriesId, episodeId)}
                    onSelectBook={(book, episodeId) => handleOpenBook(book.id, episodeId)}
                  />
                </motion.div>
              )}

              {currentPage === "audiobooks" && (
                <motion.div
                  key="audiobooks"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {!selectedAudioBook ? (
                    <AudioBooksPage
                      onBack={() => navigateTo("home")}
                      onSelectBook={(book) => handleOpenBook(book.id)}
                      user={user}
                    />
                  ) : (
                    <AudioPlayerPage
                      book={selectedAudioBook}
                      onBack={() => setSelectedAudioBook(null)}
                      user={user}
                      initialEpisodeId={initialAudioEpisodeId}
                      initialTimestamp={initialAudioTimestamp}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>

        {/* Video overlay — separate AnimatePresence so it layers over the home page
            while the home cards' layoutIds are still in the DOM for the morph origin */}
        <AnimatePresence>
          {currentPage === "video" && selectedSeries && (
            <VideoDetailsPage
              key={selectedSeries.id}
              series={selectedSeries}
              user={user}
              onBack={() => navigateTo("home")}
              initialEpisodeId={initialEpisodeId}
              initialTimestamp={initialTimestamp}
            />
          )}
        </AnimatePresence>

        <AudioStickyPlayer />

        {/* GSAP page transition curtain — sweeps up from below, exits through top */}
        <div
          ref={overlayRef}
          className="fixed inset-0 pointer-events-none"
          style={{
            zIndex: 9999,
            transform: "translateY(100%)",
            background: "linear-gradient(180deg, #080f0c 0%, #0d2318 82%, #16c47f 96%, #22e696 100%)",
          }}
        />
      </div>
    </LayoutGroup>
  );
}

export default App;
