import { useState, useRef, useEffect } from "react";

function Upbar() {
  const [username, setUsername] = useState("");
  const [tempUsername, setTempUsername] = useState("");
  const [question, setQuestion] = useState("");
  const [convo, setConvo] = useState([]);
  const [polaroidPosition, setPolaroidPosition] = useState({ x: 7.175, y: 7.125 });
  const [polaroidSize, setPolaroidSize] = useState({ width: 411.825, height: 341.875 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [toggleMode, setToggleMode] = useState("history");
  const polaroidRef = useRef(null);
  const inputRef = useRef(null);
  const chatHistoryRef = useRef(null);

  const [subtitleText, setSubtitleText] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [words, setWords] = useState([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  // Thêm state và logic cho font
  const [selectedFont, setSelectedFont] = useState("Charmonman"); // Font mặc định
  const [showFontMenu, setShowFontMenu] = useState(false);
  const availableFonts = [
    "Patrick Hand",
    "Arial",
    "Times New Roman",
    "Courier New",
    "Georgia",
    "Verdana",
    "Comic Sans MS",
    "Charmonman",
    "Big Caslon Medium"
  ];

  const handleAsk = async () => {
    if (!username.trim()) {
      alert("Vui lòng nhập username trước khi hỏi!");
      return;
    }
    if (!question.trim()) return;

    setConvo((prev) => [
      ...prev,
      { role: "user", parts: [{ text: question }] },
      { role: "assistant", parts: [{ text: "..." }] },
    ]);

    try {
      const response = await fetch("http://127.0.0.1:5000/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, query: question }),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = await response.json();
      const botReply = data.response || "Không có phản hồi từ backend";

      setConvo((prev) => {
        const newConvo = [...prev];
        newConvo[newConvo.length - 1] = { role: "assistant", parts: [{ text: "" }] };
        return newConvo;
      });
      setStreamingText("");
      setIsStreaming(true);
      streamResponse(botReply);

      if (toggleMode === "subtitle") startSubtitleAnimation(botReply);
      setQuestion("");
    } catch (error) {
      console.error("Lỗi khi gọi backend:", error);
      setConvo((prev) => prev.slice(0, -1).concat({ role: "assistant", parts: [{ text: `Lỗi: ${error.message}` }] }));
      setQuestion("");
    }
  };

  const streamResponse = (fullText) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= fullText.length) {
        const currentText = fullText.slice(0, index);
        setStreamingText(currentText);
        setConvo((prev) => {
          const newConvo = [...prev];
          newConvo[newConvo.length - 1] = { role: "assistant", parts: [{ text: currentText }] };
          return newConvo;
        });
        index++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 50);
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

  const handleUsernameKeyPress = (e) => {
    if (e.key === "Enter" && tempUsername.trim()) {
      setUsername(tempUsername.trim());
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
    setToggleMode("history");
  };

  const toggleModeSwitch = () => {
    setToggleMode(toggleMode === "history" ? "subtitle" : "history");
  };

  const handleUnmute = () => {
    const video = document.getElementById("background-video");
    if (video) video.muted = false;
  };

  const handleFontChange = (font) => {
    setSelectedFont(font);
    setShowFontMenu(false);
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
      {!username && (
        <div className="fixed inset-0 flex justify-center items-center z-50 bg-transparent">
          <div className="bg-transparent p-6 rounded-lg border-2 border-white">
            <h2 className="text-xl font-handwritten mb-4 text-white">Enter your username!</h2>
            <input
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              onKeyPress={handleUsernameKeyPress}
              placeholder="Username..."
              className="p-2 rounded-md border-2 border-white w-full mb-4 font-handwritten text-white bg-transparent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      )}

      {username && (
        <div className="fixed bottom-4 left-0 w-full p-3 z-20 font-sans flex justify-center">
          <div className="flex gap-3 w-full max-w-xl">
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Ask Ope Watson anything, ${username}...`}
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
            <button
              onClick={toggleModeSwitch}
              className="bg-transparent p-2 rounded-full ring-2 ring-white hover:ring-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200 text-base font-semibold min-w-[40px] text-white"
              title={toggleMode === "history" ? "Hiện lịch sử" : "Hiện subtitle"}
            >
              {toggleMode === "history" ? "📋" : "📌"}
            </button>
          </div>
        </div>
      )}

      {toggleMode === "history" && username && (
        <div
          ref={polaroidRef}
          className="fixed bg-transparent border-2 border-white shadow-lg rounded-md p-3 pt-4 transform cursor-default"
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
            <h3 className="text-center font-handwritten text-white mb-2 text-sm ring-white cursor-default select-none pt-0">
              Chat History
            </h3>
            <div
              ref={chatHistoryRef}
              className="max-h-[calc(100%-20px)] overflow-y-auto bg-transparent px-2 pb-0 rounded-sm scrollbar-hide select-none"
            >
              {convo.map((message, index) => (
                <div key={index} className="mb-2 text-sm cursor-default">
                  <div className="font-handwritten mb-1 text-white inline">
                    {message.role === "user" ? `${username}: ` : "Ope: "}
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
              <path d="M0,10 L10,0 L10,10 Z" fill="rgba(255,255,255,0.3)" />
            </svg>
          </div>
        </div>
      )}

      {showSubtitle && toggleMode === "subtitle" && username && (
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

      {username && (
        <>
          <button
            onClick={() => setShowFontMenu(!showFontMenu)}
            className="fixed bottom-4 right-4 bg-transparent p-2 rounded-full border-2 border-white text-white font-handwritten text-base hover:border-blue-400 transition-all duration-200 z-40"
          >
            Change Font
          </button>

          {showFontMenu && (
            <div className="fixed bottom-12 right-4 bg-transparent p-4 rounded-lg border-2 border-white z-50">
              <h3 className="text-lg font-handwritten mb-2 text-white">Select a font:</h3>
              <div className="flex flex-col gap-2">
                {availableFonts.map((font) => (
                  <button
                    key={font}
                    onClick={() => handleFontChange(font)}
                    className="p-2 text-white font-handwritten bg-transparent hover:bg-blue-400/20 rounded-md transition-all duration-200 text-left"
                    style={{ fontFamily: font }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

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
          font-family: "${selectedFont}", cursive; /* Áp dụng font động */
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
        /* Áp dụng font cho toàn bộ trang */
        body, html, button, input, h1, h2, h3, div, span {
          font-family: "${selectedFont}", cursive !important;
        }
      `}</style>
    </>
  );
}

export default Upbar;