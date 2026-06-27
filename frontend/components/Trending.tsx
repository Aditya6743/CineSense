import Image from "next/image";

const movies = [
  {
    title: "Interstellar",
    rating: "⭐ 8.7",
    image: "https://image.tmdb.org/t/p/w500/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg",
  },
  {
    title: "Inception",
    rating: "⭐ 8.8",
    image: "https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
  },
  {
    title: "The Dark Knight",
    rating: "⭐ 9.0",
    image: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
  },
];

export default function Trending() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <h2 className="mb-10 text-4xl font-bold text-white">
        🔥 Trending Movies
      </h2>

      <div className="grid gap-8 md:grid-cols-3">
        {movies.map((movie) => (
          <div
            key={movie.title}
            className="overflow-hidden rounded-2xl bg-gray-900 transition duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
          >
            <Image
              src={movie.image}
              alt={movie.title}
              width={400}
              height={600}
              className="h-96 w-full object-cover"
            />

            <div className="p-5">
              <h3 className="text-xl font-bold text-white">
                {movie.title}
              </h3>

              <p className="mt-2 text-gray-400">
                {movie.rating}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}