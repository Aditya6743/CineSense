"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  { question: "How does the AI recommendation work?", answer: "We use a TF-IDF vectorizer to extract metadata from over 5,000 movies. We then calculate the cosine similarity between your searched movie and the entire dataset to find mathematically perfect matches." },
  { question: "Are the recommendations real-time?", answer: "Yes! Our FastAPI backend computes similarities on the fly and retrieves the latest posters and ratings asynchronously from the TMDB API in milliseconds." },
  { question: "Is this free to use?", answer: "Absolutely. CineSense is an open-source demonstration of advanced UI/UX and Machine Learning capabilities." },
  { question: "Why do some movies not show up?", answer: "Our current dataset is limited to 5,000 highly curated movies. If a movie is too obscure or very recent, it might not be in the vector database." }
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
