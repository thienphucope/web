import { useRef } from "react";

const SearchBar = ({
  question,
  setQuestion,
  handleAsk,
  toggleModeSwitch,
  toggleMode,
  isSending,
  inputRef,
}) => {
  const localInputRef = useRef(null);
  const effectiveRef = inputRef || localInputRef;

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isSending) {
      handleAsk();
    }
  };

  return (
    <div className="relative w-full">
      <input
        ref={effectiveRef}
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
      >
        {toggleMode === "history" ? "📋" : "📌"}
      </button>
    </div>
  );
};

export default SearchBar;