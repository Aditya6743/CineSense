"use client";

import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { useSoundDesign } from "../hooks/useSoundDesign";

const LOADING_STATUSES = [
  "Initializing neural pathways...",
  "Calibrating 3D space...",
  "Connecting to TMDB...",
  "Loading cinematic universe...",
  "Finalizing rendering engine..."
];

export default function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [readyToEnter, setReadyToEnter] = useState(false);
  const { playWhoosh } = useSoundDesign();

  // Mouse tracking for 3D tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(smoothMouseY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(smoothMouseX, [-0.5, 0.5], [-15, 15]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setLoading(false);
          setReadyToEnter(true);
          return 100;
        }
        return prev + Math.floor(Math.random() * 8) + 1;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  const handleEnter = () => {
    if (!readyToEnter) return;
    playWhoosh();
    setReadyToEnter(false);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && readyToEnter) {
        handleEnter();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readyToEnter, playWhoosh, onComplete]);

  // Determine current status text based on progress
  const statusIndex = Math.min(
    Math.floor((progress / 100) * LOADING_STATUSES.length),
    LOADING_STATUSES.length - 1
  );

  return (
    <AnimatePresence>
      {(loading || readyToEnter) && (
        <motion.div
          key="preloader"
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#05070A] perspective-1000 overflow-hidden"
        >
          {/* Animated background rings */}
          <motion.div 
            animate={{ rotate: 360, scale: [1, 1.05, 1] }}
            transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20"
          >
            <div className="w-[80vw] h-[80vw] md:w-[40vw] md:h-[40vw] rounded-full border-[1px] border-dashed border-violet-500/30" />
            <div className="absolute w-[60vw] h-[60vw] md:w-[30vw] md:h-[30vw] rounded-full border-[1px] border-blue-500/20" />
          </motion.div>

          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            {loading ? (
              <motion.div 
                style={{ rotateX, rotateY }}
                className="flex flex-col items-center transform-gpu cursor-none"
              >
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-8xl md:text-[14rem] font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-violet-200 to-gray-800 tracking-tighter drop-shadow-[0_0_40px_rgba(124,92,255,0.3)] select-none"
                >
                  {Math.min(progress, 100)}<span className="text-4xl md:text-8xl text-violet-500/50">%</span>
                </motion.div>

                <div className="mt-8 flex flex-col items-center gap-4 w-full max-w-sm">
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]">
                    <motion.div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-600 via-blue-500 to-emerald-400 rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ ease: "linear", duration: 0.2 }}
                    />
                    {/* Shimmer effect on progress bar */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                  </div>
                  
                  <div className="h-6 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={statusIndex}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs md:text-sm text-gray-400 font-mono tracking-widest uppercase text-center"
                      >
                        {LOADING_STATUSES[statusIndex]}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.button
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={handleEnter}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-12 py-5 rounded-full bg-white text-black font-black tracking-[0.2em] uppercase text-lg shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-shadow hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] overflow-hidden"
              >
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
                <span className="relative z-10">Enter Experience</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
