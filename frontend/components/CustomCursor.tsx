"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Extremely responsive spring for the inner dot to eliminate lag feel
  const springDotConfig = { damping: 40, stiffness: 1000, mass: 0.1 };
  const dotX = useSpring(cursorX, springDotConfig);
  const dotY = useSpring(cursorY, springDotConfig);

  // Smooth, slightly delayed spring for the outer ring effect
  const springRingConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(cursorX, springRingConfig);
  const smoothY = useSpring(cursorY, springRingConfig);

  // Use motion values for state to avoid ANY React re-renders on mousemove
  const dotScale = useSpring(useMotionValue(1), { damping: 20, stiffness: 300 });
  const ringSize = useSpring(useMotionValue(32), { damping: 20, stiffness: 300 });
  const ringScale = useSpring(useMotionValue(1), { damping: 20, stiffness: 300 });
  const ringBg = useMotionValue("rgba(255,255,255,0)");

  useEffect(() => {
    // Disable entirely on mobile
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    let magneticTarget: HTMLElement | null = null;

    const updateMousePosition = (e: MouseEvent) => {
      let isHovering = false;
      let shouldMagnetize = false;
      
      const target = e.target as HTMLElement;
      if (target && typeof target.closest === 'function') {
        const isMagnetic = target.closest('[data-magnetic="true"]');
        
        if (isMagnetic) {
          isHovering = true;
          shouldMagnetize = true;
          magneticTarget = isMagnetic as HTMLElement;
        } else if (
          window.getComputedStyle(target).cursor === "pointer" ||
          target.tagName?.toLowerCase() === "a" ||
          target.tagName?.toLowerCase() === "button" ||
          target.closest("a") || 
          target.closest("button")
        ) {
          isHovering = true;
          magneticTarget = null;
        } else {
          magneticTarget = null;
        }
      }

      // Handle magnetic pull
      if (shouldMagnetize && magneticTarget) {
        const rect = magneticTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const pullX = (e.clientX - centerX) * 0.2;
        const pullY = (e.clientY - centerY) * 0.2;
        cursorX.set(centerX + pullX);
        cursorY.set(centerY + pullY);
      } else {
        cursorX.set(e.clientX);
        cursorY.set(e.clientY);
      }

      // Update appearance natively via framer-motion (0 React renders!)
      if (isHovering) {
        dotScale.set(0);
        ringSize.set(80);
        ringScale.set(shouldMagnetize ? 1.2 : 1);
        ringBg.set("rgba(78,168,255,0.1)");
      } else {
        dotScale.set(1);
        ringSize.set(32);
        ringScale.set(1);
        ringBg.set("rgba(255,255,255,0)");
      }
    };

    // Use passive listener for butter smooth scrolling integration
    window.addEventListener("mousemove", updateMousePosition, { passive: true });
    
    // Hide default cursor
    document.body.style.cursor = "none";
    const style = document.createElement("style");
    style.innerHTML = `* { cursor: none !important; }`;
    document.head.appendChild(style);
    
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.body.style.cursor = "auto";
      document.head.removeChild(style);
    };
  }, [cursorX, cursorY, dotScale, ringSize, ringScale, ringBg]);

  if (typeof window !== "undefined" && window.innerWidth < 768) return null;

  return (
    <>
      {/* Massive Glowing Ambient Light Aura */}
      <motion.div
        className="hidden md:block pointer-events-none fixed top-0 left-0 z-0 w-[40rem] h-[40rem] rounded-full mix-blend-screen bg-[radial-gradient(circle,rgba(124,92,255,0.12)_0%,transparent_70%)]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      {/* Outer Ring */}
      <motion.div
        className="hidden md:block pointer-events-none fixed top-0 left-0 z-[999999] rounded-full mix-blend-screen border border-[#4EA8FF]/30 shadow-[0_0_20px_rgba(78,168,255,0.2)]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: "-50%",
          translateY: "-50%",
          width: ringSize,
          height: ringSize,
          scale: ringScale,
          backgroundColor: ringBg,
        }}
      />
      {/* Inner Dot */}
      <motion.div
        className="hidden md:block pointer-events-none fixed top-0 left-0 z-[1000000] h-2 w-2 rounded-full bg-[#7C5CFF] shadow-[0_0_15px_rgba(124,92,255,1)] mix-blend-screen"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          scale: dotScale,
        }}
      />
    </>
  );
}
