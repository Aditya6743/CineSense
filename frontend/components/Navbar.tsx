"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Film } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import MagneticButton from "./MagneticButton";
import { useState } from "react";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 50);
  });

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ 
        y: 0, 
        opacity: 1,
        backgroundColor: scrolled ? "rgba(7, 11, 26, 0.6)" : "rgba(7, 11, 26, 0)",
      }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
        scrolled 
          ? "border-white/10 backdrop-blur-3xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-2" 
          : "border-transparent py-6"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <motion.div
            whileHover={{
              rotate: 180,
              scale: 1.1,
            }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
            className="rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 p-2.5 shadow-[0_0_20px_rgba(124,92,255,0.4)] group-hover:shadow-[0_0_30px_rgba(124,92,255,0.6)]"
          >
            <Film className="h-5 w-5 text-white" />
          </motion.div>

          <h1 className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-2xl font-extrabold text-transparent tracking-tight">
            CineSense
          </h1>
        </div>

        {/* Links */}
        <div className="hidden items-center gap-2 md:flex">
          {["Home", "Trending", "Features"].map((item) => (
            <MagneticButton key={item} className="group relative px-6 py-2 rounded-full text-sm font-medium text-gray-400 hover:text-white transition-colors">
              <a href={`#${item.toLowerCase()}`}>
                {item}
              </a>
              <span className="absolute bottom-1 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r from-violet-500 to-blue-500 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 drop-shadow-[0_0_8px_rgba(124,92,255,0.8)]" />
            </MagneticButton>
          ))}
        </div>

        {/* Github */}
        <MagneticButton className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-xl hover:bg-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <a
            href="https://github.com/Aditya6743/CineSense"
            target="_blank"
            rel="noreferrer"
          >
            <FaGithub className="text-xl text-white" />
          </a>
        </MagneticButton>
      </div>
    </motion.nav>
  );
}