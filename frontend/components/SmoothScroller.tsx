"use client";

import { ReactLenis } from 'lenis/react';
import type { LenisRef } from 'lenis/react';
import gsap from 'gsap';
import { useEffect, useRef } from 'react';

export default function SmoothScroller({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    // Sync Lenis with GSAP ScrollTrigger
    gsap.ticker.add((time) => {
      lenisRef.current?.lenis?.raf(time * 1000);
    });
    
    gsap.ticker.lagSmoothing(0);
    
    return () => {
      gsap.ticker.remove((time) => {
        lenisRef.current?.lenis?.raf(time * 1000);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ReactLenis root ref={lenisRef} autoRaf={false} options={{ lerp: 0.08, duration: 1.5, smoothWheel: true }}>
      {children}
    </ReactLenis>
  );
}
