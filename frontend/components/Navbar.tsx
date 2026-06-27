export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-black/30 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-8 py-5">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
          🎬 CineSense
        </h1>

        <div className="flex items-center gap-6">
          <button className="text-gray-300 hover:text-white transition">
            Home
          </button>

          <button className="text-gray-300 hover:text-white transition">
            About
          </button>

          <button className="rounded-xl bg-purple-600 px-5 py-2 font-semibold hover:bg-purple-700 transition">
            GitHub
          </button>
        </div>
      </div>
    </nav>
  );
}