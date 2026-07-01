/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useColor } from "color-thief-react";
import { useTheme } from "./ThemeProvider";
import axios from "axios";
import { Heart, Play, Clock, Globe } from "lucide-react";
import { useWatchlist } from "../hooks/useWatchlist";

type Movie = {
  title: string;
  poster: string | null;
  rating: number | null;
  release_date: string | null;
  overview: string | null;
  runtime?: number | null;
  genres?: string[];
  cast?: string[];
  trailer_url?: string | null;
  language?: string | null;
};

type Props = {
  movie: Movie | null;
  searchedMovieTitle?: string;
  onClose: () => void;
};

export default function MovieModal({ movie, searchedMovieTitle, onClose }: Props) {
  const { setAccentColor } = useTheme();
  const [pitch, setPitch] = useState<string | null>(null);
  const [loadingPitch, setLoadingPitch] = useState(false);
  const { isInWatchlist, toggleWatchlist } = useWatchlist();

  // Extract color from poster
  const { data: extractedColor } = useColor(movie?.poster || "", "hex", { crossOrigin: "anonymous" });

  useEffect(() => {
    if (movie) {
      setPitch(null);
      
      // Fetch AI Pitch
      if (searchedMovieTitle) {
        setLoadingPitch(true);
        axios.get(`/api/generate-pitch?query=${encodeURIComponent(searchedMovieTitle)}&recommended=${encodeURIComponent(movie.title)}`)
          .then(res => setPitch(res.data.pitch))
          .catch(err => {
            console.error(err);
            setPitch("Since you liked your previous search, this highly-rated film shares deep stylistic and thematic similarities you'll love.");
          })
          .finally(() => setLoadingPitch(false));
      }
    }
  }, [movie, searchedMovieTitle]);

  useEffect(() => {
    if (extractedColor) {
      setAccentColor(extractedColor);
    }
    return () => {
      // Revert to default emerald on close
      setAccentColor("#10b981");
    };
  }, [extractedColor, setAccentColor]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!movie || !mounted) return null;
  const saved = isInWatchlist(movie.title);

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl overflow-hidden rounded-[2rem] bg-gray-900/90 shadow-2xl border flex flex-col max-h-[90vh]"
          style={{ borderColor: `${extractedColor || '#10b981'}40` }}
        >
          <div className="grid md:grid-cols-5 h-full overflow-y-auto md:overflow-hidden" data-lenis-prevent="true">
            
            <div className="relative h-[400px] md:h-[700px] md:col-span-2 shrink-0">
              {movie.poster ? (
                <Image
                  src={movie.poster}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                  crossOrigin="anonymous"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-8xl bg-black">
                  🎬
                </div>
              )}
              {/* Gradient fade to blend image into background */}
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-transparent via-gray-900/20 to-gray-900/100" />
            </div>

            <div className="flex flex-col p-8 md:p-10 md:col-span-3 relative md:overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
              
              {/* Background glow using extracted color */}
              <div 
                className="absolute inset-0 opacity-10 blur-3xl rounded-full pointer-events-none"
                style={{ backgroundColor: extractedColor || '#10b981' }}
              />

              <div className="relative z-10 flex flex-col flex-1">
                <div className="flex justify-between items-start gap-4 mb-4">
                  <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                    {movie.title}
                  </h2>
                  <button
                    onClick={() => toggleWatchlist({ 
                      title: movie.title, 
                      poster: movie.poster, 
                      rating: movie.rating, 
                      release_date: movie.release_date 
                    })}
                    className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-pink-500/20 hover:border-pink-500/50 transition-all shrink-0 group/heart"
                  >
                    <Heart className={`w-6 h-6 transition-all ${saved ? "fill-pink-500 text-pink-500 scale-110" : "text-white group-hover/heart:text-pink-400"}`} />
                  </button>
                </div>

                <div className="mb-6 flex flex-wrap gap-4 text-gray-300 font-mono text-sm uppercase tracking-widest items-center">
                  <span className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/5">
                    ⭐ <span className="font-bold text-white">{movie.rating ? movie.rating.toFixed(1) : "N/A"}</span>
                  </span>
                  <span className="flex items-center gap-1.5 opacity-80">
                    📅 {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
                  </span>
                  {movie.runtime && (
                    <span className="flex items-center gap-1.5 opacity-80">
                      <Clock className="w-4 h-4" /> {movie.runtime}m
                    </span>
                  )}
                  {movie.language && (
                    <span className="flex items-center gap-1.5 opacity-80">
                      <Globe className="w-4 h-4" /> {movie.language}
                    </span>
                  )}
                </div>

                {/* Genres */}
                {movie.genres && movie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {movie.genres.map(g => (
                      <span key={g} className="px-3 py-1 text-xs font-bold tracking-wider uppercase text-white/80 rounded-full border" style={{ borderColor: `${extractedColor || '#10b981'}60`, backgroundColor: `${extractedColor || '#10b981'}20` }}>
                        {g}
                      </span>
                    ))}
                  </div>
                )}

                {/* Generative AI Pitch Section */}
                <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group">
                  <div 
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                    style={{ background: `linear-gradient(45deg, transparent, ${extractedColor || '#10b981'}, transparent)` }}
                  />
                  <h3 className="mb-2 text-sm font-bold tracking-widest uppercase text-white/70 flex items-center gap-2 relative z-10">
                    ✨ AI Director&apos;s Pitch
                  </h3>
                  <p className="leading-relaxed text-white font-medium text-lg relative z-10">
                    {loadingPitch ? (
                      <span className="animate-pulse">Generating personalized pitch...</span>
                    ) : (
                      pitch
                    )}
                  </p>
                </div>

                <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-500">
                  Overview
                </h3>
                <p className="leading-relaxed text-gray-300 text-lg mb-8">
                  {movie.overview?.trim() ? movie.overview : "No overview available."}
                </p>

                {/* Cast */}
                {movie.cast && movie.cast.length > 0 && (
                  <div className="mb-8">
                    <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-gray-500">Top Cast</h3>
                    <div className="flex flex-wrap gap-2">
                      {movie.cast.map(actor => (
                        <span key={actor} className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-black/40 rounded-lg border border-white/5">
                          {actor}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Bottom Actions */}
              <div className="mt-auto pt-6 flex flex-wrap gap-4 relative z-20">
                {movie.trailer_url && (
                  <a
                    href={movie.trailer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[200px] flex items-center justify-center gap-2 rounded-full px-8 py-4 font-black tracking-widest uppercase text-white transition hover:scale-105 shadow-[0_0_30px_rgba(255,0,0,0.3)] bg-red-600 hover:bg-red-500"
                  >
                    <Play className="w-5 h-5 fill-white" /> Watch Trailer
                  </a>
                )}
                <button
                  onClick={onClose}
                  data-magnetic="true"
                  className="flex-1 min-w-[200px] rounded-full px-8 py-4 font-black tracking-widest uppercase text-black transition hover:scale-105 shadow-xl"
                  style={{ backgroundColor: extractedColor || '#10b981' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
