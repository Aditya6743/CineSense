"use client";

import { useCallback, useRef, useEffect } from "react";

export function useUISound() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getContext = () => {
    if (typeof window === "undefined") return null;
    if (window.innerWidth < 768) return null; // No sounds on mobile
    if (!audioCtxRef.current) {
      // @ts-ignore
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtxRef.current = new AudioContext();
      }
    }
    // Resume context if suspended (browser autoplay policy)
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Pre-initialize on first user interaction to bypass autoplay restrictions
  useEffect(() => {
    const initAudio = () => {
      getContext();
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
  }, []);

  const playHover = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    
    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      // Extremely subtle, high-pitched, very short "tick"
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      
      gainNode.gain.setValueAtTime(0.0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.015);
    } catch (e) {
      // Ignore audio context errors
    }
  }, []);

  const playClick = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    
    try {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      // Soft, satisfying "pop" for clicks
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.03);
      
      gainNode.gain.setValueAtTime(0.0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.03);
    } catch (e) {
      // Ignore audio context errors
    }
  }, []);

  return { playHover, playClick };
}
