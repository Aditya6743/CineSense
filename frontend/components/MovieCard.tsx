"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Star, Heart, Eye } from "lucide-react";
import Tilt from "react-parallax-tilt";
import { useWatchlist } from "../hooks/useWatchlist";
import { useWatched } from "../hooks/useWatched";
import { useUISound } from "../hooks/useUISound";

type MovieCardProps = {
  title: string;
  poster: string | null;
  rating: number | null;
  release_date: string | null;
  overview: string | null;
  onClick?: () => void;
};

export default function MovieCard({
  title,
  poster,
  rating,
  release_date,
  overview,
  onClick,
}: MovieCardProps) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const { isWatched, toggleWatched } = useWatched();
  const saved = isInWatchlist(title);
  const watched = isWatched(title);
  const { playHover, playClick } = useUISound();

  const handleCardClick = () => {
    playClick();
    if (onClick) onClick();
  };

  return (
    <Tilt
      tiltMaxAngleX={5}
      tiltMaxAngleY={5}
      glareEnable={false}
      transitionSpeed={400}
      scale={1.02}
      className="cursor-pointer"
      onEnter={playHover}
    >
      <motion.div
        onClick={handleCardClick}
        className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#0a0f16] shadow-2xl transition-all duration-300 hover:border-[#4EA8FF]/50 hover:shadow-[0_0_30px_rgba(78,168,255,0.4)]"
      >
        {/* Poster */}
        <div className="relative h-[460px] overflow-hidden">
          {poster ? (
            <Image
              src={poster}
              alt={title}
              fill
              sizes="(max-width:768px)100vw,(max-width:1200px)50vw,33vw"
              className="object-cover transition duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950 text-8xl">
              🎬
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent transition-opacity duration-300 group-hover:opacity-80" />

          {/* Rating Badge */}
          <div className="absolute left-4 top-4 flex items-center gap-1 rounded-full bg-black/20 px-3 py-2 backdrop-blur-md border border-white/20 group-hover:border-blue-400/50 transition-colors">
            <Star className="h-4 w-4 fill-violet-400 text-violet-400" />
            <span className="text-sm font-semibold text-white">
              {rating ? rating.toFixed(1) : "N/A"}
            </span>
          </div>

          {/* Watchlist Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWatchlist({ title, poster, rating, release_date });
            }}
            className="absolute right-4 top-4 rounded-full bg-black/20 p-2.5 backdrop-blur-md border border-white/20 hover:border-pink-500/60 hover:bg-pink-500/30 transition-all z-20 group/heart shadow-lg"
          >
            <Heart 
              className={`h-5 w-5 transition-all ${saved ? "fill-pink-500 text-pink-500" : "text-white group-hover/heart:text-pink-400"}`} 
            />
            <span className="absolute -bottom-8 right-0 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover/heart:opacity-100 pointer-events-none border border-white/10">
              {saved ? "Remove Watchlist" : "Add to Watchlist"}
            </span>
          </button>

          {/* Watched Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWatched({ title, poster, rating, release_date });
            }}
            className="absolute right-16 top-4 rounded-full bg-black/20 p-2.5 backdrop-blur-md border border-white/20 hover:border-emerald-500/60 hover:bg-emerald-500/30 transition-all z-20 group/eye shadow-lg"
          >
            <Eye 
              className={`h-5 w-5 transition-all ${watched ? "text-emerald-500" : "text-white group-hover/eye:text-emerald-400"}`} 
            />
            <span className="absolute -bottom-8 right-0 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover/eye:opacity-100 pointer-events-none border border-white/10">
              {watched ? "Remove Watched" : "Mark as Watched"}
            </span>
          </button>

          {/* Bottom */}
          <div className="absolute bottom-0 w-full p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <h2 className="line-clamp-2 text-2xl font-bold text-white group-hover:text-blue-300 transition-colors pr-12">
              {title}
            </h2>
            
            {/* Year */}
            <div className="mt-2 inline-block rounded-full bg-gradient-to-r from-violet-600/80 to-blue-600/80 px-2.5 py-0.5 text-xs font-semibold text-white shadow-[0_0_15px_rgba(124,92,255,0.4)] border border-white/10">
              {release_date ? release_date.slice(0, 4) : "N/A"}
            </div>

            <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
              {overview?.trim()
                ? overview
                : "No overview available."}
            </p>
          </div>
        </div>
      </motion.div>
    </Tilt>
  );
}