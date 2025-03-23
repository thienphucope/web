import { useState, useRef, useEffect } from "react";

function Upbar() {
  const [question, setQuestion] = useState("");
  const [convo, setConvo] = useState([
    {
      role: "user",
      parts: [{ text: "You're Ope Watson. answer short, humanlike and informative, not in markdown" }],
    },
  ]);
  const [polaroidPosition, setPolaroidPosition] = useState({ x: 434.175, y: 64.125 });
  const [polaroidSize, setPolaroidSize] = useState({ width: 619.825, height: 203.875 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showPolaroid, setShowPolaroid] = useState(true);
  const polaroidRef = useRef(null);
  const inputRef = useRef(null); // Thêm ref cho input

  const [subtitleText, setSubtitleText] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [words, setWords] = useState([]);

  const handleAsk = async () => {
    if (!question.trim()) return;

    try {
      const apiKey = "AIzaSyA_RRQrKiS1GaLS3ryTh8W7PBMqbzuVO98";
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
      const updatedConvo = [...convo, { role: "user", parts: [{ text: question }] }];

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: updatedConvo }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const data = await response.json();
      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi từ API";

      setConvo([...updatedConvo, { role: "assistant", parts: [{ text: botReply }] }]);
      startSubtitleAnimation(botReply);
      setQuestion("");
    } catch (error) {
      console.error("Lỗi API:", error);
      setConvo([...convo, { role: "assistant", parts: [{ text: `Lỗi: ${error.message}` }] }]);
      setQuestion("");
    }
  };

  const startSubtitleAnimation = (text) => {
    let sentences = text.split(/(?<=[.!?])\s+/);
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

  // Thêm sự kiện khi nhấn "/"
  useEffect(() => {
    const handleSlashPress = (e) => {
      if (e.key === "/") {
        e.preventDefault(); // Ngăn hành vi mặc định của phím "/"
        inputRef.current.focus(); // Focus vào ô input
      }
    };

    window.addEventListener("keydown", handleSlashPress);
    return () => {
      window.removeEventListener("keydown", handleSlashPress);
    };
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
    setShowPolaroid(false);
  };

  const togglePolaroid = () => {
    setShowPolaroid(!showPolaroid);
  };

  const handleUnmute = () => {
    const video = document.getElementById("background-video");
    if (video) {
      video.muted = false;
    }
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing]);

  return (
    <>
      <video
        autoPlay
        loop
        muted
        id="background-video"
        className="fixed top-0 left-0 w-full h-full object-cover z-10"
      >
        <source src="/path/to/your/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="fixed top-0 left-0 w-full p-3 z-20 font-sans mt-2">
        <div className="flex items-center justify-center">
          <div className="flex gap-2 w-full max-w-2xl">
            <input
              ref={inputRef} // Gán ref vào input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="p-2 rounded-full text-white w-full bg-transparent hover:ring-2 hover:ring-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base font-handwritten placeholder-gray-400 transition-all duration-200"
            />
            <button
              onClick={togglePolaroid}
              className="bg-transparent p-2 rounded-full hover:ring-2 hover:ring-gray-400 transition-colors text-base font-semibold min-w-[40px] text-white"
              title={showPolaroid ? "Ẩn lịch sử" : "Hiện lịch sử"}
            >
              {showPolaroid ? "📌" : "📋"}
            </button>
          </div>
        </div>

        {showSubtitle && (
          <div className="fixed inset-0 flex justify-center items-center z-30 pointer-events-none">
            <div
              className="text-white text-2xl font-handwritten animate-fadeIn cursor-default select-none max-w-[60%] text-center"
              style={{ animation: currentWordIndex >= words.length ? "fadeOut 1s forwards" : "fadeIn 0.5s forwards" }}
            >
              {subtitleText}
            </div>
          </div>
        )}

        {showPolaroid && (
          <div
            ref={polaroidRef}
            className="absolute bg-transparent border-2 border-gray-300 shadow-lg rounded-md p-3 pt-4 transform cursor-default"
            style={{
              left: `${polaroidPosition.x}px`,
              top: `${polaroidPosition.y}px`,
              width: `${polaroidSize.width}px`,
              height: `${polaroidSize.height}px`,
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
            }}
            onMouseDown={handleMouseDown}
            onClick={handleUnmute}
          >
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors z-10 bg-transparent"
              onClick={handleClose}
            >
              ✕
            </button>

            <div className="bg-transparent p-2 mb-2 rounded-sm h-[calc(100%-30px)]">
              <h3 className="text-center font-medium text-white mb-2 text-sm cursor-default select-none">Chat History</h3>
              <div className="max-h-[calc(100%-30px)] overflow-y-auto bg-transparent p-2 rounded-sm scrollbar-hide select-none">
                {convo.slice(1).map((message, index) => (
                  <div key={index} className="mb-3 text-sm cursor-default">
                    <div className="font-medium mb-1 text-white inline">
                      {message.role === "user" ? "You: " : "AI: "}
                    </div>
                    <div className="text-white inline">
                      {message.parts[0].text}
                    </div>
                    <br />
                  </div>
                ))}
              </div>
            </div>
            <div className="w-8 h-2 bg-gray-200 mx-auto opacity-0 rounded-full mt-1"></div>

            <div
              className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize"
              onMouseDown={handleResizeStart}
            >
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                className="absolute bottom-1 right-1"
              >
                <path
                  d="M0,10 L10,0 L10,10 Z"
                  fill="rgba(0,0,0,0.3)"
                />
              </svg>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s forwards;
        }

        .font-handwritten {
          font-family: 'Patrick Hand', cursive;
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