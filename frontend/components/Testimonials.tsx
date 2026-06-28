"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  { name: "Sarah J.", text: "CineSense found exactly what I was looking for. The recommendations are scarily accurate.", movie: "Blade Runner 2049" },
  { name: "Mike T.", text: "I've discovered so many hidden gems thanks to the AI. Way better than standard Netflix suggestions.", movie: "Ex Machina" },
  { name: "Emily R.", text: "Fast, beautiful, and the autocomplete search is just a joy to use. 10/10 experience.", movie: "Interstellar" },
  { name: "David L.", text: "The UI is breathtaking. But more importantly, the neural recommendations actually work.", movie: "The Matrix" },
  { name: "Anna K.", text: "I love the Trending section. Always up to date and loads instantly. Amazing app.", movie: "Dune" },
];

export default function Testimonials() {
  return (
    <section className="relative overflow-hidden py-32 bg-black/20">
      <div className="mb-16 text-center px-6">
        <h2 className="text-4xl font-black">Wall of Love</h2>
      </div>

      {/* Infinite Carousel */}
      <div className="flex w-full overflow-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            duration: 30,
            ease: "linear",
            repeat: Infinity,
          }}
          className="flex gap-6 px-3"
          style={{ width: "fit-content" }}
        >
          {/* Duplicate the array to create seamless loop */}
          {[...reviews, ...reviews].map((review, i) => (
            <div 
              key={i} 
              className="w-[400px] shrink-0 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl hover:bg-white/10 transition-colors cursor-grab active:cursor-grabbing"
              data-magnetic="true"
            >
              <div className="flex text-emerald-400 mb-4">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-gray-300 text-lg italic mb-6">&quot;{review.text}&quot;</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg">
                  {review.name[0]}
                </div>
                <div>
                  <h4 className="font-bold text-white">{review.name}</h4>
                  <p className="text-sm text-gray-500">Found: {review.movie}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
