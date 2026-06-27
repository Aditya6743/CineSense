export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">
      <h1 className="text-6xl font-bold mb-4">
        🎬 CineSense
      </h1>

      <p className="text-gray-400 text-xl mb-10 text-center">
        Discover your next favorite movie with AI-powered recommendations.
      </p>

      <input
        type="text"
        placeholder="Search for a movie..."
        className="w-full max-w-xl rounded-xl px-5 py-4 text-black text-lg outline-none"
      />

      <button
        className="mt-6 bg-red-600 hover:bg-red-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all"
      >
        Recommend
      </button>
    </main>
  );
}