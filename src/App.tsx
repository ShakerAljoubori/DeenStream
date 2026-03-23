import Navbar from "./navbar";
import Hero from "./Hero";
import ContinueWatching from "./ContinueWatching"; // Import the new section

function App() {
  return (
    <div className="min-h-screen bg-app-bg pb-20">
      <Navbar />
      <Hero />
      <ContinueWatching /> {/* Drop the cards here */}
    </div>
  );
}

export default App;
