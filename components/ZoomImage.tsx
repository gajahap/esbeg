import React, { useState } from "react";

const ZoomImage = ({ src, alt }: { src: string; alt: string }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: any) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    // Hitung posisi mouse dalam persentase (0% - 100%)
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden cursor-zoom-in"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-200 ease-out ${
          isHovering ? "scale-[2]" : "scale-100"
        }`}
        style={{
          transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
        }}
      />
    </div>
  );
};

export default ZoomImage;