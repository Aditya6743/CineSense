"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { supabase } from "@/utils/supabase";
import { Loader2, Link as LinkIcon, Users, Share2, X } from "lucide-react";

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
const GROUP_SIZES = [2, 3, 4, 5, 6, 10];

export default function MovieSyncModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { user, loading: authLoading, setAuthModalOpen } = useAuth();
  const router = useRouter();
  
  const [vibe, setVibe] = useState("Surprise Us");
  const [language, setLanguage] = useState("Any");
  const [targetVotes, setTargetVotes] = useState(2);
  const [loading, setLoading] = useState(false);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setTimeout(() => {
        setGeneratedLink(null);
        setVibe("Surprise Us");
        setLanguage("Any");
        setTargetVotes(2);
      }, 300);
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

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
          target_votes: targetVotes,
          movies: data.movies
        }])
        .select()
        .single();

      if (error) throw error;

      // 3. Show the link to the user
      const link = `${window.location.origin}/match/${sessionData.id}`;
      setGeneratedLink(link);

    } catch (err: any) {
      console.error(err);
      alert("Failed to create sync session: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nativeShare = () => {
    if (generatedLink && 'share' in navigator) {
      navigator.share({
        title: 'Join my Movie Sync!',
        text: 'Stop arguing about what to watch. Vote on these AI-curated movies with me!',
        url: generatedLink,
      }).catch(console.error);
    } else {
      copyToClipboard();
    }
  };

  if (!mounted || authLoading) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-12">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020305]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl bg-[#0a0f16]/90 backdrop-blur-2xl border border-blue-500/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                  <Users className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">Movie <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Sync</span></h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 md:p-8 overflow-y-auto">
              <AnimatePresence mode="wait">
                {!generatedLink ? (
                  <motion.div
                    key="setup"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                  >
                    <p className="text-gray-400 mb-8 text-lg">
                      Generate a link, vote on 10 AI-curated movies together, and sync up on the perfect choice!
                    </p>

                    {/* Group Size Selection */}
                    <div className="mb-8">
                      <label className="block text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">
                        1. Group Size (How many people voting?)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {GROUP_SIZES.map(size => (
                          <button
                            key={size}
                            onClick={() => setTargetVotes(size)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              targetVotes === size 
                                ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-400" 
                                : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10"
                            }`}
                          >
                            {size} People
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Vibe Selection */}
                    <div className="mb-8">
                      <label className="block text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">
                        2. Pick a Vibe
                      </label>
                      <div className="flex flex-wrap gap-2">
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
                    <div className="mb-8">
                      <label className="block text-sm font-bold tracking-widest text-gray-400 uppercase mb-4">
                        3. Preferred Language
                      </label>
                      <div className="flex flex-wrap gap-2">
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
                        onClick={() => { onClose(); setAuthModalOpen(true); }}
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
                ) : (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-gradient-to-b from-blue-500/10 to-indigo-900/20 backdrop-blur-xl border border-blue-500/30 p-8 rounded-2xl text-center relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    <h2 className="text-3xl font-black text-white mb-2">Room Created! 🍿</h2>
                    <p className="text-gray-300 mb-8">Share this link with your group. They don't need an account to join.</p>
                    
                    <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
                      <div className="flex-1 w-full bg-black/40 border border-white/10 p-4 rounded-xl font-mono text-sm text-blue-200 truncate">
                        {generatedLink}
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={copyToClipboard}
                          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all font-bold text-white"
                          title="Copy Link"
                        >
                          {copied ? "Copied!" : "Copy"}
                        </button>

                        {typeof navigator !== 'undefined' && 'share' in navigator && (
                          <button
                            onClick={nativeShare}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-xl transition-all font-bold shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                            title="Share Link"
                          >
                            <Share2 className="w-5 h-5" /> Share
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-white/10 pt-8">
                      <button
                        onClick={() => {
                          onClose();
                          router.push(generatedLink.replace(window.location.origin, ''));
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-black text-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)]"
                      >
                        Join Room Now →
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
