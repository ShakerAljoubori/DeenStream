import { useState, useEffect, useRef } from "react";
import { flushSync } from "react-dom";
import { AnimatePresence, LayoutGroup } from "framer-motion";
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

  // GSAP page transition — animates the content wrapper directly
  const contentRef = useRef<HTMLDivElement>(null);
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
      savedScrollRef.current = window.scrollY;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${savedScrollRef.current}px`;
      document.body.style.width = "100%";

      setSelectedAudioBook(book);
      setInitialAudioEpisodeId(episodeId);
      setInitialAudioTimestamp(timestamp);
    }
  };

  const handleCloseBook = () => {
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    window.scrollTo(0, savedScrollRef.current);
    setSelectedAudioBook(null);
    setInitialAudioEpisodeId(undefined);
    setInitialAudioTimestamp(undefined);
  };

  const navigateTo = (page: Page) => {
    if (page === currentPage && !selectedAudioBook) return;

    // Audio overlay close — let Framer Motion morph play, skip GSAP curtain.
    if (selectedAudioBook) {
      handleCloseBook();
      if (page === currentPage) return;
      // Fall through to GSAP for the page navigation.
    }

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

    gsap.to(contentRef.current, {
      opacity: 0,
      y: -10,
      duration: 0.18,
      ease: "power2.in",
      onComplete: () => {
        flushSync(() => {
          setCurrentPage(page);
          setSelectedAudioBook(null);
          setSelectedSeries(null);
          setInitialEpisodeId(undefined);
          setInitialTimestamp(undefined);
          setInitialAudioEpisodeId(undefined);
          setInitialAudioTimestamp(undefined);
          window.scrollTo(0, 0);
        });
        gsap.fromTo(contentRef.current,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.36, ease: "power3.out", onComplete: () => { isTransitioningRef.current = false; } }
        );
      },
    });
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

        <div className="pl-0 md:pl-20">
          <Navbar onSelectSeries={handleOpenVideo} onSelectBook={handleOpenBook} />

          <main className={currentPage === "login" || currentPage === "register" ? "" : "pb-24"}>
            <div ref={contentRef}>
              {currentPage === "home" && (
                <div className="pt-4">
                  <Hero onPlay={handleOpenVideo} user={user} />
                  <ContinueWatching onSelectVideo={handleOpenVideo} />
                  <ContinueListening onSelectBook={handleOpenBook} />
                  <SeriesBrowse onSelectSeries={handleOpenVideo} user={user} />
                </div>
              )}

              {currentPage === "login" && (
                <Login
                  onSwitch={() => setCurrentPage("register")}
                  onLogin={(userData: User) => {
                    setUser(userData);
                    setUserId(userData.id);
                    fetchFavorites();
                    setCurrentPage("home");
                  }}
                />
              )}

              {currentPage === "register" && (
                <Register
                  onSwitch={() => setCurrentPage("login")}
                  onRegister={(userData: User) => {
                    setUser(userData);
                    setUserId(userData.id);
                    fetchFavorites();
                    setCurrentPage("home");
                  }}
                />
              )}

              {currentPage === "favorites" && (
                <Favorites
                  user={user}
                  onLogin={() => setCurrentPage("login")}
                  onRegister={() => setCurrentPage("register")}
                  onSelectSeries={(seriesId, episodeId) => handleOpenVideo(seriesId, episodeId)}
                  onSelectBook={(book, episodeId) => handleOpenBook(book.id, episodeId)}
                />
              )}

              {currentPage === "audiobooks" && (
                <AudioBooksPage
                  onBack={() => navigateTo("home")}
                  onSelectBook={(book) => handleOpenBook(book.id)}
                  user={user}
                />
              )}
            </div>
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
              onSelectSeries={(seriesId) => {
                const next = allSeries.find((s) => s.id === seriesId);
                if (next) {
                  setSelectedSeries(next);
                  setInitialEpisodeId(undefined);
                  setInitialTimestamp(undefined);
                }
              }}
            />
          )}
        </AnimatePresence>

        {/* Audio overlay — same pattern as video, fixed inset-0 over whatever page is current */}
        <AnimatePresence>
          {selectedAudioBook && (
            <AudioPlayerPage
              key={selectedAudioBook.id}
              book={selectedAudioBook}
              onBack={handleCloseBook}
              user={user}
              initialEpisodeId={initialAudioEpisodeId}
              initialTimestamp={initialAudioTimestamp}
            />
          )}
        </AnimatePresence>

        <AudioStickyPlayer />
      </div>
    </LayoutGroup>
  );
}

export default App;
