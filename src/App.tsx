import Navbar from "./Navbar";
import Hero from "./Hero";
import ContinueWatching from "./ContinueWatching";
import Sidebar from "./Sidebar"; // 1. Import Sidebar

function App() {
  return (
    <div className="min-h-screen bg-app-bg">
      <Sidebar /> {/* 2. Place Sidebar */}
      
      {/* 3. Add 'pl-20' (Padding Left) to push the content away from the sidebar */}
      <div className="pl-20">
        <Navbar />
        <Hero />
        <ContinueWatching />
      </div>
    </div>
  );
}

export default App;