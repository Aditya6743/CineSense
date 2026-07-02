"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase";
import { useAuth } from "@/components/AuthContext";
import { Loader2, X, Heart, Popcorn } from "lucide-react";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

export default function MatchSwipePage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const { width, height } = useWindowSize();

  const [session, setSession] = useState<any>(null);
  const [userName, setUserName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [myVotes, setMyVotes] = useState<string[]>([]);

  useEffect(() => {
    if (user && !hasJoined) {
      setUserName(user.email?.split('@')[0] || "Host");
    }
  }, [user, hasJoined]);

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase
        .from("match_sessions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("Session not found or expired.");
      } else {
        setSession(data);
      }
      setLoading(false);
    };
    if (id) fetchSession();
  }, [id]);

  // Polling for matches
  useEffect(() => {
    if (!hasJoined || !session || matchResult) return;

    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("match_votes")
        .select("movie_title")
        .eq("session_id", id)
        .eq("vote", true);

      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((v: any) => {
          counts[v.movie_title] = (counts[v.movie_title] || 0) + 1;
          const target = session.target_votes || 2;
          if (counts[v.movie_title] >= target) {
            // MATCH FOUND!
            const matchedMovie = session.movies.find((m: any) => m.title === v.movie_title);
            if (matchedMovie) setMatchResult(matchedMovie);
          }
        });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [hasJoined, session, id, matchResult]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim()) setHasJoined(true);
  };

  const handleVote = async (movie: any, vote: boolean) => {
    if (vote) setMyVotes(prev => [...prev, movie.title]);
    setCurrentIndex(prev => prev + 1);

    await supabase.from("match_votes").insert([{
      session_id: id,
      user_identifier: userName,
      movie_title: movie.title,
      vote
    }]);
  };

  if (loading || authLoading) {
    return <div className="min-h-screen bg-[#020305] flex items-center justify-center text-white"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  if (error || !session) {
    return <div className="min-h-screen bg-[#020305] flex items-center justify-center text-white font-bold text-xl">{error}</div>;
  }

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-[#020305] flex flex-col items-center justify-center text-white p-6">
        <div className="w-full max-w-md bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-xl text-center shadow-2xl">
          <Popcorn className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-black mb-2">Join Movie Sync</h1>
          <p className="text-gray-400 mb-8">Enter your name to start voting on movies!</p>
          <form onSubmit={handleJoin} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors"
              required
            />
            <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.4)]">
              Start Voting
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (matchResult) {
    return (
      <div className="min-h-screen bg-[#020305] flex flex-col items-center justify-center text-white p-6 relative overflow-hidden">
        <Confetti width={width} height={height} recycle={false} numberOfPieces={500} colors={['#3b82f6', '#6366f1', '#10b981', '#f59e0b', '#ffffff']} />
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-center z-10 w-full max-w-md"
        >
          <div className="inline-block px-6 py-2 rounded-full bg-blue-500/20 border border-blue-500 text-blue-400 font-black tracking-widest uppercase mb-6 animate-pulse">
            WE HAVE A WINNER! 🎉
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
            You're watching <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{matchResult.title}</span> tonight!
          </h1>

          <div className="relative w-full aspect-[2/3] rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_50px_rgba(59,130,246,0.3)] mb-8">
            <img src={matchResult.poster || ""} alt={matchResult.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          </div>

          <a href={`/search?q=${encodeURIComponent(matchResult.title)}`} className="inline-block w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors">
            See Details & Where to Watch
          </a>
        </motion.div>
      </div>
    );
  }

  const movie = session.movies[currentIndex];

  return (
    <div className="min-h-screen bg-[#020305] flex flex-col items-center justify-center text-white p-4 overflow-hidden">
      <div className="w-full max-w-sm relative">
        {/* Progress */}
        <div className="flex justify-between items-center mb-4 text-xs font-bold text-gray-500 uppercase tracking-widest px-2">
          <span>{userName}</span>
          <span>{currentIndex} / {session.movies.length}</span>
        </div>

        <AnimatePresence mode="popLayout">
          {movie ? (
            <motion.div
              key={movie.title}
              initial={{ scale: 0.95, opacity: 0, x: 50 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              exit={{ scale: 0.95, opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full aspect-[2/3] bg-[#0a0f16] rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
            >
              <img src={movie.poster || ""} alt={movie.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />
              
              <div className="absolute bottom-0 w-full p-6 pb-24">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold border border-white/10">
                    ⭐ {movie.rating ? movie.rating.toFixed(1) : "N/A"}
                  </span>
                  <span className="bg-white/20 backdrop-blur-md px-2 py-1 rounded-md text-xs font-bold border border-white/10">
                    {movie.release_date ? movie.release_date.slice(0, 4) : "N/A"}
                  </span>
                </div>
                <h2 className="text-3xl font-black leading-tight mb-2">{movie.title}</h2>
                <p className="text-sm text-gray-300 line-clamp-3">{movie.overview}</p>
              </div>
            </motion.div>
          ) : (
            <div className="w-full aspect-[2/3] flex flex-col items-center justify-center bg-white/5 rounded-3xl border border-white/10 text-center p-8">
              <Loader2 className="w-10 h-10 animate-spin text-pink-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Waiting for friend...</h2>
              <p className="text-gray-400 text-sm">You swiped all movies. Waiting to see if there's a match!</p>
            </div>
          )}
        </AnimatePresence>

        {/* Swipe Buttons */}
        {movie && (
          <div className="absolute -bottom-6 left-0 w-full flex justify-center gap-6 px-4">
            <button
              onClick={() => handleVote(movie, false)}
              className="w-16 h-16 rounded-full bg-[#0a0f16] border-2 border-red-500 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:scale-110"
            >
              <X className="w-8 h-8" />
            </button>
            <button
              onClick={() => handleVote(movie, true)}
              className="w-16 h-16 rounded-full bg-[#0a0f16] border-2 border-emerald-500 flex items-center justify-center text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-110"
            >
              <Heart className="w-8 h-8" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
