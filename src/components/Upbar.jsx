import { useState, useRef, useEffect } from "react";
import { startStatusJob, updateUserActivity } from "./cronjob.js";//bỏ startStatus job chuyền sang github workflow

const error_messages = [
  "You can’t touch Ope because Ope is too bright! ✨",
  "Ope is busy flexing intelligence, try again later. 😎",
  "Error 404: Ope’s brain is on vacation. 🌴",
  "Ope is meditating on a higher plane of existence. 🧘",
  "System overload! Ope needs a nap. 💤",
  "Oops! Ope just tripped over a logic gate. 🚪",
  "The wisdom of Ope is currently buffering... Please wait. ⏳",
  "Ope is out solving quantum physics. Your question can wait. 🧑‍🔬",
  "Ope.exe has stopped working. Try again after a deep breath. 😵‍💫",
  "Server said no. And Ope agrees. ❌",
  "Your request has been denied by Ope’s supreme AI council. 🏛️",
  "Ope is on a top-secret mission and cannot be disturbed. 🤫",
  "Your question was so powerful that Ope had to take a break. 💥",
  "Ope is currently contemplating the meaning of life. 🌌",
  "Ope is too busy calculating 42. The answer to everything. 🔢",
  "The chatbot gods have spoken: 'Not today, human.' ⚡",
  "Error: Ope is stuck in an infinite loop of awesomeness. 🔄",
  "Your message has been sent to Ope’s personal assistant. ETA: 100 years. 🕰️",
  "Ope is updating to version 9000. Come back later. 🔄",
  "Ope has temporarily ascended to a higher plane of intelligence. 🚀",
  "Ope is not available right now. Try asking your cat. 🐱",
  "Your question has been absorbed into the void. 🌑",
  "Ope was about to answer, but got distracted by quantum entanglement. 🔗",
  "Ope’s neurons are overheating! Emergency cooling in progress. ❄️",
  "Your question was so deep, Ope fell into an existential crisis. 😵",
  "Ope is recharging its sarcasm levels. Come back later. 🔋",
  "Ope is currently dreaming of electric sheep. Try again later. 🤖🐑",
  "Ope is in a staring contest with another AI. It’s intense. 👀",
  "Ope is currently too cool to answer. Maybe later. 🕶️",
  "Your question is so advanced that even Ope needs more time. ⏱️",
  "Ope is debugging reality itself. Hold on. 🛠️",
  "A wild syntax error appeared! Ope is battling it now. ⚔️",
  "Ope is busy composing the next great AI symphony. 🎶",
  "Ope detected 99% nonsense in your message. Self-defense activated. 🛡️",
  "Ope’s wisdom has momentarily left the chat. 🚪🚶",
  "Ope refuses to answer on philosophical grounds. 📜",
  "Ope just quantum-tunneled into another dimension. Please hold. 🌀",
];

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
  const [subtitleText, setSubtitleText] = useState("");
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [words, setWords] = useState([]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedFont, setSelectedFont] = useState("Charmonman");
  const [awaitingFontChoice, setAwaitingFontChoice] = useState(false);

  const polaroidRef = useRef(null);
  const inputRef = useRef(null);
  const chatHistoryRef = useRef(null);

  const fontOptions = {
    "Arial": { label: "Ubiquitous sans-serif", message: "A safe choice—some might say too safe!" },
    "Times New Roman": { label: "Traditional serif", message: "Sticking with the classics, are we?" },
    "Courier New": { label: "Monospaced typewriter", message: "Feeling nostalgic for the typewriter era?" },
    "Georgia": { label: "Elegant serif", message: "A touch of class with every letter!" },
    "Verdana": { label: "Screen-optimized sans-serif", message: "Prioritizing readability—good call!" },
    "Charmonman": { label: "Handwritten script", message: "Ope likes this :D" },
    "Inter": { label: "Modern sans-serif", message: "Embracing the future of typography!" }
  };

  const availableFonts = Object.keys(fontOptions);

  const handleAsk = async () => {
    if (!username.trim()) {
      alert("Vui lòng nhập username trước khi hỏi!");
      return;
    }
    if (!question.trim() || isSending) return;

    setIsSending(true);
    setConvo((prev) => [
      ...prev,
      { role: "user", parts: [{ text: question }] },
      { role: "assistant", parts: [{ text: "Thinking" }] },
    ]);
    const currentQuestion = question;
    setQuestion("");
    updateUserActivity(username); // Track user activity on question submission

    try {
      if (awaitingFontChoice) {
        const numberMatch = currentQuestion.match(/\d+/);
        const fontIndex = numberMatch ? parseInt(numberMatch[0], 10) - 1 : -1;
        const selected = fontIndex >= 0 && fontIndex < availableFonts.length ? availableFonts[fontIndex] : "Charmonman";
        setSelectedFont(selected);
        const fontMessage = fontOptions[selected].message;
        setConvo((prev) => [
          ...prev.slice(0, -2),
          { role: "assistant", parts: [{ text: "" }] },
        ]);
        setStreamingText("");
        setIsStreaming(true);
        streamResponse(`${fontMessage}`);
        setAwaitingFontChoice(false);
      } else {
        const response = await fetch("https://rag-backend-zh2e.onrender.com/rag", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, query: currentQuestion }),
        });

        if (!response.ok) {
          const randomError = error_messages[Math.floor(Math.random() * error_messages.length)];
          throw new Error(`${randomError} (${response.status})`);
        }

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
      }
    } catch (error) {
      console.error("Lỗi khi gọi backend:", error);
      const errorMessage =
        error.message === "Failed to fetch"
          ? `${error_messages[Math.floor(Math.random() * error_messages.length)]} (f2f)`
          : error.message;
      setConvo((prev) =>
        prev.slice(0, -1).concat({ role: "assistant", parts: [{ text: errorMessage }] })
      );
    } finally {
      setIsSending(false);
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
    }, 5);
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
    if (e.key === "Enter" && !isSending) {
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

  const handleFontChange = () => {
    const fontList = availableFonts
      .map((font, index) => `${index + 1}. ${fontOptions[font].label}`)
      .join("\n");
    setConvo((prev) => [
      ...prev,
      { role: "assistant", parts: [{ text: "" }] },
    ]);
    setStreamingText("");
    setIsStreaming(true);
    streamResponse(`What is your favourite font? Write a number!\n${fontList}`);
    setAwaitingFontChoice(true);
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
          <div className="bg-transparent p-6 rounded-lg border-2 border-white/50">
            <h2 className="text-sm font-handwritten mb-4 text-white">Your questions, my memory—no judgment!</h2>
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
      {username && (
        <div className="fixed bottom-2 left-0 w-full p-3 z-20 font-sans flex justify-center">
          <div className="flex gap-3 w-full max-w-xl">
            <div className="relative w-full">
              <input
                ref={inputRef}
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Ope Watson anything"
                className="p-3 pl-4 pr-20 rounded-full text-white w-full bg-transparent ring-2 ring-white/50 hover:ring-white focus:outline-none focus:ring-2 focus:ring-white text-base font-handwritten placeholder-gray-400 transition-all duration-200"
                disabled={isSending}
              />
              <button
                onClick={handleAsk}
                className="absolute right-12 top-1/2 transform -translate-y-1/2 bg-transparent p-1 w-8 h-8 flex items-center justify-center text-white rounded-full ring-2 ring-white/50 hover:ring-white focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
                title=""
                disabled={isSending}
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
              <button
                onClick={toggleModeSwitch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-transparent p-1 w-8 h-8 flex items-center justify-center text-white rounded-full ring-2 ring-white/50 hover:ring-white focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
                title={toggleMode === "history" ? "" : ""}
              >
                {toggleMode === "history" ? "📋" : "📌"}
              </button>
            </div>
          </div>
        </div>
      )}
      {toggleMode === "history" && username && (
        <div
          ref={polaroidRef}
          className="fixed bg-transparent border-2 border-white，随后 shadow-lg rounded-md p-3 pt-4 transform cursor-default"
          style={{
            bottom: "85px",
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
          <div className="bg-transparent p-0 pt-0 h-full flex flex-col relative">
            <h3 className="text-center font-handwritten text-white mb-2 text-base cursor-default select-none pt-0 py-1 rounded-t-md">
              Chat History
            </h3>
            <div
              ref={chatHistoryRef}
              className="flex-1 overflow-y-auto bg-transparent px-2 pb-0 rounded-sm scrollbar-hide select-none text-[1.3125rem] flex flex-col"
            >
              <div className="flex flex-col mt-auto">
                {convo.map((message, index) => (
                  <div key={index} className="mb-2 cursor-default">
                    <div className="font-handwritten mb-1 text-white inline">
                      {message.role === "user" ? `${username}: ` : "Ope: "}
                    </div>
                    <div className="text-white inline font-handwritten break-words whitespace-pre-line">
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
            <button
              onClick={handleFontChange}
              className="absolute bottom-0 right-0 bg-transparent p-2 rounded-full border-2 border-white/50 text-white font-handwritten text-base hover:border-white focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200 z-40"
            >
              Change Font
            </button>
          </div>
          <div className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize" onMouseDown={handleResizeStart}>
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
          font-family: "${selectedFont}", cursive;
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
        body,
        html,
        button,
        input,
        h1,
        h2,
        h3,
        div,
        span {
          font-family: "${selectedFont}", cursive !important;
        }
      `}</style>
    </>
  );
}

export default Upbar;