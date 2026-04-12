import { useState } from "react";
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

// Added "login" and "register" to the valid pages
type Page = "home" | "video" | "audiobooks" | "login" | "register";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedAudioBook, setSelectedAudioBook] = useState<AudioBook | null>(
    null,
  );

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

  return (
    <div className="min-h-screen bg-app-bg text-white relative">
      <Sidebar onNavigate={navigateTo} currentPage={currentPage} />

      <div className="pl-20">
        <Navbar />

        <main className="pb-24">
          {/* Dashboard View */}
          {currentPage === "home" && (
            <div className="pt-4">
              <Hero onPlay={handleOpenVideo} />
              <ContinueWatching
                onSelectVideo={() => handleOpenVideo("tawheed-01")}
              />
            </div>
          )}

          {/* Login View */}
          {currentPage === "login" && (
            <Login
              onSwitch={() => setCurrentPage("register")}
              onLogin={() => setCurrentPage("home")}
            />
          )}

          {/* Register View */}
          {currentPage === "register" && (
            <Register
              onSwitch={() => setCurrentPage("login")}
              onRegister={() => setCurrentPage("home")}
            />
          )}

          {/* Video View */}
          {currentPage === "video" && selectedSeries && (
            <VideoDetailsPage
              series={selectedSeries}
              onBack={() => navigateTo("home")}
            />
          )}

          {/* Audio View */}
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
