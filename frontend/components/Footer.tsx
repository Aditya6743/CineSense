export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#020617] py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <div>
          <h2 className="text-2xl font-bold text-white">🎬 CineSense</h2>
          <p className="mt-2 text-sm text-gray-400">
            AI-powered movie recommendation system.
          </p>
        </div>

        <div className="text-sm text-gray-500">
          © 2026 CineSense. Built with ❤️ using Next.js + FastAPI.
        </div>
      </div>
    </footer>
  );
}