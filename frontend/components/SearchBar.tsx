"use client";

import { useState } from "react";
import axios from "axios";
import MovieCard from "../components/MovieCard";
import MovieModal from "./Moviemodal";

type Movie = {
  title: string;
  poster: string | null;
  rating: number | null;
  release_date: string | null;
  overview: string | null;
};

export default function SearchBar() {
  const [movie, setMovie] = useState("");
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const handleRecommend = async () => {
    if (!movie.trim()) return;

    setLoading(true);

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/recommend/${encodeURIComponent(movie)}`
      );

      if (response.data.recommendations) {
        setRecommendations(response.data.recommendations);
      } else {
        setRecommendations([]);
      }
    } catch (error) {
      console.error(error);
      alert("Movie not found!");
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl">
      <div className="flex flex-col gap-4 md:flex-row">
        <input
          type="text"
          placeholder="🎬 Search your favorite movie..."
          value={movie}
          onChange={(e) => setMovie(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleRecommend();
            }
          }}
          className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-5 py-4 text-white outline-none transition focus:border-purple-500"
        />

        <button
          onClick={handleRecommend}
          disabled={loading}
          className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 font-semibold text-white transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Searching..." : "Recommend"}
        </button>
      </div>

      {loading && (
        <div className="mt-10 flex flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-400">
            Finding perfect recommendations...
          </p>
        </div>
      )}

      {!loading && recommendations.length > 0 && (
        <div className="mt-14">
          <h2 className="mb-8 text-center text-3xl font-bold text-white">
            🍿 Recommended Movies
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((movie) => (
              <MovieCard
                key={movie.title}
                title={movie.title}
                poster={movie.poster}
                rating={movie.rating}
                release_date={movie.release_date}
                overview={movie.overview}
                onClick={() => setSelectedMovie(movie)}
              />
            ))}
          </div>
        </div>
      )}

      <MovieModal
        movie={selectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}