"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useSoundDesign } from "../hooks/useSoundDesign";

export default function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false);
  const [magneticElement, setMagneticElement] = useState<HTMLElement | null>(null);
  const { playHoverTick } = useSoundDesign();
  const wasHoveringRef = useRef(false);

  // Smooth springs for cursor position
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      // If magnetically attached, pull cursor towards center of element
      if (magneticElement) {
        const rect = magneticElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        // Pull strength (0.5 means halfway between actual mouse and center)
        const pullX = (e.clientX - centerX) * 0.2;
        const pullY = (e.clientY - centerY) * 0.2;
        
        cursorX.set(centerX + pullX);
        cursorY.set(centerY + pullY);
      } else {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
      }
      
      const target = e.target as HTMLElement;
      // Check if it has data-magnetic or is clickable
      const isMagnetic = target.closest('[data-magnetic="true"]');
      let shouldHover = false;
      
      if (isMagnetic) {
        shouldHover = true;
        if (magneticElement !== isMagnetic) {
          setMagneticElement(isMagnetic as HTMLElement);
        }
      } else if (
        window.getComputedStyle(target).cursor === "pointer" ||
        target.tagName.toLowerCase() === "a" ||
        target.tagName.toLowerCase() === "button" ||
        target.closest("a") || 
        target.closest("button")
      ) {
        shouldHover = true;
        setMagneticElement(null);
      } else {
        setMagneticElement(null);
      }

      if (shouldHover && !wasHoveringRef.current) {
        playHoverTick();
      }
      wasHoveringRef.current = shouldHover;
      setIsHovering(shouldHover);
    };

    window.addEventListener("mousemove", updateMousePosition);
    return () => window.removeEventListener("mousemove", updateMousePosition);
  }, [magneticElement, cursorX, cursorY, playHoverTick]);

  // Hide default cursor
  useEffect(() => {
    document.body.style.cursor = "none";
    const style = document.createElement("style");
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);
    return () => {
      document.body.style.cursor = "auto";
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      {/* Massive Glowing Ambient Light Aura */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-0 w-[40rem] h-[40rem] rounded-full mix-blend-screen bg-[radial-gradient(circle,rgba(124,92,255,0.12)_0%,transparent_70%)]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      {/* Outer Ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[999999] rounded-full mix-blend-screen bg-[#4EA8FF]/20 backdrop-blur-md border border-[#4EA8FF]/30 shadow-[0_0_20px_rgba(78,168,255,0.2)]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          width: isHovering ? 80 : 32,
          height: isHovering ? 80 : 32,
          scale: magneticElement ? 1.2 : 1,
        }}
        transition={{ type: "spring", stiffness: 400, damping: 28, mass: 0.5 }}
      />
      {/* Inner Dot */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-[1000000] h-2 w-2 rounded-full bg-[#7C5CFF] shadow-[0_0_15px_rgba(124,92,255,1)] mix-blend-screen"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{
          scale: isHovering ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 2500, damping: 200, mass: 0.1 }}
      />
    </>
  );
}
