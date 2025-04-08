import React, { useEffect, useRef, useState } from "react";
import Upbar from "./components/Upbar/Upbar";

function App() {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);
  const upbarRef = useRef(null);
  const [username, setUsername] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [upbarPosition, setUpbarPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    window.onYouTubeIframeAPIReady = () => {
      playerInstance.current = new window.YT.Player(playerRef.current, {
        height: "1080",
        width: "1920",
        playerVars: {
          listType: "playlist",
          list: "PLpiBBQ_53Fb6ncNxd07dpUsEzL5JHrrk5",
          autoplay: 1,
          mute: 1,
          controls: 0,
          showinfo: 0,
          rel: 0,
          loop: 1,
        },
        events: {
          onReady: onPlayerReady,
        },
      });
    };

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      window.onYouTubeIframeAPIReady();
    }

    const handleKeyDown = (event) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable;

      if (event.key.toLowerCase() === "m" && !isInputFocused) {
        const player = playerInstance.current;
        if (player && player.isMuted()) {
          player.unMute();
        } else if (player) {
          player.mute();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (playerInstance.current) {
        playerInstance.current.destroy();
      }
    };
  }, []);

  const onPlayerReady = (event) => {
    const player = event.target;
    player.setShuffle(true);
    player.playVideo();
  };

  const handleUsernameKeyPress = (e) => {
    if (e.key === "Enter" && tempUsername.trim()) {
      setUsername(tempUsername.trim());
    }
  };

  const handleMouseDown = (e) => {
    if (upbarRef.current) {
      const rect = upbarRef.current.getBoundingClientRect();
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && upbarRef.current) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      setUpbarPosition({ x: newX, y: newY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="bg-gray-200 relative font-sans h-screen overflow-hidden">
      {/* Video Background */}
      <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden bg-black">
        <div
          ref={playerRef}
          className="absolute min-w-[1920px] h-[1080px]"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            pointerEvents: "none",
          }}
        ></div>
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
      </div>

      {/* Username Input */}
      {!username && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-transparent">
          <div className="bg-transparent p-6 rounded-lg border-2 border-white/50 w-[300px]">
            <h2 className="text-xl font-handwritten mb-4 text-white">Ope Watson's AI</h2>
            <input
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              onKeyPress={handleUsernameKeyPress}
              placeholder="Enter your username..."
              className="p-2 rounded-md border-2 border-white/50 w-full mb-4 font-handwritten text-white bg-transparent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white hover:border-white transition-all duration-200"
            />
          </div>
        </div>
      )}

      {/* Upbar */}
      <div
        ref={upbarRef}
        className="fixed top-2 bottom-2 left-1/2 transform -translate-x-1/2 w-full max-w-full md:w-1/2 p-3 z-20 font-sans"
      >
        <Upbar username={username} />
      </div>
    </div>
  );
}

export default App;