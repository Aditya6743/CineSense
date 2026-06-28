"use client";

import { ReactLenis } from 'lenis/react';
import type { LenisRef } from 'lenis/react';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

export default function SmoothScroller({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    const currentLenis = lenisRef.current;
    if (!currentLenis) return;
    
    // Sync Lenis with GSAP ScrollTrigger
    // This is crucial for scroll-triggered animations to remain perfectly synced with the smooth scroll
    gsap.ticker.add((time) => {
      currentLenis?.lenis?.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);
    
    return () => {
      gsap.ticker.remove((time) => {
        currentLenis?.lenis?.raf(time * 1000);
      });
    };
  }, []);

  return (
    <ReactLenis root ref={lenisRef} autoRaf={false} options={{ lerp: 0.08, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
