"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../utils/supabase";
import { useUISound } from "../hooks/useUISound";

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { signInWithGoogle } = useAuth();
  const { playClick, playHover } = useUISound();
  
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    playClick();
    setLoading(true);
    setError("");

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/update-password',
        });
        if (error) throw error;
        setError("Password reset link sent! Check your email.");
      } else if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onClose();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError("Check your email for the confirmation link!");
      }
    } catch (err) {
      setError((err as Error).message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    playClick();
    await signInWithGoogle();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => { playClick(); onClose(); }}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f16] shadow-2xl"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(124,58,237,0.3)_360deg)]"
            />
          </div>

          <div className="relative z-10 p-8">
            <button
              onClick={() => { playClick(); onClose(); }}
              onMouseEnter={playHover}
              className="absolute right-6 top-6 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-8 text-center">
              <h2 className="text-3xl font-black bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
                {isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                {isForgotPassword ? "Enter your email to receive a reset link" : isLogin ? "Sign in to access your CineSense watchlist" : "Join CineSense to save your favorite movies"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>

              {!isForgotPassword && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    required
                    minLength={6}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-12 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => { playClick(); setShowPassword(!showPassword); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              )}

              {!isForgotPassword && isLogin && (
                <button
                  type="button"
                  onClick={() => { playClick(); setIsForgotPassword(true); setError(""); }}
                  className="text-sm font-medium text-violet-400 hover:text-violet-300 text-right mt-[-8px]"
                >
                  Forgot password?
                </button>
              )}

              {error && (
                <p className={`text-sm ${error.includes("sent") || error.includes("Check your email") ? "text-emerald-400" : "text-red-400"}`}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                onMouseEnter={playHover}
                className="mt-2 w-full rounded-xl bg-violet-600 py-3 font-bold text-white hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#0a0f16] transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : isForgotPassword ? "Send Reset Link" : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            {isForgotPassword ? (
              <p className="mt-8 text-center text-sm text-gray-400">
                Remember your password?{" "}
                <button
                  onClick={() => { playClick(); setIsForgotPassword(false); setError(""); }}
                  className="font-bold text-violet-400 hover:text-violet-300"
                >
                  Back to login
                </button>
              </p>
            ) : (
              <>
                <div className="my-6 flex items-center gap-4">
                  <div className="h-[1px] flex-1 bg-white/10" />
                  <span className="text-xs font-medium uppercase text-gray-500">Or continue with</span>
                  <div className="h-[1px] flex-1 bg-white/10" />
                </div>

                <button
                  onClick={handleGoogleAuth}
                  onMouseEnter={playHover}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-3 font-medium text-white hover:bg-white/10 transition-all"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Google
                </button>

                <p className="mt-8 text-center text-sm text-gray-400">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => { playClick(); setIsLogin(!isLogin); setError(""); }}
                    className="font-bold text-violet-400 hover:text-violet-300"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
