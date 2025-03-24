import { useState, useRef, useEffect } from "react";

function Upbar() {
  const [question, setQuestion] = useState("");
  const [convo, setConvo] = useState([]);
  const [polaroidPosition, setPolaroidPosition] = useState({ x: 7.175, y: 7.125 });
  const [polaroidSize, setPolaroidSize] = useState({ width: 411.825, height: 341.875 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [toggleMode, setToggleMode] = useState("history"); // "history" (📋) hoặc "subtitle" (📌)
  const polaroidRef = useRef(null);
  const inputRef = useRef(null);
  const chatHistoryRef = useRef(null);

  const [subtitleText, setSubtitleText] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [words, setWords] = useState([]);

  const handleAsk = async () => {
    if (!question.trim()) return;

    try {
      const response = await fetch("https://rag-backend-zh2e.onrender.com/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: question }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const botReply = data.response || "Không có phản hồi từ backend";

      setConvo(data.convo);
      if (toggleMode === "subtitle") startSubtitleAnimation(botReply); // Chỉ chạy subtitle khi ở mode 📌
      setQuestion("");
    } catch (error) {
      console.error("Lỗi khi gọi backend:", error);
      setConvo([...convo, { role: "assistant", parts: [{ text: `Lỗi: ${error.message}` }] }]);
      setQuestion("");
    }
  };

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [convo]);

  const startSubtitleAnimation = (text) => {
    const sentences = text.split(/(?<=[.!?])\s+/);
    let finalSentences = [];

    sentences.forEach((sentence) => {
      const wordCount = sentence.split(/\s+/).length;
      if (wordCount > 15) {
        const subSentences = sentence.split(/,\s*/);
        let tempSentence = "";
        subSentences.forEach((sub) => {
          const tempWordCount = (tempSentence + sub).split(/\s+/).length;
          if (tempWordCount <= 15) {
            tempSentence = tempSentence ? `${tempSentence}, ${sub}` : sub;
          } else {
            if (tempSentence) finalSentences.push(tempSentence);
            tempSentence = sub;
          }
        });
        if (tempSentence) finalSentences.push(tempSentence);
      } else {
        finalSentences.push(sentence);
      }
    });

    setWords(finalSentences);
    setCurrentWordIndex(0);
    setShowSubtitle(true);
  };

  useEffect(() => {
    if (words.length > 0 && currentWordIndex < words.length) {
      setSubtitleText(words[currentWordIndex]);
      const timer = setTimeout(() => setCurrentWordIndex(currentWordIndex + 1), 3000);
      return () => clearTimeout(timer);
    } else if (currentWordIndex >= words.length && words.length > 0) {
      const fadeTimer = setTimeout(() => {
        setShowSubtitle(false);
        setWords([]);
        setCurrentWordIndex(0);
      }, 1000);
      return () => clearTimeout(fadeTimer);
    }
  }, [words, currentWordIndex]);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleAsk();
      handleUnmute();
    }
  };

  useEffect(() => {
    const handleSlashPress = (e) => {
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current.focus();
      }
    };
    window.addEventListener("keydown", handleSlashPress);
    return () => window.removeEventListener("keydown", handleSlashPress);
  }, []);

  const handleMouseDown = (e) => {
    e.stopPropagation();
    if (polaroidRef.current && !isResizing) {
      const rect = polaroidRef.current.getBoundingClientRect();
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPolaroidPosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    } else if (isResizing) {
      const newWidth = Math.max(200, e.clientX - polaroidPosition.x);
      const newHeight = Math.max(200, e.clientY - polaroidPosition.y);
      setPolaroidSize({ width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setToggleMode("history"); // Reset về history khi đóng
  };

  const toggleModeSwitch = () => {
    setToggleMode(toggleMode === "history" ? "subtitle" : "history");
  };

  const handleUnmute = () => {
    const video = document.getElementById("background-video");
    if (video) video.muted = false;
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing]);

  return (
    <>
      {/* Thanh chat AI ở bottom middle */}
      <div className="fixed bottom-4 left-0 w-full p-3 z-20 font-sans flex justify-center">
        <div className="flex gap-3 w-full max-w-xl">
          {/* Thanh input với nút gửi bên trong */}
          <div className="relative w-full">
            <input
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Ope Watson anything..."
              className="p-2 pl-4 pr-10 rounded-full text-white w-full bg-transparent ring-2 ring-white hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base font-handwritten placeholder-gray-400 transition-all duration-200"
            />
            <button
              onClick={handleAsk}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent p-1 text-white transition-all duration-200"
              title="Gửi câu hỏi"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </div>
          {/* Nút toggle history/subtitle */}
          <button
            onClick={toggleModeSwitch}
            className="bg-transparent p-2 rounded-full ring-2 ring-white hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-base font-semibold min-w-[40px] text-white"
            title={toggleMode === "history" ? "Hiện lịch sử" : "Hiện subtitle"}
          >
            {toggleMode === "history" ? "📋" : "📌"}
          </button>
        </div>
      </div>

      {/* History chat (khi toggleMode là "history") */}
      {toggleMode === "history" && (
        <div
          ref={polaroidRef}
          className="fixed bg-transparent border-2 border-gray-300 shadow-lg rounded-md p-3 pt-4 transform cursor-default"
          style={{
            bottom: "80px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100%",
            maxWidth: "42rem",
            height: "calc(100vh - 100px)",
            boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          }}
          onMouseDown={handleMouseDown}
          onClick={handleUnmute}
        >
          <button
            className="absolute top-[-2px] right-[-2px] text-gray-400 hover:text-white transition-colors z-10 bg-transparent border-0 outline-none"
            onClick={handleClose}
          >
            ✕
          </button>
          <div className="bg-transparent p-0 pt-0 h-full">
            <h3 className="text-center font-handwritten text-white mb-2 text-sm ring-yellow-400 cursor-default select-none pt-0">
              Chat History
            </h3>
            <div
              ref={chatHistoryRef}
              className="max-h-[calc(100%-20px)] overflow-y-auto bg-transparent px-2 pb-0 rounded-sm scrollbar-hide select-none"
            >
              {convo.map((message, index) => (
                <div key={index} className="mb-2 text-sm cursor-default">
                  <div className="font-handwritten mb-1 text-white inline">
                    {message.role === "user" ? "You: " : "AI: "}
                  </div>
                  <div className="text-white inline font-handwritten">
                    {message.parts[0].text}
                    {message.role === "assistant" && (
                      <>
                        <br />
                        <br />
                      </>
                    )}
                  </div>
                  <br />
                </div>
              ))}
            </div>
          </div>
          <div
            className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize"
            onMouseDown={handleResizeStart}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" className="absolute bottom-1 right-1">
              <path d="M0,10 L10,0 L10,10 Z" fill="rgba(0,0,0,0.3)" />
            </svg>
          </div>
        </div>
      )}

      {/* Subtitle (khi toggleMode là "subtitle") */}
      {showSubtitle && toggleMode === "subtitle" && (
        <div className="fixed inset-0 flex justify-center items-center z-30 pointer-events-none">
          <div
            className="text-white text-2xl font-handwritten animate-fadeIn cursor-default select-none max-w-[60%] text-center"
            style={{
              animation: currentWordIndex >= words.length ? "fadeOut 1s forwards" : "fadeIn 0.5s forwards",
            }}
          >
            {subtitleText}
          </div>
        </div>
      )}

      {/* CSS styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s forwards;
        }
        .font-handwritten {
          font-family: "Patrick Hand", cursive;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .select-none {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
    </>
  );
}

export default Upbar;