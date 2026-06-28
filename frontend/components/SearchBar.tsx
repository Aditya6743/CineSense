"use client";

import MovieModal from "../components/Moviemodal";
import { useState, useEffect, useRef } from "react";
import { useLenis } from "lenis/react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import MovieCard from "../components/MovieCard";
import MagneticButton from "./MagneticButton";

type Movie = {
  title: string;
  poster: string | null;
  rating: number | null;
  release_date: string | null;
  overview: string | null;
  score?: number | null;
  similarity?: number | null;
};

export default function SearchBar() {
  const [movie, setMovie] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!movie.trim() || movie.length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await axios.get(
          `/api/search/suggestions?query=${encodeURIComponent(movie)}`
        );
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching suggestions", error);
      }
    };
    
    const timeoutId = setTimeout(() => {
      fetchSuggestions();
    }, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [movie]);

  // Refresh GSAP ScrollTrigger when recommendations load/unload
  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
      setTimeout(() => ScrollTrigger.refresh(), 100);
      setTimeout(() => ScrollTrigger.refresh(), 500); // Failsafe for images loading
    }
  }, [recommendations.length]);

  // Automatically scroll to results when they load (cinematically!)
  useEffect(() => {
    if (recommendations.length > 0 && resultsRef.current) {
      setTimeout(() => {
        if (lenis && resultsRef.current) {
          lenis.scrollTo(resultsRef.current, {
            offset: -120, // Keep padding from top edge
            duration: 1.8, // Slow, dramatic cinematic scroll
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease-out
          });
        } else {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 150); // slight delay to allow layout to settle
    }
  }, [recommendations, lenis]);

  const handleRecommend = async (searchQuery: string = movie) => {
    if (!searchQuery.trim()) return;

    setMovie(searchQuery);
    setShowSuggestions(false);
    setLoading(true);

    try {
      const response = await axios.get(
        `/api/recommend/${encodeURIComponent(searchQuery)}`
      );

      if (response.data.recommendations) {
        setRecommendations(response.data.recommendations);
      } else {
        setRecommendations([]);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Search error details:", error);
      const errorMsg = error.response?.data?.detail || error.message || "Unknown error";
      alert(`Error fetching recommendations for "${searchQuery}":\n\n${errorMsg}\n\n(Status: ${error.response?.status || 'Network Error'})`);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">

      {/* Search Box */}
      <motion.div
        initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
        className="relative z-50 mx-auto max-w-3xl"
      >
        <div className="absolute -inset-[1px] rounded-full bg-gradient-to-r from-violet-500/30 via-blue-500/30 to-fuchsia-500/30 opacity-50"></div>
        <div className="absolute -inset-4 rounded-full bg-blue-500/10 blur-2xl opacity-50"></div>

        <div className="relative flex flex-col gap-2 rounded-full border border-white/10 bg-[#05070A]/80 p-2 backdrop-blur-3xl md:flex-row shadow-[0_8px_32px_rgba(0,0,0,0.5)]" ref={dropdownRef}>

          <div className="flex flex-1 items-center gap-4 relative px-4">
            <Search className="h-5 w-5 text-gray-400" />

            <input
              type="text"
              placeholder="Search any movie..."
              value={movie}
              onChange={(e) => {
                setMovie(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setShowSuggestions(false);
                  handleRecommend();
                }
              }}
              className="w-full bg-transparent text-lg font-medium text-white outline-none placeholder:text-gray-500"
            />
            
            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="absolute left-0 right-0 top-full mt-4 rounded-3xl border border-white/10 bg-[#05070A]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
                >
                  <ul className="max-h-64 overflow-y-auto p-2">
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        onClick={() => handleRecommend(suggestion)}
                        className="px-6 py-3 cursor-pointer rounded-xl hover:bg-white/5 transition-colors text-left text-gray-300 font-medium"
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <MagneticButton>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRecommend(movie)}
              disabled={loading}
              className="group relative flex items-center justify-center gap-2 rounded-full bg-white text-black px-8 py-3.5 font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/10 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
              <Sparkles size={18} className="fill-black relative z-10" />
              <span className="relative z-10">{loading ? "Searching..." : "Recommend"}</span>
            </motion.button>
          </MagneticButton>
        </div>

        <p className="mt-6 text-center text-sm font-medium text-gray-500">
          Press <kbd className="rounded-md border border-white/20 bg-white/5 px-2 py-1 text-gray-300 shadow-sm font-sans text-xs">Enter</kbd> to search instantly
        </p>
      </motion.div>

      {/* Results */}
      {!loading && recommendations.length > 0 && (
        <motion.div
          ref={resultsRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-24 scroll-mt-32"
        >
          <div className="mb-14 text-center">
            <h2 className="text-5xl font-black bg-gradient-to-r from-white via-blue-100 to-violet-300 bg-clip-text text-transparent">
              🍿 Recommended Movies
            </h2>

            <p className="mt-4 text-lg text-gray-400">
              AI-powered recommendations tailored for you.
            </p>
          </div>

          <div className="flex gap-6 md:gap-10 overflow-x-auto pb-12 pt-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {recommendations.map((recMovie, index) => (
              <motion.div
                key={recMovie.title}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative min-w-[260px] md:min-w-[340px] shrink-0 snap-center"
              >
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-b from-violet-600/30 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-xl pointer-events-none" />
                <MovieCard
                  title={recMovie.title}
                  poster={recMovie.poster}
                  rating={recMovie.rating}
                  release_date={recMovie.release_date}
                  overview={recMovie.overview}
                  onClick={() => setSelectedMovie(recMovie)}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <MovieModal
        movie={selectedMovie}
        searchedMovieTitle={movie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}