"use client";

import { useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Trending from "../components/Trending";
import Timeline from "../components/Timeline";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";
import CustomCursor from "../components/CustomCursor";
import Preloader from "../components/Preloader";
import CTA from "../components/CTA";
import Scene3D from "../components/Scene3D";
import { ThemeProvider, useTheme } from "../components/ThemeProvider";

function MainContent() {
  const [isLoaded, setIsLoaded] = useState(false);
  const { accentColor } = useTheme();

  return (
    <main 
      className="relative min-h-screen text-white overflow-hidden selection:bg-emerald-500/30 transition-colors duration-1000"
      style={{
        '--accent': accentColor,
      } as React.CSSProperties}
    >
      <Preloader onComplete={() => setIsLoaded(true)} />
      
      <CustomCursor />
      
      {isLoaded && (
        <>
          {/* Global 3D WebGL Background (Replaces 2D glows/graphics) */}
          <div className="fixed inset-0 z-[-1] pointer-events-none">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 75 }}
              gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
              dpr={[1, 1.5]} // Cap resolution on high-DPI displays to maintain 120FPS
            >
              <color attach="background" args={["#020305"]} />
              <Suspense fallback={null}>
                <Scene3D />
              </Suspense>
            </Canvas>
          </div>

          <Navbar />
          {/* We keep Hero for the SearchBar functionality, but make it interact with the 3D later */}
          <div className="relative z-10 pointer-events-auto">
            <Hero />
          </div>
          
          {/* 
            MASSIVE INVISIBLE SCROLL AREA 
            Since we deleted the traditional HTML sections, we must force the DOM to be 
            tall enough to allow the user to scroll through the 3D universes (Sphere & Tunnel).
          */}
          <div className="h-[800vh] w-full pointer-events-none" />
        </>
      )}
    </main>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <MainContent />
    </ThemeProvider>
  );
}