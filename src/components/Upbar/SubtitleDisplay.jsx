const SubtitleDisplay = ({ showSubtitle, subtitleText, isFadingOut }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-30">
      <div
        className="text-white text-2xl font-handwritten cursor-default select-none max-w-[60%] text-center"
        style={{
          animation: isFadingOut ? "fadeOut 1s forwards" : "fadeIn 0.5s forwards",
        }}
      >
        {subtitleText}
      </div>
    </div>
  );
};

export default SubtitleDisplay;