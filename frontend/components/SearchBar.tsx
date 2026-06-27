"use client";

import { useState } from "react";
import axios from "axios";

export default function Searchbar() {
  const [movie, setMovie] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRecommend = async () => {
    if (!movie.trim()) return;

    setLoading(true);

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/recommend/${movie}`
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
    }

    setLoading(false);
  };

  return (
    <div className="w-full max-w-3xl">
      <div className="flex flex-col gap-4 md:flex-row">
        <input
          type="text"
          placeholder="🎬 Search a movie..."
          value={movie}
          onChange={(e) => setMovie(e.target.value)}
          className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-5 py-4 text-white outline-none focus:border-purple-500"
        />

        <button
          onClick={handleRecommend}
          className="rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 font-semibold text-white transition hover:scale-105"
        >
          Recommend
        </button>
      </div>

      {loading && (
        <p className="mt-6 text-center text-gray-400">
          Loading recommendations...
        </p>
      )}

      {recommendations.length > 0 && (
        <div className="mt-10 rounded-2xl border border-white/10 bg-gray-900 p-6">
          <h2 className="mb-6 text-2xl font-bold text-white">
            Recommended Movies
          </h2>

          <div className="space-y-4">
            {recommendations.map((movie) => (
              <div
                key={movie}
                className="rounded-xl bg-gray-800 px-5 py-4 transition hover:bg-gray-700"
              >
                🎬 {movie}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}