"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { Search, Bell, User, Menu, X } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import Link from "next/link";
import MagneticButton from "./MagneticButton";
import { useState } from "react";
import { useUISound } from "../hooks/useUISound";

export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const { playHover, playClick } = useUISound();

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
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onMouseEnter={playHover}
          onClick={() => { playClick(); window.scrollTo(0, 0); }}
        >
          <motion.img
            src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Clapper%20Board.png"
            alt="Clapper Board Logo"
            className="w-10 h-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            whileHover={{ scale: 1.15, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          />

          <h1 className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-2xl font-extrabold text-transparent tracking-tight">
            CineSense
          </h1>
        </div>

        {/* Links */}
        <div className="hidden items-center gap-2 md:flex">
          {[
            { name: "Home", path: "/#home" },
            { name: "Explore", path: "/explore" },
            { name: "Trending", path: "/#trending" },
            { name: "Features", path: "/#features" }
          ].map((item) => (
            <MagneticButton key={item.name} className="relative group px-4 py-2">
              <Link 
                href={item.path}
                className={`text-sm font-medium tracking-wide transition-colors ${
                  item.name === "Explore" 
                    ? "text-yellow-400 group-hover:text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] font-bold" 
                    : "text-gray-300 group-hover:text-white"
                }`}
              >
                {item.name}
              </Link>
              <span className="absolute bottom-1 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r from-violet-500 to-blue-500 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 drop-shadow-[0_0_8px_rgba(124,92,255,0.8)]" />
            </MagneticButton>
          ))}
        </div>

        {/* Social Links */}
        <div className="flex items-center gap-4">
          <MagneticButton className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-xl hover:bg-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <a
              href="https://github.com/Aditya6743"
              target="_blank"
              rel="noreferrer"
            >
              <FaGithub className="text-xl text-white" />
            </a>
          </MagneticButton>
          
          <MagneticButton className="rounded-xl border border-white/10 bg-white/5 p-2.5 backdrop-blur-xl hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/50 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <a
              href="https://www.linkedin.com/in/aditya-tripathi-922a2429a/"
              target="_blank"
              rel="noreferrer"
            >
              <FaLinkedin className="text-xl text-[#0A66C2]" />
            </a>
          </MagneticButton>
        </div>
      </div>
    </motion.nav>
  );
}