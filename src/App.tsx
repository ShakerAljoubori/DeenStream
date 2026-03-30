import { useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import ContinueWatching from "./ContinueWatching";
import Sidebar from "./Sidebar";
import VideoDetailsPage from "./VideoDetailsPage";
import AudioBooksPage from "./AudioBooksPage";
import AudioPlayerPage from "./AudioPlayerPage";
import AudioStickyPlayer from "./AudioStickyPlayer"; // Imported
import { allSeries } from "./data"; 
import type { Series, AudioBook } from "./data"; 

function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "video" | "audiobooks">("home");
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [selectedAudioBook, setSelectedAudioBook] = useState<AudioBook | null>(null);

  const handleOpenVideo = (seriesId: string) => {
    const series = allSeries.find(s => s.id === seriesId);
    if (series) {
      setSelectedSeries(series);
      setCurrentPage("video");
    }
  };

  return (
    <div className="min-h-screen bg-app-bg text-white relative">
      <Sidebar 
        onNavigate={(page: "home" | "audiobooks") => {
          setCurrentPage(page);
          // CRITICAL: Reset both selection states so pages don't overlap or get stuck
          setSelectedAudioBook(null); 
          setSelectedSeries(null);
        }} 
        currentPage={currentPage} 
      />
      
      <div className="pl-20">
        {/* Navbar usually stays fixed at the top */}
        <Navbar />

        <main className="pb-24"> {/* Added padding bottom so content isn't hidden behind the player */}
          {currentPage === "home" && (
            <div className="pt-4">
              <Hero onPlay={handleOpenVideo} />
              <ContinueWatching onSelectVideo={() => handleOpenVideo("tawheed-01")} />
            </div>
          )}

          {currentPage === "video" && selectedSeries && (
            <VideoDetailsPage 
              series={selectedSeries} 
              onBack={() => {
                setCurrentPage("home");
                setSelectedSeries(null);
              }} 
            />
          )}

          {currentPage === "audiobooks" && (
            !selectedAudioBook ? (
              <AudioBooksPage 
                onBack={() => setCurrentPage("home")} 
                onSelectBook={(book) => setSelectedAudioBook(book)} 
              />
            ) : (
              <AudioPlayerPage 
                book={selectedAudioBook} 
                onBack={() => setSelectedAudioBook(null)} 
              />
            )
          )}
        </main>
      </div>

      {/* Global Audio Player Bar */}
      <AudioStickyPlayer />
    </div>
  );
}

export default App;