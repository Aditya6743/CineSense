"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import AuthModal from "./AuthModal";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthModalOpen: false,
  setAuthModalOpen: () => {},
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Fallback manual check for password recovery hash (in case event is missed)
    if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
      router.push('/update-password' + window.location.hash);
    }

    // Check active sessions and sets the user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.auth.getSession().then((res: any) => {
      const session = res?.data?.session;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } = supabase.auth.onAuthStateChange((event: any, session: any) => {
      if (event === 'PASSWORD_RECOVERY') {
        router.push('/update-password' + window.location.hash);
      }
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        skipBrowserRedirect: true,
      },
    });
    
    if (error) throw error;
    if (data?.url) {
      window.location.assign(data.url);
    } else {
      throw new Error("No URL returned from Supabase for Google Auth");
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthModalOpen, setAuthModalOpen, signInWithGoogle, signOut }}>
      {children}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
