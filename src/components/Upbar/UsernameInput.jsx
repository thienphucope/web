import { useState } from "react";

const UsernameInput = ({ onUsernameSubmit }) => {
  const [tempUsername, setTempUsername] = useState("");

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && tempUsername.trim()) {
      onUsernameSubmit(tempUsername.trim());
    }
  };

  return (
    <div className="bg-transparent p-6 rounded-lg border-2 border-white/50 w-[300px]">
      <h2 className="text-xl font-handwritten mb-4 text-white">Ope Watson's AI</h2>
      <input
        type="text"
        value={tempUsername}
        onChange={(e) => setTempUsername(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Enter your username..."
        className="p-2 rounded-md border-2 border-white/50 w-full mb-4 font-handwritten text-white bg-transparent placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white hover:border-white transition-all duration-200"
      />
    </div>
  );
};

export default UsernameInput;