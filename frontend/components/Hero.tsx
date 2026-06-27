export default function Hero() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-[#030712] text-white px-6">
      <h1 className="text-6xl font-bold mb-6">
        🎬 CineSense
      </h1>

      <p className="text-gray-400 text-center max-w-xl mb-8">
        Discover your next favorite movie with AI-powered recommendations.
      </p>

      <div className="flex w-full max-w-2xl gap-4">
        <input
          type="text"
          placeholder="Search a movie..."
          className="flex-1 rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 outline-none"
        />

        <button className="rounded-lg bg-purple-600 px-6 py-3 hover:bg-purple-700">
          Recommend
        </button>
      </div>
    </section>
  );
}