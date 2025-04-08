const FontChangeButton = ({ onClick }) => {
    return (
      <button
        onClick={onClick}
        className="bg-transparent p-2 rounded-full border-2 border-white/50 text-white font-handwritten text-base hover:border-white focus:outline-none focus:ring-2 focus:ring-white transition-all duration-200"
      >
        Change Font
      </button>
    );
  };
  
  export default FontChangeButton;