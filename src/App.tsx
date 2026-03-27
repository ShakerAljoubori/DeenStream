import { useState } from "react";
import Navbar from "./Navbar";
import Hero from "./Hero";
import ContinueWatching from "./ContinueWatching";
import Sidebar from "./Sidebar";
import VideoDetailsPage from "./VideoDetailsPage";
import { allSeries } from "./data"; 
import type { Series } from "./data"; 

function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "video">("home");
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);

  const handleOpenVideo = (seriesId: string) => {
    const series = allSeries.find(s => s.id === seriesId);
    if (series) {
      setSelectedSeries(series);
      setCurrentPage("video");
    }
  };

  return (
    <div className="min-h-screen bg-app-bg">
      <Sidebar />
      
      <div className="pl-20">
        <Navbar />

        {currentPage === "home" ? (
          <>
            {/* Added onPlay to fix the red underline */}
            <Hero onPlay={handleOpenVideo} />
            
            {/* Updated ID to "tawheed-01" to match your data.ts */}
            <ContinueWatching onSelectVideo={() => handleOpenVideo("tawheed-01")} />
          </>
        ) : (
          selectedSeries && (
            <VideoDetailsPage 
              series={selectedSeries} 
              onBack={() => {
                setCurrentPage("home");
                setSelectedSeries(null);
              }} 
            />
          )
        )}
      </div>
    </div>
  );
}

export default App;