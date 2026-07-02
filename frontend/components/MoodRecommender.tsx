"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, RefreshCcw, Loader2, X } from "lucide-react";
import MovieCard from "./MovieCard";

const QUESTIONS = [
  {
    id: "feeling",
    title: "How are you feeling?",
    options: ["Happy 😊", "Sad 😢", "Adventurous 🧗", "Chill 🛋️", "Stressed 😫", "Romantic 💖"],
  },
  {
    id: "vibe",
    title: "What's the vibe you're looking for?",
    options: ["Mind-Bending 🤯", "Lighthearted 😂", "Action-Packed 💥", "Scary 👻", "Inspiring ✨", "Mystery 🔍"],
  },
  {
    id: "gimmick",
    title: "Who's your ideal movie companion?",
    options: ["A cute dog 🐶", "A spooky ghost 👻", "An alien 👽", "A mad scientist 🧪", "Just me & pizza 🍕"],
  }
];

export default function MoodRecommender({ isOpen, onClose, onMovieClick }: { isOpen: boolean, onClose: () => void, onMovieClick: (movie: any) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({ feeling: "", vibe: "", gimmick: "", custom: "" });
  const [customInput, setCustomInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setTimeout(reset, 300);
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleSelect = (option: string) => {
    const key = QUESTIONS[currentStep].id as keyof typeof answers;
    setAnswers({ ...answers, [key]: option });
    
    // Move to next step (including custom text step)
    setTimeout(() => setCurrentStep(currentStep + 1), 300);
  };

  const handleCustomSubmit = () => {
    fetchRecommendation({ ...answers, custom: customInput });
  };

  const fetchRecommendation = async (finalAnswers: typeof answers) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/recommend-mood`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalAnswers),
      });
      
      if (!res.ok) {
        let errorMsg = "Couldn't find a match right now.";
        try {
          const errData = await res.json();
          errorMsg = errData.detail || errorMsg;
        } catch(e) {}
        throw new Error(errorMsg);
      }
      
      const data = await res.json();
      if (data.recommendations && data.recommendations.length > 0) {
        setResult(data.recommendations[0]);
      }
    } catch (err: any) {
      console.error(err);
      setResult({ error: `Error: ${err.message}` });
    }
    setLoading(false);
  };

  const reset = () => {
    setAnswers({ feeling: "", vibe: "", gimmick: "", custom: "" });
    setCustomInput("");
    setCurrentStep(0);
    setResult(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-4xl relative z-10"
          >
            <div className="rounded-[40px] border border-white/10 bg-[#0a0f16] p-8 md:p-12 shadow-[0_0_80px_rgba(236,72,153,0.15)] relative overflow-hidden">
              
              <button 
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition z-50"
              >
                <X className="w-6 h-6" />
              </button>
              
              {/* Decorative elements - Using opacity and fast CSS properties to avoid blur lag */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-fuchsia-500/10 to-transparent rounded-full pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-violet-500/10 to-transparent rounded-full pointer-events-none" />

              <div className="text-center mb-8 relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-400 text-sm font-semibold mb-4">
                  <Sparkles className="w-4 h-4" /> AI Mood Matcher
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                  Can&apos;t Decide What to Watch?
                </h2>
              </div>

              <div className="max-w-3xl mx-auto min-h-[300px] flex items-center justify-center relative z-10">
                <AnimatePresence mode="wait">
                  {!loading && !result && (
                    <motion.div
                      key={`step-${currentStep}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="w-full"
                    >
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl md:text-3xl font-bold text-white">
                          {currentStep < QUESTIONS.length ? QUESTIONS[currentStep].title : "Any specific details? (Optional)"}
                        </h3>
                        <span className="text-gray-500 font-mono text-sm">
                          {currentStep + 1} / {QUESTIONS.length + 1}
                        </span>
                      </div>
                      
                      {currentStep < QUESTIONS.length ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {QUESTIONS[currentStep].options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => handleSelect(opt)}
                              className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-fuchsia-500/30 text-white font-medium transition-colors flex items-center justify-between group"
                            >
                              {opt}
                              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-fuchsia-400 -translate-x-2 group-hover:translate-x-0 transform duration-300" />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <textarea 
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="e.g. A movie with a huge plot twist at the end, set in space, and something that makes me think..."
                            className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-fuchsia-500/50 resize-none mb-6 placeholder:text-gray-500"
                          />
                          <div className="flex gap-4 w-full sm:w-auto">
                            <button 
                              onClick={handleCustomSubmit} 
                              className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-bold transition-all flex items-center justify-center gap-2 group"
                            >
                              <Sparkles className="w-4 h-4" />
                              {customInput.trim() ? "Find My Movie" : "Skip & Find Movie"}
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {loading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex flex-col items-center text-center"
                    >
                      <Loader2 className="w-12 h-12 text-fuchsia-400 animate-spin mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2">Analyzing your mood...</h3>
                      <p className="text-gray-400">Searching millions of combinations for the perfect match.</p>
                    </motion.div>
                  )}

                  {result && !loading && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="w-full flex flex-col md:flex-row items-center gap-12"
                    >
                      {result.error ? (
                        <div className="text-center w-full">
                          <p className="text-red-400 text-xl mb-6">{result.error}</p>
                          <button onClick={reset} className="px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition flex items-center gap-2 mx-auto">
                            <RefreshCcw className="w-4 h-4" /> Try Again
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-full md:w-1/3 max-w-[280px]">
                            <MovieCard
                              title={result.title}
                              poster={result.poster}
                              rating={result.rating}
                              release_date={result.release_date}
                              overview={result.overview}
                              onClick={() => {
                                onMovieClick(result);
                                onClose();
                              }}
                            />
                          </div>
                          <div className="w-full md:w-2/3 text-left">
                            <div className="inline-block px-3 py-1 rounded-full bg-fuchsia-500/20 text-fuchsia-300 text-sm font-bold mb-4">
                              Your Perfect Match 🎯
                            </div>
                            <h3 className="text-4xl font-black text-white mb-4">{result.title}</h3>
                            <p className="text-xl text-fuchsia-200 italic mb-6 leading-relaxed">
                              &quot;{result.ai_reason}&quot;
                            </p>
                            
                            <div className="flex items-center gap-4">
                              <button 
                                onClick={() => {
                                  onMovieClick(result);
                                  onClose();
                                }}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.5)]"
                              >
                                View Details
                              </button>
                              <button 
                                onClick={reset}
                                className="px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 transition flex items-center gap-2"
                              >
                                <RefreshCcw className="w-4 h-4" /> Reset
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
