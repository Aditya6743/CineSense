"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackgroundGraphic from "@/components/BackgroundGraphic";
import { supabase } from "@/utils/supabase";
import { Loader2, Link as LinkIcon, Heart, Users } from "lucide-react";

export default function MatchSetupPage() {
  const { user, loading: authLoading, setAuthModalOpen } = useAuth();
  const router = useRouter();
  
  const [vibe, setVibe] = useState("Surprise Us");
  const [language, setLanguage] = useState("Any");
  const [loading, setLoading] = useState(false);

  const VIBES = [
    "Surprise Us 🎲",
    "Spine-chilling Horror 👻",
    "Laugh Out Loud Comedy 😂",
    "Mind-bending Sci-Fi 🤯",
    "Heartwarming Drama 💖",
    "High-Octane Action 💥",
    "Deep Psychological Thriller 🕵️"
  ];

  const LANGUAGES = ["Any", "English", "Hindi"];

  const handleCreateSession = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setLoading(true);
    try {
      // 1. Generate movies from AI
      const res = await fetch("/api/match/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibe, language })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || "Failed to generate movies");
      if (!data.movies || data.movies.length === 0) throw new Error("AI returned no movies");

      // 2. Save session to Supabase
      const { data: sessionData, error } = await supabase
        .from("match_sessions")
        .insert([{
          creator_id: user.id,
          vibe,
          language,
          movies: data.movies
        }])
        .select()
        .single();

      if (error) throw error;

      // 3. Redirect to the swipe page
      router.push(`/match/${sessionData.id}`);

    } catch (err: any) {
      console.error(err);
      alert("Failed to create sync session: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-[#020305] pt-32 pb-24 text-white overflow-hidden flex flex-col items-center justify-center">
        <BackgroundGraphic />
        
        <div className="mx-auto w-full max-w-2xl px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/30 mb-6">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-4">
              Movie <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Sync</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-lg mx-auto">
              Stop arguing about what to watch with your friends or family. Generate a link, vote on 10 AI-curated movies together, and sync up on the perfect choice!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl"
          >
            {/* Vibe Selection */}
            <div className="mb-8">
              <label className="block text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">
                1. Pick a Vibe
              </label>
              <div className="flex flex-wrap gap-3">
                {VIBES.map(v => (
                  <button
                    key={v}
                    onClick={() => setVibe(v)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      vibe === v 
                        ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-400" 
                        : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selection */}
            <div className="mb-10">
              <label className="block text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">
                2. Preferred Language
              </label>
              <div className="flex flex-wrap gap-3">
                {LANGUAGES.map(l => (
                  <button
                    key={l}
                    onClick={() => setLanguage(l)}
                    className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      language === l 
                        ? "bg-purple-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] border border-purple-400" 
                        : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            {!user ? (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="w-full py-4 rounded-xl font-bold text-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Users className="w-5 h-5" /> Sign in to Create Sync Session
              </button>
            ) : (
              <button
                onClick={handleCreateSession}
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-lg text-white shadow-xl transition-all flex items-center justify-center gap-2 ${
                  loading 
                    ? "bg-blue-500/50 cursor-not-allowed" 
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Curating Movies via AI...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-5 h-5" /> Generate Shareable Link
                  </>
                )}
              </button>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}
