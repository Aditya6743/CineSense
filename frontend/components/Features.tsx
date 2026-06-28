"use client";

import { Film, Zap, Brain, Sparkles, TrendingUp, Search } from "lucide-react";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".bento-item", {
        y: 100,
        opacity: 0,
        stagger: 0.1,
        duration: 1,
        ease: "power4.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative mx-auto max-w-7xl px-6 py-32">
      <div className="mb-16 text-center">
        <h2 className="text-5xl font-black tracking-tighter text-white">
          Engineered for <span className="text-emerald-400">Discovery</span>
        </h2>
        <p className="mt-4 text-gray-400 text-lg max-w-2xl mx-auto">
          Built with cutting-edge technology to bring you the most accurate movie recommendations.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px]">
        
        {/* Large Item */}
        <div className="bento-item md:col-span-2 md:row-span-2 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/0 p-10 backdrop-blur-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <Brain className="w-12 h-12 text-emerald-400 mb-6" />
          <h3 className="text-3xl font-bold mb-4">Neural Recommendations</h3>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md">
            Our TF-IDF vectorizer processes thousands of movie tags, genres, and cast metadata to build a complex similarity matrix, ensuring you get mathematically perfect recommendations.
          </p>
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />
        </div>

        {/* Small Item 1 */}
        <div className="bento-item rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Zap className="w-8 h-8 text-cyan-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Blazing Fast</h3>
          <p className="text-gray-400 text-sm">Asynchronous FastAPI endpoints deliver results in milliseconds.</p>
        </div>

        {/* Small Item 2 */}
        <div className="bento-item rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-xl relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-b from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Search className="w-8 h-8 text-teal-400 mb-4" />
          <h3 className="text-xl font-bold mb-2">Instant Search</h3>
          <p className="text-gray-400 text-sm">Debounced autocomplete powered by in-memory titles.</p>
        </div>

        {/* Wide Item */}
        <div className="bento-item md:col-span-3 rounded-[2rem] border border-white/10 bg-gradient-to-r from-gray-900 to-black p-10 backdrop-blur-xl relative overflow-hidden group flex flex-col md:flex-row items-center justify-between">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          <div className="relative z-10 max-w-xl">
            <TrendingUp className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-2xl font-bold mb-2">Bayesian Popularity Weighting</h3>
            <p className="text-gray-400">
              We don&apos;t just match keywords. We combine cosine similarity with a weighted formula factoring in TMDB vote averages to ensure high-quality films rise to the top.
            </p>
          </div>
          <div className="relative z-10 mt-8 md:mt-0 flex gap-4">
             <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center animate-bounce shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Sparkles className="text-emerald-400" />
             </div>
             <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center animate-bounce" style={{ animationDelay: "0.2s" }}>
                <Film className="text-white" />
             </div>
          </div>
        </div>

      </div>
    </section>
  );
}