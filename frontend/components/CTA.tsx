"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import MagneticButton from "./MagneticButton";
import { Sparkles } from "lucide-react";

export default function CTA() {
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
            Ready to dive into the <br />
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">cinematic future?</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto max-w-2xl text-xl text-gray-400 mb-12"
          >
            Join thousands of cinephiles using our neural recommendation engine to discover their next favorite masterpiece.
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
                Start Searching Now
              </Link>
            </MagneticButton>
            <MagneticButton className="rounded-full bg-white/10 text-white font-bold text-lg hover:bg-white/20 border border-white/10 transition-colors">
              <a href="https://github.com/Aditya6743/CineSense" target="_blank" rel="noreferrer" className="block w-full h-full px-10 py-5">
                View Documentation
              </a>
            </MagneticButton>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
