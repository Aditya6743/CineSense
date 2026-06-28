"use client";

import { useEffect, useRef } from "react";

export function useSoundDesign() {
  const audioCtx = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Only initialize on user interaction to comply with browser autoplay policies
    const initAudio = () => {
      try {
        if (!audioCtx.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioCtx.current = new AudioContextClass();
          }
        }
        if (audioCtx.current && audioCtx.current.state === "suspended") {
          audioCtx.current.resume();
        }
      } catch (e) {
        console.warn("Web Audio API not supported or blocked:", e);
      }
    };
    
    // We attach it to mousedown / keydown globally to ensure it's unlocked
    window.addEventListener("mousedown", initAudio, { once: true });
    window.addEventListener("keydown", initAudio, { once: true });
    
    return () => {
      window.removeEventListener("mousedown", initAudio);
      window.removeEventListener("keydown", initAudio);
      if (audioCtx.current) {
        audioCtx.current.close();
      }
    };
  }, []);

  const playHoverTick = () => {
    try {
      if (!audioCtx.current) return;
      
      const ctx = audioCtx.current;
      if (ctx.state === "suspended") ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      // Quick frequency drop for a click sound
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

      filter.type = "lowpass";
      filter.frequency.value = 1000;

      // Very short envelope
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch (e) {
      console.warn("Hover tick failed:", e);
    }
  };

  const playWhoosh = () => {
    try {
      if (!audioCtx.current) return;
      const ctx = audioCtx.current;
      if (ctx.state === "suspended") ctx.resume();

      // White noise buffer
      const bufferSize = ctx.sampleRate * 0.5; // 0.5 seconds
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(100, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + 0.1);
      filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.4);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noiseSource.start();
      noiseSource.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn("Whoosh sound failed:", e);
    }
  };

  return { playHoverTick, playWhoosh };
}
