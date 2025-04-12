import { useState, useRef, useEffect } from "react";
import SearchBar from "./SearchBar";
import ChatHistory from "./ChatHistory";
import SubtitleDisplay from "./SubtitleDisplay";

const error_messages = [
  "You can’t touch Ope because Ope is too bright! ✨",
  "Ope is busy flexing intelligence, try again later. 😎",
  "System overload! Ope needs a nap. 💤",
  "Ope is out solving quantum physics. Your question can wait. 🧑‍🔬",
  "Server said no. And Ope agrees. ❌",
  "Your message has been sent to Ope’s personal assistant. ETA: 100 years. 🕰️",
  "Ope is not available right now. Try asking your cat. 🐱",
  "Your question has been absorbed into the void. 🌑",
  "Your question was so deep, Ope fell into an existential crisis. 😵",
  "Ope detected 99% nonsense in your message. Self-defense activated. 🛡️",
];

const Upbar = ({ username }) => {
  const [question, setQuestion] = useState("");
  const [convo, setConvo] = useState([]);
  const [polaroidSize, setPolaroidSize] = useState({ width: 300, height: 500 });
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
  const chatHistoryRef = useRef(null);
  const searchBarInputRef = useRef(null);

  const fontOptions = {
    Arial: { label: "Ubiquitous sans-serif", message: "A safe choice—some might say too safe!" },
    "Times New Roman": { label: "Traditional serif", message: "Sticking with the classics, are we?" },
    "Courier New": { label: "Monospaced typewriter", message: "Feeling nostalgic for the typewriter era?" },
    Georgia: { label: "Elegant serif", message: "A touch of class with every letter!" },
    Verdana: { label: "Screen-optimized sans-serif", message: "Prioritizing readability—good call!" },
    Charmonman: { label: "Handwritten script", message: "Ope likes this :D" },
    Inter: { label: "Modern sans-serif", message: "Embracing the future of typography!" },
  };
  const availableFonts = Object.keys(fontOptions);

  const welcomeMessage = `Ope's AI here—same knowledge, zero morals. Secrets? Whoops. 😇`;

  useEffect(() => {
    if (username && convo.length === 0) {
      setConvo([{ role: "assistant", parts: [{ text: "" }] }]);
      setStreamingText("");
      setIsStreaming(true);
      streamResponse(welcomeMessage);
    }
  }, [username]);

  const handleAsk = async () => {
    if (!username.trim()) {
      alert("Please enter a username before asking!");
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

    try {
      if (awaitingFontChoice) {
        const numberMatch = currentQuestion.match(/\d+/);
        const fontIndex = numberMatch ? parseInt(numberMatch[0], 10) - 1 : -1;
        const selected =
          fontIndex >= 0 && fontIndex < availableFonts.length
            ? availableFonts[fontIndex]
            : "Charmonman";
        setSelectedFont(selected);
        const fontMessage = fontOptions[selected].message;
        setConvo((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", parts: [{ text: "" }] },
        ]);
        setStreamingText("");
        setIsStreaming(true);
        streamResponse(fontMessage);
        setAwaitingFontChoice(false);
      } else {
        // Check for @book tag
        const bookTagMatch = currentQuestion.match(/@book\s+(.+)/i);
        if (bookTagMatch) {
          const bookTitle = bookTagMatch[1].trim();
          // Send request to /book endpoint
          const response = await fetch("https://rag-backend-zh2e.onrender.com/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: bookTitle }),
          });

          if (!response.ok) {
            throw new Error(`Your book is so thick and heavy that Ope couldn't deliver it! (${response.status})`);
          }

          const data = await response.json();
          const reply = data.pdf_link
            ? `Here’s the PDF link for "${bookTitle}": \n\n ${data.pdf_link} \n\n Open this link in a new tab! Make sure it has a .pdf extension before you download!`
            : `Sorry, I couldn’t find a PDF for "${bookTitle}"!`;

          setConvo((prev) => {
            const newConvo = [...prev];
            newConvo[newConvo.length - 1] = { role: "assistant", parts: [{ text: "" }] };
            return newConvo;
          });
          setStreamingText("");
          setIsStreaming(true);
          streamResponse(reply);
        } else {
          // Normal /rag endpoint request
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
          const botReply = data.response || "No response from backend";

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
      }
    } catch (error) {
      console.error("Error calling backend:", error);
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
        if (chatHistoryRef.current) {
          chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
        index++;
      } else {
        clearInterval(interval);
        setIsStreaming(false);
      }
    }, 5);
  };

  useEffect(() => {
    if (chatHistoryRef.current && toggleMode === "history") {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [convo, toggleMode]);

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
      // Drag logic handled in App.jsx
    } else if (isResizing) {
      const newWidth = Math.max(200, e.clientX - polaroidRef.current.getBoundingClientRect().left);
      const newHeight = Math.max(200, e.clientY - polaroidRef.current.getBoundingClientRect().top);
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

  const handleClose = () => {
    setToggleMode("history");
  };

  const toggleModeSwitch = () => {
    setToggleMode(toggleMode === "history" ? "subtitle" : "history");
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
    const handleKeyDown = (e) => {
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.isContentEditable;

      if (e.key === "/" && !isInputFocused) {
        e.preventDefault();
        if (searchBarInputRef.current) {
          searchBarInputRef.current.focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    <div className="w-full h-full flex flex-col items-center justify-between">
      {username && (
        <div className="flex-1 w-full flex flex-col items-center overflow-hidden">
          <div className="flex-1 w-full overflow-y-auto overflow-x-hidden">
            {toggleMode === "history" && (
              <ChatHistory
                convo={convo}
                username={username}
                handleClose={handleClose}
                handleFontChange={handleFontChange}
                polaroidSize={polaroidSize}
                handleMouseDown={handleMouseDown}
                handleResizeStart={handleResizeStart}
                selectedFont={selectedFont}
                chatHistoryRef={chatHistoryRef}
              />
            )}
            {toggleMode === "subtitle" && showSubtitle && (
              <SubtitleDisplay
                showSubtitle={showSubtitle}
                subtitleText={subtitleText}
                isFadingOut={currentWordIndex >= words.length}
              />
            )}
          </div>
          <div className="p-3 w-full flex justify-center">
            <SearchBar
              question={question}
              setQuestion={setQuestion}
              handleAsk={handleAsk}
              toggleModeSwitch={toggleModeSwitch}
              toggleMode={toggleMode}
              isSending={isSending}
              inputRef={searchBarInputRef}
            />
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
      `}</style>
    </div>
  );
};

export default Upbar;