import Image from "next/image";

type MovieCardProps = {
  title: string;
  poster: string | null;
  rating: number | null;
  release_date: string | null;
  overview: string | null;
  onClick?: () => void;
};

export default function MovieCard({
  title,
  poster,
  rating,
  release_date,
  overview,
  onClick,
}: MovieCardProps) {
  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md transition-all duration-500 hover:-translate-y-2 hover:border-purple-500 hover:shadow-2xl hover:shadow-purple-500/20"
    >
      {poster ? (
        <div className="relative h-80 w-full overflow-hidden">
          <Image
            src={poster}
            alt={title}
            fill
            sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex h-80 items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-7xl">
          🎬
        </div>
      )}

      <div className="space-y-3 p-5">
        <h3 className="line-clamp-2 text-xl font-bold text-white">
          {title}
        </h3>

        <div className="flex items-center justify-between text-sm text-gray-300">
          <span>⭐ {rating ? rating.toFixed(1) : "N/A"}</span>
          <span>📅 {release_date ? release_date.slice(0, 4) : "N/A"}</span>
        </div>

        <p className="line-clamp-4 text-sm leading-6 text-gray-400">
          {overview?.trim()
            ? overview
            : "No overview available for this movie."}
        </p>
      </div>
    </div>
  );
}