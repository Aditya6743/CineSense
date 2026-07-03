"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import MagneticButton from "./MagneticButton";
import { Sparkles, Brain } from "lucide-react";
import { useState } from "react";
import MoodRecommender from "./MoodRecommender";
import MovieModal from "./Moviemodal";

export default function CTA() {
  const [isMoodOpen, setIsMoodOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

  return (
    <section className="relative w-full py-40 px-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="w-[800px] h-[400px] bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-[100%]"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="rounded-[3rem] border border-white/10 bg-white/5 p-16 md:p-24 text-center backdrop-blur-3xl shadow-[0_0_100px_rgba(16,185,129,0.1)] relative overflow-hidden animated-border">
          
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-400 shadow-xl shadow-emerald-500/30"
          >
            <Sparkles className="h-10 w-10 text-black" />
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-8"
          >
            Your perfect movie is <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">one click away.</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-xl text-gray-400 mb-12"
          >
            Stop endlessly scrolling. Tell us your mood and our AI finds the perfect film for you — instantly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <MagneticButton className="rounded-full bg-emerald-500 text-black font-bold text-lg hover:bg-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.4)] transition-colors">
              <Link href="/explore" className="block w-full h-full px-10 py-5">
                Start Exploring
              </Link>
            </MagneticButton>
            <MagneticButton className="rounded-full bg-gradient-to-r from-fuchsia-600/20 to-violet-600/20 hover:from-fuchsia-500/40 hover:to-violet-500/40 text-white font-bold text-lg border border-fuchsia-500/30 transition-colors shadow-[0_0_20px_rgba(217,70,239,0.15)]">
              <button onClick={() => setIsMoodOpen(true)} className="flex items-center gap-3 px-10 py-5">
                <Sparkles className="w-5 h-5 text-fuchsia-400" />
                Try Mood Matcher
              </button>
            </MagneticButton>
          </motion.div>
        </div>
      </div>

      <MoodRecommender
        isOpen={isMoodOpen}
        onClose={() => setIsMoodOpen(false)}
        onMovieClick={(movie) => setSelectedMovie(movie)}
      />
      <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
    </section>
  );
}
