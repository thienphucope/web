import { useState, useEffect } from "react";
import Upbar from "./components/Upbar";

function App() {
  // Danh sách các ID video
  const videoIds = [
    "305Uc8i5RJM",
    "-5E67EK6qfA",
    "zHjAZhw_3no",
    "acAqLYmCyFw",
    "N-xJQfCYBLY",
    "hAEfx62KnwQ",
    "UktJEXODnK0",
    "xVcRJRxDWEM",
    "T9DiPQO_k",
    "2lxJiz3gCis",
    "Ysot4dDNCPc",
    "2rn3IEcN3w4",
  ];

  // State để quản lý video hiện tại
  const [currentVideoId, setCurrentVideoId] = useState(videoIds[0]);

  // Hàm chọn video ngẫu nhiên
  const shuffleVideo = () => {
    const randomIndex = Math.floor(Math.random() * videoIds.length);
    setCurrentVideoId(videoIds[randomIndex]);
  };

  // Chạy shuffle lần đầu khi component mount và mỗi khi video thay đổi
  useEffect(() => {
    shuffleVideo(); // Shuffle lần đầu khi load
  }, []);

  // Tạo URL cho iframe dựa trên video hiện tại
  const videoUrl = `https://www.youtube.com/embed/${currentVideoId}?autoplay=1&mute=1&loop=0&controls=0&showinfo=0&rel=0`;

  return (
    <div className="bg-gray-200 relative font-sans h-screen overflow-hidden">
      {/* Video Background */}
      <div className="fixed top-0 left-0 w-full h-full z-0 overflow-hidden bg-black">
        <iframe
          src={videoUrl}
          className="absolute min-w-[1920px] h-[1080px]"
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
          onLoad={() => {
            // Tự động shuffle khi video kết thúc (dùng timeout giả lập)
            setTimeout(shuffleVideo, 30000); // Giả sử mỗi video dài 30 giây, thay đổi thời gian nếu cần
          }}
        ></iframe>
        <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
      </div>

      {/* Upbar */}
      <Upbar />
    </div>
  );
}

export default App;