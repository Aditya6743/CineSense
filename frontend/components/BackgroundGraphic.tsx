"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export default function BackgroundGraphic() {
  const { scrollY, scrollYProgress } = useScroll();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fade in after scrolling past hero section (approx 600px)
  const masterOpacity = useTransform(scrollY, [0, 600, 1000], [0, 0, 0.4]);

  // Parallax calculations
  const xLeft = useTransform(scrollYProgress, [0, 1], ["10%", "-50%"]);
  const xRight = useTransform(scrollYProgress, [0, 1], ["-50%", "10%"]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 90]);

  if (!isMounted) return null;

  return (
    <motion.div 
      style={{ opacity: masterOpacity }}
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden mix-blend-screen flex flex-col justify-center gap-[30vh]"
    >
      
      {/* Top Graphic - Scrolling Left */}
      <motion.div 
        style={{ x: xLeft }} 
        className="whitespace-nowrap font-black tracking-tighter"
      >
        <span 
          className="text-[15vw] text-transparent" 
          style={{ WebkitTextStroke: "2px rgba(16, 185, 129, 0.4)" }}
        >
          NEURAL DISCOVERY ENGINE • MACHINE LEARNING • 
        </span>
      </motion.div>

      {/* Massive Geometric Mesh */}
      <motion.div 
        style={{ x: xRight, rotate }} 
        className="absolute top-1/2 left-1/2 w-[150vw] h-[150vw] -translate-x-1/2 -translate-y-1/2 opacity-60"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full stroke-emerald-500/40 fill-transparent stroke-[0.2]">
          {[...Array(30)].map((_, i) => (
            <circle key={i} cx="50" cy="50" r={5 + i * 2.5} strokeDasharray={i % 2 === 0 ? "none" : `${1 + i} ${2 + i}`} />
          ))}
          <path d="M50,0 L50,100 M0,50 L100,50 M15,15 L85,85 M15,85 L85,15" strokeDasharray="1 1" />
        </svg>
      </motion.div>

      {/* Bottom Graphic - Scrolling Right */}
      <motion.div 
        style={{ x: xRight }} 
        className="whitespace-nowrap font-black tracking-tighter text-right"
      >
        <span 
          className="text-[15vw] text-transparent" 
          style={{ WebkitTextStroke: "2px rgba(6, 182, 212, 0.4)" }}
        >
          CINESENSE • CINEMATIC INTELLIGENCE • ALGORITHM
        </span>
      </motion.div>

    </motion.div>
  );
}
