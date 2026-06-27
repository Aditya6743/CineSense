"use client";

import Image from "next/image";

type Movie = {
  title: string;
  poster: string | null;
  rating: number | null;
  release_date: string | null;
  overview: string | null;
};

type Props = {
  movie: Movie | null;
  onClose: () => void;
};

export default function MovieModal({ movie, onClose }: Props) {
  if (!movie) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl overflow-hidden rounded-3xl bg-gray-900 shadow-2xl"
      >
        <div className="grid md:grid-cols-2">
          <div className="relative h-[500px]">
            {movie.poster ? (
              <Image
  src={movie.poster}
  alt={movie.title}
  fill
  sizes="(max-width: 768px) 100vw, 50vw"
  className="object-cover"
/>
            ) : (
              <div className="flex h-full items-center justify-center text-8xl">
                🎬
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between p-8">
            <div>
              <h2 className="mb-4 text-4xl font-bold text-white">
                {movie.title}
              </h2>

              <div className="mb-6 flex gap-6 text-gray-300">
                <span>⭐ {movie.rating ?? "N/A"}</span>

                <span>
                  📅{" "}
                  {movie.release_date
                    ? movie.release_date.slice(0, 4)
                    : "N/A"}
                </span>
              </div>

              <h3 className="mb-2 text-xl font-semibold text-purple-400">
                Overview
              </h3>

              <p className="leading-8 text-gray-300">
                {movie.overview?.trim()
                  ? movie.overview
                  : "No overview available."}
              </p>
            </div>

            <button
              onClick={onClose}
              className="mt-8 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-semibold text-white transition hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}