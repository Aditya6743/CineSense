"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef, useState, ReactNode } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  magneticStrength?: number;
}

export default function MagneticButton({
  children,
  className = "",
  onClick,
  magneticStrength = 0.2
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Spring physics for the magnetic pull
  const smoothX = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const smoothY = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    
    // Calculate distance from center
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    x.set((clientX - centerX) * magneticStrength);
    y.set((clientY - centerY) * magneticStrength);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ x: smoothX, y: smoothY }}
      className={`relative flex items-center justify-center overflow-hidden transition-colors cursor-pointer ${className}`}
      data-magnetic="true" // Integrates with our custom cursor!
    >
      {/* Liquid hover background effect */}
      <motion.div
        className="absolute inset-0 z-0 bg-white/10 rounded-[inherit]"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ 
          scale: isHovered ? 1.5 : 0, 
          opacity: isHovered ? 1 : 0 
        }}
        transition={{ duration: 0.4, ease: "circOut" }}
      />
      <span className="relative z-10 w-full h-full flex items-center justify-center">{children}</span>
    </motion.div>
  );
}
