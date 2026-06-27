"use client";

import { Film } from "lucide-react";
import { FaGithub } from "react-icons/fa";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 p-2">
            <Film className="h-6 w-6 text-white" />
          </div>

          <h1 className="text-2xl font-bold tracking-wide text-white">
            Cine<span className="text-purple-400">Sense</span>
          </h1>
        </div>

        {/* Navigation */}
        <div className="hidden items-center gap-10 md:flex">
          <a
            href="#"
            className="text-gray-300 transition hover:text-purple-400"
          >
            Home
          </a>

          <a
            href="#trending"
            className="text-gray-300 transition hover:text-purple-400"
          >
            Trending
          </a>

          <a
            href="#recommend"
            className="text-gray-300 transition hover:text-purple-400"
          >
            AI Picks
          </a>
        </div>

        {/* GitHub */}
        <a
          href="https://github.com/yourusername/CineSense"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-white/10 p-3 transition hover:bg-purple-600"
        >
          <FaGithub className="h-5 w-5 text-white" />
        </a>
      </div>
    </nav>
  );
}