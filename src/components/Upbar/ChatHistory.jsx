import { useRef } from "react";

const ChatHistory = ({
  convo,
  username,
  handleClose,
  handleFontChange,
  handleFindBook,
  polaroidSize,
  handleMouseDown,
  handleResizeStart,
  selectedFont,
  chatHistoryRef,
}) => {
  const polaroidRef = useRef(null);

  return (
    <div
      ref={polaroidRef}
      className="bg-transparent border-2 border-white shadow-lg rounded-md p-3 pt-4 transform cursor-default w-full h-full"
      style={{
        maxWidth: "100%",
        minWidth: "320px", // Đảm bảo container đủ rộng
      }}
      onMouseDown={handleMouseDown}
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
          className="flex-1 overflow-y-auto overflow-x-hidden bg-transparent px-2 pb-0 rounded-sm scrollbar-hide select-text text-[1.125rem] flex flex-col"
        >
          <div className="flex flex-col mt-auto">
            {convo.map((message, index) => (
              <div key={index} className="mb-2 cursor-default text-justify px-1">
                <div className="font-handwritten mb-1 text-white inline">
                  {message.role === "user" ? `${username.toUpperCase()}: ` : "OPE: "}
                </div>
                <div className="text-white inline font-handwritten break-words whitespace-pre-line">
                  {message.parts[0].text}
                  {message.role === "assistant" && (
                    <>
                      <br />
                    </>
                  )}
                </div>
                <br />
              </div>
            ))}
          </div>
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
          <path d="M0,10 L10,0 L10,10 Z" fill="rgba(255,255,255,0.3)" />
        </svg>
      </div>
    </div>
  );
};

export default ChatHistory;
