"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  { question: "How does the AI recommendation work?", answer: "We process a dataset of 30,000 movies using NLTK's stemming tool, convert metadata into vectors via Scikit-Learn's CountVectorizer, and calculate Cosine Similarity. Google Gemini AI acts as a semantic layer, translating natural language mood requests into database filters and writing custom pitches." },
  { question: "Are the recommendations instant?", answer: "Yes! Instead of computing heavy vector similarities on the fly (which slows down serverless functions), we pre-compute the top nearest-neighbor recommendations and cache them as JSONB arrays in our Supabase PostgreSQL database for sub-second delivery." },
  { question: "How does the Movie Sync room work?", answer: "Movie Sync creates a real-time WebSocket connection using Supabase Realtime. When group members join via a shared link and swipe on recommendations, the backend matches votes. Once a unanimous match occurs, a broadcast event triggers the winner display with a live confetti blast." },
  { question: "Is CineSense free to use?", answer: "Absolutely. CineSense is a non-commercial portfolio project demonstrating modern WebGL/3D interfaces, Natural Language Processing (NLP), and real-time state synchronization." }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-32">
      <div className="mb-16 text-center">
        <h2 className="text-4xl font-black">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div 
              key={index} 
              className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl overflow-hidden transition-colors hover:bg-white/10"
            >
              <button
                className="flex w-full items-center justify-between p-8 text-left outline-none cursor-none"
                data-magnetic="true"
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span className="text-xl font-bold">{faq.question}</span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-emerald-400"
                >
                  <ChevronDown />
                </motion.div>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    <div className="px-8 pb-8 text-gray-400 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
