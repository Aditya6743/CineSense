"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import MovieCard from "./MovieCard";

import MovieModal from "./Moviemodal";

type Movie = {
  title: string;
  poster: string | null;
  rating: number | null;
  release_date: string | null;
  overview: string | null;
};

export default function Trending() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await axios.get("/api/trending");
        setMovies(res.data);
      } catch (err) {
        console.error("Trending fetch failed:", err);
        setMovies([]);
      }
    };

    fetchTrending();
  }, []);

  return (
    <motion.section
      id="trending"
      initial={{ opacity: 0, y: 80 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative mx-auto w-full max-w-[1600px] px-4 md:px-8 py-24"
    >
      {/* Section Glass */}
      <div className="rounded-[40px] border border-white/10 bg-white/5 p-10 backdrop-blur-2xl shadow-[0_0_80px_rgba(124,58,237,0.15)] overflow-hidden">

        <div className="mb-12 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-5xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent"
          >
            🔥 Trending
          </motion.h2>

          <p className="mt-4 text-lg text-gray-400">
            The hottest movies everyone is watching this week.
          </p>
        </div>

        {movies.length === 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[460px] animate-pulse rounded-3xl bg-white/5 border border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {movies.map((movie, index) => (
              <motion.div
                key={movie.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  delay: index * 0.08,
                  duration: 0.5,
                }}
              >
                <MovieCard
                  title={movie.title}
                  poster={movie.poster}
                  rating={movie.rating}
                  release_date={movie.release_date}
                  overview={movie.overview}
                  onClick={() => setSelectedMovie(movie)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </motion.section>
  );
}