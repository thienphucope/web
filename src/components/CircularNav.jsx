import { useState, useEffect } from "react";
import Draggable from "react-draggable";

function CircularNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPolaroids, setSelectedPolaroids] = useState({});
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // Define categories with icons and colors
  const categories = [
    { id: "work", name: "Công việc", icon: "💼", color: "bg-blue-500", content: "Lịch trình công việc và nhiệm vụ quan trọng." },
    { id: "personal", name: "Cá nhân", icon: "👤", color: "bg-purple-500", content: "Ghi chú cá nhân và mục tiêu." },
    { id: "study", name: "Học tập", icon: "📚", color: "bg-green-500", content: "Danh sách bài tập và lịch học." },
    { id: "entertainment", name: "Vui chơi", icon: "🎮", color: "bg-yellow-500", content: "Sự kiện và hoạt động giải trí." },
    { id: "health", name: "Sức khỏe", icon: "💪", color: "bg-red-500", content: "Lịch tập luyện và chế độ ăn uống." },
    { id: "finance", name: "Tài chính", icon: "💰", color: "bg-emerald-500", content: "Theo dõi chi tiêu và ngân sách." },
  ];
  
  // Handle key press to toggle menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Tab" || e.key === "q" || e.key === "Q") {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  
  // Close wheel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isOpen && !e.target.closest(".menu-wheel") && !e.target.closest(".menu-button")) {
        setIsOpen(false);
      }
    };
    
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  // Handle option selection
  const handleSelectCategory = (category) => {
    setSelectedPolaroids(prev => ({
      ...prev,
      [category.id]: {
        visible: true,
        position: { x: Math.random() * 200, y: Math.random() * 200 },
        category
      }
    }));
    setIsOpen(false);
  };
  
  // Toggle polaroid visibility
  const togglePolaroid = (categoryId) => {
    setSelectedPolaroids(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        visible: !prev[categoryId]?.visible
      }
    }));
  };
  
  // Close a specific polaroid
  const closePolaroid = (categoryId) => {
    setSelectedPolaroids(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        visible: false
      }
    }));
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Menu button */}
      <div className="fixed bottom-8 right-8 pointer-events-auto">
        <button
          className="menu-button w-16 h-16 bg-gray-800 rounded-full shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-700 transition-colors"
          onClick={() => setIsOpen(prev => !prev)}
        >
          <span className="text-white text-2xl">{isOpen ? "✕" : "☰"}</span>
        </button>
      </div>
      
      {/* Radial menu - FPS style */}
      {isOpen && (
        <div className="menu-wheel fixed inset-0 flex items-center justify-center pointer-events-auto">
          {/* Semi-transparent overlay */}
          <div className="fixed inset-0 bg-black bg-opacity-30"></div>
          
          {/* Menu container - perfectly centered */}
          <div className="relative w-80 h-80">
            {/* Center indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gray-800 bg-opacity-80 border-2 border-white flex items-center justify-center z-20">
              <span className="text-white text-sm">
                {hoveredCategory ? hoveredCategory.name : "Menu"}
              </span>
            </div>
            
            {/* Menu options in a circle */}
            {categories.map((category, index) => {
              // Calculate angle based on position in array
              // Start from the top (270 degrees or -90 degrees) for better visual alignment
              const angleInDegrees = (index * (360 / categories.length)) - 90;
              const angleInRadians = (angleInDegrees * Math.PI) / 180;
              
              // Calculate position using trig functions
              // We use a fixed radius of 120px
              const radius = 120;
              const x = radius * Math.cos(angleInRadians);
              const y = radius * Math.sin(angleInRadians);
              
              return (
                <div
                  key={category.id}
                  className={`absolute w-16 h-16 ${category.color} text-white rounded-full flex flex-col items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform`}
                  style={{ 
                    transform: `translate(calc(50% + ${x}px), calc(50% + ${y}px)) translate(-50%, -50%)`,
                    zIndex: hoveredCategory?.id === category.id ? 10 : 5
                  }}
                  onClick={() => handleSelectCategory(category)}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <span className="text-xs mt-1">{category.name}</span>
                </div>
              );
            })}
            
            {/* Selection indicator - line connecting center to hovered option */}
            {hoveredCategory && (
              <div
                className="absolute top-1/2 left-1/2 h-0.5 bg-white bg-opacity-70 origin-left z-10"
                style={{
                  width: "120px",
                  transform: `rotate(${(categories.findIndex(c => c.id === hoveredCategory.id) * (360 / categories.length)) - 90}deg)`,
                }}
              ></div>
            )}
          </div>
        </div>
      )}
      
      {/* Polaroid displays */}
      {Object.entries(selectedPolaroids).map(([id, { visible, position, category }]) => 
        visible && (
          <Draggable
            key={id}
            defaultPosition={position}
            handle=".polaroid-header"
          >
            <div className="absolute pointer-events-auto bg-white rounded-md shadow-xl w-64 overflow-hidden transform rotate-1">
              {/* Polaroid header */}
              <div className={`polaroid-header ${category.color} px-3 py-2 text-white cursor-move flex justify-between items-center`}>
                <div className="flex items-center">
                  <span className="text-xl mr-2">{category.icon}</span>
                  <h3 className="font-medium">{category.name}</h3>
                </div>
                <button 
                  className="text-white hover:text-red-200 transition-colors" 
                  onClick={() => closePolaroid(id)}
                >
                  ✕
                </button>
              </div>
              
              {/* Polaroid content */}
              <div className="p-4 bg-gray-50">
                <p className="text-gray-700">{category.content}</p>
                {/* Additional content specific to each category could go here */}
              </div>
              
              {/* Polaroid footer */}
              <div className="bg-white px-3 py-2 border-t border-gray-200 flex justify-center">
                <div className="w-8 h-1 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </Draggable>
        )
      )}
      
      {/* Quick access buttons for opened polaroids */}
      <div className="fixed bottom-8 left-8 flex flex-col gap-2 pointer-events-auto">
        {Object.entries(selectedPolaroids).map(([id, { category, visible }]) => (
          <button
            key={id}
            className={`w-12 h-12 ${category.color} rounded-full flex items-center justify-center shadow-md ${visible ? 'opacity-100' : 'opacity-50'}`}
            onClick={() => togglePolaroid(id)}
            title={`${visible ? 'Hide' : 'Show'} ${category.name}`}
          >
            <span className="text-xl text-white">{category.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default CircularNav;