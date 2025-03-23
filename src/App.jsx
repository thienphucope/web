import { useState } from "react";
import Upbar from "./components/Upbar";
import CircularNav from "./components/CircularNav";

function App() {
  return (
    <div className="bg-gray-200 relative font-sans h-screen overflow-hidden">
      {/* Video Background */}
      <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden bg-black">
        <iframe
          src="https://www.youtube.com/embed/305Uc8i5RJM?autoplay=1&mute=1&loop=1&playlist=305Uc8i5RJM&controls=0&showinfo=0&rel=0"
          className="absolute w-[140%] h-[105%]" 
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
          title="Background Video"
          loading="lazy"
        ></iframe>
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
      </div>

      {/* Upbar cố định ở trên */}
      <Upbar />

      {/* Circular Navigation */}
      <CircularNav />
    </div>
  );
}

export default App;