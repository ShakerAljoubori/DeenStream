import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import ContinueWatching from "./ContinueWatching";
import Sidebar from "./Sidebar";
import VideoDetailsPage from "./VideoDetailsPage";
import AudioBooksPage from "./AudioBooksPage";
import AudioPlayerPage from "./AudioPlayerPage";
import AudioStickyPlayer from "./AudioStickyPlayer";
import Login from "./Login";
import Register from "./Register";
import { allSeries } from "./data";
import type { Series, AudioBook } from "./data";

type Page = "home" | "video" | "audiobooks" | "login" | "register";

// Define the User structure
interface User {
  name: string;
  email: string;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedAudioBook, setSelectedAudioBook] = useState<AudioBook | null>(null);
  
  // 1. TRACK LOGGED-IN USER & LOADING STATE
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. PERSISTENCE LOGIC: Check for token on refresh
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem("token");
      
      if (token) {
        try {
          const response = await fetch("http://localhost:5000/api/users/me", {
            headers: {
              "x-auth-token": token 
            }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
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

  const handleOpenVideo = (seriesId: string) => {
    const series = allSeries.find((s) => s.id === seriesId);
    if (series) {
      setSelectedSeries(series);
      setCurrentPage("video");
    }
  };

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
    setSelectedAudioBook(null);
    setSelectedSeries(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setCurrentPage("home");
  };

  // Prevent UI flickering while checking the session
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
              <Hero onPlay={handleOpenVideo} />
              <ContinueWatching
                onSelectVideo={() => handleOpenVideo("tawheed-01")}
              />
            </div>
          )}

          {currentPage === "login" && (
            <Login
              onSwitch={() => setCurrentPage("register")}
              onLogin={(userData: User) => {
                setUser(userData);
                setCurrentPage("home");
              }}
            />
          )}

          {currentPage === "register" && (
            <Register
              onSwitch={() => setCurrentPage("login")}
              onRegister={(userData: User) => {
                setUser(userData);
                setCurrentPage("home");
              }}
            />
          )}

          {currentPage === "video" && selectedSeries && (
            <VideoDetailsPage
              series={selectedSeries}
              onBack={() => navigateTo("home")}
            />
          )}

          {currentPage === "audiobooks" &&
            (!selectedAudioBook ? (
              <AudioBooksPage
                onBack={() => navigateTo("home")}
                onSelectBook={(book) => setSelectedAudioBook(book)}
              />
            ) : (
              <AudioPlayerPage
                book={selectedAudioBook}
                onBack={() => setSelectedAudioBook(null)}
              />
            ))}
        </main>
      </div>

      <AudioStickyPlayer />
    </div>
  );
}

export default App;