import SearchBar from "../components/SearchBar";

export default function Hero() {
  return (
    <section className="hero-bg min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl md:text-8xl font-extrabold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
        CineSense
      </h1>

      <p className="mt-6 max-w-2xl text-lg md:text-xl text-gray-400 leading-relaxed">
        Discover your next favorite movie with AI-powered recommendations.
        Search from thousands of movies and instantly find similar titles you will love.
      </p>

      <div className="mt-12 w-full flex justify-center">
        <SearchBar />
      </div>

      <div className="mt-12 flex flex-wrap justify-center gap-4">
        <span className="rounded-full border border-gray-700 bg-gray-900/50 px-4 py-2 text-sm text-gray-300">
          🎬 5000+ Movies
        </span>

        <span className="rounded-full border border-gray-700 bg-gray-900/50 px-4 py-2 text-sm text-gray-300">
          🤖 AI Powered
        </span>

        <span className="rounded-full border border-gray-700 bg-gray-900/50 px-4 py-2 text-sm text-gray-300">
          ⚡ Instant Results
        </span>
      </div>
    </section>
  );
}