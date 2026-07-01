"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight, Home } from "lucide-react";
import { supabase } from "../../utils/supabase";
import { useRouter } from "next/navigation";
import AmbientCanvas from "../../components/AmbientCanvas";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.auth.getSession().then(({ error }: any) => {
      if (error) {
        console.error("Session error:", error);
      }
    });
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 3000);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-hidden flex items-center justify-center p-4 bg-[#020305]">
      <div className="noise-bg" />
      <AmbientCanvas />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0f16] shadow-2xl p-8"
      >
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_340deg,rgba(124,58,237,0.3)_360deg)]"
          />
        </div>

        <div className="relative z-10">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
              Update Password
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Enter a new, strong password for your account.
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="mb-6 mx-auto w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Password Updated!</h3>
              <p className="text-gray-400 mb-6">You will be redirected to the homepage in a moment.</p>
              <button
                onClick={() => router.push("/")}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-white/10 hover:bg-white/20 py-3 font-bold text-white transition-colors"
              >
                <Home className="w-4 h-4" /> Go Home Now
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="New Password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all"
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 group flex items-center justify-center gap-2 w-full rounded-xl bg-violet-600 py-3 font-bold text-white hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#0a0f16] transition-all disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Password"}
                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
