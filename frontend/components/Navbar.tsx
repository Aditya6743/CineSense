"use client";

import { motion, useScroll, useMotionValueEvent, AnimatePresence } from "framer-motion";
import { Search, Bell, User, Menu, X } from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import Link from "next/link";
import MagneticButton from "./MagneticButton";
import { useState } from "react";
import { useUISound } from "../hooks/useUISound";
import { useAuth } from "./AuthContext";
export default function Navbar() {
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { playHover, playClick } = useUISound();
  const { user, signOut, isAuthModalOpen, setAuthModalOpen } = useAuth();

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
            <MagneticButton key={item.name} className="relative group">
              <Link 
                href={item.path}
                className={`block w-full h-full px-4 py-2 text-sm font-medium tracking-wide transition-colors ${
                  item.name === "Explore" 
                    ? "text-yellow-400 group-hover:text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] font-bold" 
                    : "text-gray-300 group-hover:text-white"
                }`}
              >
                {item.name}
              </Link>
              <span className="absolute bottom-1 left-6 right-6 h-[2px] rounded-full bg-gradient-to-r from-violet-500 to-blue-500 origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100 drop-shadow-[0_0_8px_rgba(124,92,255,0.8)] pointer-events-none" />
            </MagneticButton>
          ))}
        </div>

        {/* Social Links & Mobile Toggle */}
        <div className="flex items-center gap-2 md:gap-4">
          <MagneticButton className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <a
              href="https://github.com/Aditya6743"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center p-2.5 w-full h-full"
            >
              <FaGithub className="text-xl text-white" />
            </a>
          </MagneticButton>
          
          <MagneticButton className="hidden md:flex rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-[#0A66C2]/20 hover:border-[#0A66C2]/50 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
            <a
              href="https://www.linkedin.com/in/aditya-tripathi-922a2429a/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center p-2.5 w-full h-full"
            >
              <FaLinkedin className="text-xl text-[#0A66C2]" />
            </a>
          </MagneticButton>

          {/* Auth Button */}
          {user ? (
            <div className="relative group">
              <MagneticButton className="rounded-xl border border-white/10 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 transition-colors shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                <Link
                  href="/watchlist"
                  onClick={playClick}
                  className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white w-full h-full"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Watchlist</span>
                </Link>
              </MagneticButton>
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-[#0a0f16] shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="p-2">
                  <p className="px-3 py-2 text-xs text-gray-400 truncate border-b border-white/10 mb-1">
                    {user.email}
                  </p>
                  <Link href="/watchlist" className="block px-3 py-2 text-sm text-gray-200 hover:bg-white/10 rounded-lg transition-colors">
                    My Watchlist
                  </Link>
                  <button onClick={() => { playClick(); signOut(); }} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-white/10 rounded-lg transition-colors">
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <MagneticButton className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
              <button
                onClick={() => { playClick(); setAuthModalOpen(true); }}
                className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white w-full h-full"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline">Sign In</span>
              </button>
            </MagneticButton>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
            onClick={() => {
              playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#070b1a]/95 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col px-6 py-4 gap-4">
              {[
                { name: "Home", path: "/#home" },
                { name: "Explore", path: "/explore" },
                { name: "Trending", path: "/#trending" },
                { name: "Features", path: "/#features" }
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  onClick={() => { playClick(); setMobileMenuOpen(false); }}
                  className={`text-lg font-medium transition-colors border-b border-white/5 pb-2 ${
                    item.name === "Explore" ? "text-yellow-400 font-bold drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : "text-gray-300 hover:text-white"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className="flex items-center gap-4 pt-2">
                <a href="https://github.com/Aditya6743" target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <FaGithub className="text-xl text-white" />
                </a>
                <a href="https://www.linkedin.com/in/aditya-tripathi-922a2429a/" target="_blank" rel="noreferrer" className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <FaLinkedin className="text-xl text-[#0A66C2]" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}