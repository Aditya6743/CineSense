"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import MovieCard from "./MovieCard";

type Movie = {
  title: string;
  poster: string | null;
  rating: number | null;
  release_date: string | null;
  overview: string | null;
};

export default function Trending() {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
  const fetchTrending = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/trending");
      setMovies(res.data);
    } catch (err) {
      console.error("Trending fetch failed:", err);
      setMovies([]);
    }
  };

  fetchTrending();
}, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="mb-10 text-center text-4xl font-bold text-white">
        🔥 Trending This Week
      </h2>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.title}
            title={movie.title}
            poster={movie.poster}
            rating={movie.rating}
            release_date={movie.release_date}
            overview={movie.overview}
          />
        ))}
      </div>
    </section>
  );
}