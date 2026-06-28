"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [readyToEnter, setReadyToEnter] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          setReadyToEnter(true);
          return 100;
        }
        // Accelerate loading as it gets closer
        const increment = prev > 80 ? 2 : prev > 40 ? 5 : 8;
        return Math.min(prev + increment, 100);
      });
    }, 120);

    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    if (!readyToEnter) return;
    setIsEntering(true);
    // The animation takes about 1.5 seconds to flash white and dissolve
    setTimeout(() => {
      onComplete();
    }, 1200);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && readyToEnter) {
        handleEnter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyToEnter, onComplete]);

  return (
    <AnimatePresence>
      {!isEntering ? (
        <motion.div
          key="cinematic-preloader"
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#020305] perspective-[1200px] overflow-hidden"
        >
          {/* Subtle atmospheric particles */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay pointer-events-none animate-[pulse_4s_infinite]" />

          {/* The glowing projector beam coming from behind the user */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150vw] h-[100vh] pointer-events-none mix-blend-screen opacity-30"
               style={{
                 background: 'conic-gradient(from 180deg at 50% -20%, transparent 140deg, rgba(124, 92, 255, 0.2) 160deg, rgba(78, 168, 255, 0.4) 180deg, rgba(124, 92, 255, 0.2) 200deg, transparent 220deg)'
               }}
          />

          {/* The Cinema Screen */}
          <motion.div
            className="absolute top-1/4 md:top-1/3 w-[80vw] md:w-[60vw] max-w-4xl aspect-video bg-black flex items-center justify-center overflow-hidden rounded-lg shadow-[0_0_100px_rgba(78,168,255,0.1)]"
            style={{ 
              transformOrigin: 'bottom center',
              rotateX: 10, 
            }}
            animate={{
              boxShadow: [
                "0 0 50px rgba(78, 168, 255, 0.1)",
                "0 0 150px rgba(124, 92, 255, 0.3)",
                "0 0 80px rgba(78, 168, 255, 0.2)",
              ],
              borderColor: [
                "rgba(255,255,255,0.05)",
                "rgba(255,255,255,0.2)",
                "rgba(255,255,255,0.05)",
              ]
            }}
            transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          >
            {/* Screen Content */}
            <div className="absolute inset-0 border border-white/10" />
            
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <span className="text-gray-500 font-mono text-sm md:text-base tracking-[0.5em] uppercase animate-pulse">
                  Preparing Theater
                </span>
                <div className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-300 via-white to-gray-500 tracking-tighter">
                  {progress}<span className="text-3xl md:text-5xl text-gray-600">%</span>
                </div>
              </div>
            ) : (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEnter}
                className="group relative px-8 py-4 md:px-12 md:py-5 rounded-full bg-white text-black font-black tracking-widest uppercase text-sm md:text-lg shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-all overflow-hidden flex items-center gap-3"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                <Sparkles className="w-5 h-5" />
                <span className="relative z-10">Take Your Seat</span>
              </motion.button>
            )}
            
            {/* Screen static/grain */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')] opacity-20 pointer-events-none mix-blend-overlay" />
          </motion.div>

          {/* Foreground Silhouette (Person watching) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[250px] md:w-[400px] h-[300px] md:h-[450px] z-50 pointer-events-none">
            <svg 
              viewBox="0 0 200 200" 
              className="w-full h-full" 
              style={{ filter: "drop-shadow(0px -10px 40px rgba(78, 168, 255, 0.15))" }}
            >
              {/* Chair backrest */}
              <path d="M 10 250 L 20 120 C 20 90, 40 80, 60 80 L 140 80 C 160 80, 180 90, 180 120 L 190 250 Z" fill="#010101" />
              {/* Person Shoulders/Body */}
              <path d="M 100 110 C 65 110, 45 140, 40 180 L 35 250 L 165 250 L 160 180 C 155 140, 135 110, 100 110 Z" fill="#000" />
              {/* Person Head */}
              <circle cx="100" cy="85" r="32" fill="#000" />
            </svg>
            
            {/* Animated Light reflection on the back of the head */}
            <motion.div 
              className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[80px] h-[20px] bg-blue-400/30 blur-2xl rounded-full"
              animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            />
          </div>
        </motion.div>
      ) : (
        // The "Flash" Transition when entering
        <motion.div
          key="flash-transition"
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 20 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[999999] bg-white pointer-events-none flex items-center justify-center origin-center"
        >
          <div className="w-[10vw] h-[10vw] bg-white shadow-[0_0_200px_200px_white] rounded-full" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
