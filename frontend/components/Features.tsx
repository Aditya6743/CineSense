import { Sparkles, Film, Zap } from "lucide-react";

export default function Features() {
  const features = [
    {
      icon: <Sparkles size={40} />,
      title: "AI Recommendations",
      description:
        "Discover movies similar to your favorites using machine learning.",
    },
    {
      icon: <Film size={40} />,
      title: "5000+ Movies",
      description:
        "Explore a huge collection of movies across different genres.",
    },
    {
      icon: <Zap size={40} />,
      title: "Instant Results",
      description:
        "Get recommendations instantly with our optimized recommendation engine.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <h2 className="text-4xl font-bold text-center mb-14">
        Why Choose CineSense?
      </h2>

      <div className="grid gap-8 md:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-white/10 bg-gray-900 p-8 text-center transition hover:-translate-y-2 hover:border-purple-500"
          >
            <div className="mb-6 flex justify-center text-purple-400">
              {feature.icon}
            </div>

            <h3 className="mb-3 text-2xl font-semibold">
              {feature.title}
            </h3>

            <p className="text-gray-400">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}