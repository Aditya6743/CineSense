"use client";

import { motion } from "framer-motion";
import SearchBar from "./SearchBar";
import { useEffect, useRef } from "react";
import AnimatedCounter from "./AnimatedCounter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax fade-out removed:
    // It was causing the entire Hero section (including Search Results) to fade to opacity 0 
    // when the user scrolled down to view the recommended movies!
    if (typeof window !== "undefined") {
      ScrollTrigger.refresh();
    }
  }, []);

  const headline = "Discover Your Next Favorite Movie".split(" ");

  return (
    <section ref={containerRef} className="relative overflow-hidden px-6 pt-32 pb-24 min-h-[90vh] flex flex-col justify-center w-full max-w-[100vw]">

      {/* Floating Elements */}
      <motion.div 
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-tr from-violet-500/20 to-blue-500/20"
      />
      <motion.div 
        animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }} 
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-20 right-20 w-48 h-48 rounded-full bg-gradient-to-bl from-blue-500/20 to-fuchsia-500/20"
      />

      <div className="relative w-full min-w-0 mx-auto max-w-6xl text-center z-10 px-2 sm:px-0">
        
        {/* Animated Headline */}
        <h1 className="text-4xl sm:text-5xl font-black leading-tight md:text-8xl perspective-1000">
          {headline.map((word, index) => (
            <motion.span
              key={index}
              className="inline-block mr-4 origin-bottom"
              initial={{ opacity: 0, y: 50, filter: "blur(15px)", rotateX: -45 }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)", rotateX: 0 }}
              transition={{
                duration: 1,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1], // Custom cinematic easing
              }}
            >
              {word === "Favorite" || word === "Movie" ? (
                <motion.span 
                  className="bg-clip-text text-transparent inline-block drop-shadow-[0_0_15px_rgba(124,92,255,0.4)]"
                  style={{
                    backgroundImage: "linear-gradient(90deg, #7C5CFF, #4EA8FF, #00E5FF, #D946EF, #7C5CFF)",
                    backgroundSize: "200% auto",
                  }}
                  animate={{ backgroundPosition: ["0% center", "200% center"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                >
                  {word}
                </motion.span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-gray-400 font-medium"
        >
          AI-powered movie recommendations using Machine Learning + TMDB. Search any movie and instantly discover your next obsession.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6, type: "spring" }}
          className="mt-14"
        >
          <SearchBar />
        </motion.div>

        {/* Cinematic Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 relative"
        >
          {/* Subtle connecting line */}
          <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-y-1/2 hidden md:block" />
          
          <motion.div whileHover={{ y: -5, scale: 1.02 }} className="rounded-3xl border border-white/5 bg-[#0a0f16]/60 p-8 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
              <AnimatedCounter value={20000} suffix="+" />
            </h2>
            <p className="mt-3 text-xs text-violet-400 font-mono tracking-widest uppercase opacity-80">Curated Movies</p>
          </motion.div>
          
          <motion.div whileHover={{ y: -5, scale: 1.02 }} className="rounded-3xl border border-white/5 bg-[#0a0f16]/60 p-8 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
              <AnimatedCounter value={99} suffix="%" />
            </h2>
            <p className="mt-3 text-xs text-blue-400 font-mono tracking-widest uppercase opacity-80">Neural Accuracy</p>
          </motion.div>
          
          <motion.div whileHover={{ y: -5, scale: 1.02 }} className="rounded-3xl border border-white/5 bg-[#0a0f16]/60 p-8 backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent">
              <AnimatedCounter value={10} suffix="ms" />
            </h2>
            <p className="mt-3 text-xs text-fuchsia-400 font-mono tracking-widest uppercase opacity-80">Search Latency</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}