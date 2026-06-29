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
import MovieModal from "../components/Moviemodal";
import { ThemeProvider, useTheme } from "../components/ThemeProvider";

function MainContent() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const { accentColor } = useTheme();

  return (
    <main 
      className="relative min-h-screen text-white overflow-x-hidden selection:bg-emerald-500/30 transition-colors duration-1000"
      style={{
        '--accent': accentColor,
      } as React.CSSProperties}
    >
      <Preloader onComplete={() => setIsLoaded(true)} />
      
      <CustomCursor />
      
      {isLoaded && (
        <>
          {/* Global 3D WebGL Background (Replaces 2D glows/graphics) */}
          <div className="fixed inset-0 z-0 pointer-events-auto">
            <Canvas
              camera={{ position: [0, 0, 5], fov: 75 }}
              gl={{ antialias: false, alpha: false, powerPreference: "high-performance" }}
              dpr={[1, 1.5]} // Cap resolution on high-DPI displays to maintain 120FPS
            >
              <color attach="background" args={["#020305"]} />
              <Suspense fallback={null}>
                <Scene3D onMovieSelect={setSelectedMovie} />
              </Suspense>
            </Canvas>
          </div>

          <div className="relative z-50 pointer-events-auto">
            <Navbar />
          </div>
          {/* We keep Hero for the SearchBar functionality */}
          <div className="relative z-10 pointer-events-auto">
            <Hero />
          </div>
          
          {/* 
            3D SCROLL AREA 
            The first 300vh of scrolling flies the camera through the 3D Poster Sphere and Neon Tunnel.
            The canvas is fixed behind this transparent spacer.
          */}
          <div className="h-[300vh] w-full pointer-events-none" />

          {/* RESTORED HTML SECTIONS (Wall of love, Trending, etc.) */}
          <div className="relative w-full z-10 bg-[#020305]/80 backdrop-blur-md pointer-events-auto flex flex-col gap-12">
            {/* 
              We add a dark glassmorphic background to the restored sections 
              so the 3D canvas doesn't visually clash with the text once you scroll down.
            */}
            <Trending />
            <Timeline />
            <Testimonials />
            <FAQ />
            <CTA />
            <Footer />
          </div>

          {/* Render MovieModal over everything */}
          <div className="relative z-[100] pointer-events-auto">
            <MovieModal 
              movie={selectedMovie}
              onClose={() => setSelectedMovie(null)}
            />
          </div>
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