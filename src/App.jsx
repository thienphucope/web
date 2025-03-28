import React, { useEffect, useRef } from "react";
import Upbar from "./components/Upbar";

function App() {
  const playerRef = useRef(null);
  const playerInstance = useRef(null);

  useEffect(() => {
    // Hàm này sẽ được gọi khi API YouTube đã sẵn sàng
    window.onYouTubeIframeAPIReady = () => {
      playerInstance.current = new window.YT.Player(playerRef.current, {
        height: "1080",
        width: "1920",
        playerVars: {
          listType: "playlist",
          list: "PLpiBBQ_53Fb6ncNxd07dpUsEzL5JHrrk5", // Thay thế bằng ID của playlist YouTube của bạn
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

    // Tải API YouTube nếu chưa được tải
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      window.onYouTubeIframeAPIReady();
    }

    // Thêm trình nghe sự kiện bàn phím
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

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (playerInstance.current) {
        playerInstance.current.destroy();
      }
    };
  }, []);

  const onPlayerReady = (event) => {
    const player = event.target;
    player.setShuffle(true); // Bật chế độ shuffle
    player.playVideo(); // Bắt đầu phát video
  };

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

      {/* Upbar */}
      <Upbar />
    </div>
  );
}

export default App;