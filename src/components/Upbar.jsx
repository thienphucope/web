import { useState, useRef, useEffect } from "react";

function Upbar() {
  const [question, setQuestion] = useState("");
  const [convo, setConvo] = useState([
    {
      role: "user",
      parts: [{ text: "You're Ope Watson. You're chaotic and friendly! Answer short, humanlike and informative, do not use asterisks, capitalize to emphasize" }],
    },
  ]);
  const [polaroidPosition, setPolaroidPosition] = useState({ x: 7.175, y: 7.125 });
  const [polaroidSize, setPolaroidSize] = useState({ width: 411.825, height: 341.875 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showPolaroid, setShowPolaroid] = useState(false);
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

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [convo]);

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

  useEffect(() => {
    const handleSlashPress = (e) => {
      if (e.key === "/") {
        e.preventDefault();
        inputRef.current.focus();
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
              ref={inputRef}
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything..."
              className="p-2 pl-4 rounded-full text-white w-full bg-transparent hover:ring-2 hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base font-handwritten placeholder-gray-400 transition-all duration-200"
            />
            <button
              onClick={togglePolaroid}
              className="bg-transparent p-2 rounded-full hover:ring-2 hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-base font-semibold min-w-[40px] text-white"
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
              style={{
                animation: currentWordIndex >= words.length ? "fadeOut 1s forwards" : "fadeIn 0.5s forwards",
              }}
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
            <div className="bg-transparent p-0 pt-0 h-[calc(100%-0px)]">
              <h3 className="text-center font-handwritten text-white mb-2 text-sm ring-yellow-400 cursor-default select-none pt-0">
                Chat History
              </h3>
              <div
                ref={chatHistoryRef}
                className="max-h-[calc(100%-20px)] overflow-y-auto bg-transparent px-2 pb-0 rounded-sm scrollbar-hide select-none"
              >
                {convo.slice(1).map((message, index) => (
                  <div key={index} className="mb-2 text-sm cursor-default">
                    <div className="font-handwritten mb-1 text-white inline">
                      {message.role === "user" ? "You: " : "AI: "}
                    </div>
                    <div className="text-white inline font-handwritten">
                      {message.parts[0].text}
                      {message.role === "assistant" && <><br /><br /></>}
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
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                className="absolute bottom-1 right-1"
              >
                <path d="M0,10 L10,0 L10,10 Z" fill="rgba(0,0,0,0.3)" />
              </svg>
            </div>
          </div>
        )}
      </div>
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