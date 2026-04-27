import { useState, useEffect } from "react";
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
import { allSeries, allAudioBooks } from "./data";
import type { Series, AudioBook } from "./data";

type Page = "home" | "video" | "audiobooks" | "login" | "register" | "favorites";

interface User {
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

  const { fetchFavorites, clearFavorites } = useFavorites();

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
            setUser(userData);
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
    setCurrentPage(page);
    setSelectedAudioBook(null);
    setSelectedSeries(null);
    setInitialEpisodeId(undefined);
    setInitialTimestamp(undefined);
    setInitialAudioEpisodeId(undefined);
    setInitialAudioTimestamp(undefined);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    clearFavorites();
    setCurrentPage("home");
  };

  if (loading) return <div className="min-h-screen bg-app-bg" />;

  return (
    <div className="min-h-screen bg-app-bg text-white relative">
      <Sidebar
        onNavigate={navigateTo}
        currentPage={currentPage}
        user={user}
        onLogout={handleLogout}
      />

      <div className="pl-20">
        <Navbar />

        <main className="pb-24">
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
              onSelectSeries={(seriesId) => handleOpenVideo(seriesId)}
              onSelectBook={(book) => handleOpenBook(book.id)}
            />
          )}

          {currentPage === "video" && selectedSeries && (
            <VideoDetailsPage
              series={selectedSeries}
              user={user}
              onBack={() => navigateTo("home")}
              initialEpisodeId={initialEpisodeId}
              initialTimestamp={initialTimestamp}
            />
          )}

          {currentPage === "audiobooks" &&
            (!selectedAudioBook ? (
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
            ))}
        </main>
      </div>

      <AudioStickyPlayer />
    </div>
  );
}

export default App;
