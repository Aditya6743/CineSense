"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/components/AuthContext";
import MovieCard from "@/components/MovieCard";
import Moviemodal from "@/components/Moviemodal";
import { useState } from "react";
import { motion } from "framer-motion";
import BackgroundGraphic from "@/components/BackgroundGraphic";

export default function WatchlistPage() {
  const { watchlist, loading } = useWatchlist();
  const { user, loading: authLoading } = useAuth();
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);

  return (
    <>
      <Navbar />
      
      <main className="relative min-h-screen pt-32 pb-24">
        <BackgroundGraphic />
        
        <div className="mx-auto max-w-7xl px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl font-black tracking-tight text-white">
              My <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">Watchlist</span>
            </h1>
            <p className="mt-4 text-lg text-gray-400">
              Your personalized collection of favorite movies.
            </p>
          </motion.div>

          {authLoading || loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[460px] animate-pulse rounded-3xl bg-white/5 border border-white/10" />
              ))}
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="text-8xl mb-6">🔒</div>
              <h2 className="text-2xl font-bold text-white mb-2">Sign in to view your watchlist</h2>
              <p className="text-gray-400 max-w-md">Create an account or log in to save your favorite movies and access them from anywhere.</p>
            </div>
          ) : watchlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="text-8xl mb-6">🍿</div>
              <h2 className="text-2xl font-bold text-white mb-2">Your watchlist is empty</h2>
              <p className="text-gray-400">Explore trending movies and click the heart icon to save them here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {watchlist.map((movie, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={movie.title}
                >
                  <MovieCard
                    title={movie.title}
                    poster={movie.poster}
                    rating={movie.rating}
                    release_date={movie.release_date}
                    overview={null}
                    onClick={() => setSelectedMovie(movie)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Render Moviemodal over everything */}
      <div className="relative z-[100] pointer-events-auto">
        <Moviemodal 
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
        />
      </div>
    </>
  );
}
