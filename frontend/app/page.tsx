"use client";

import { useState, useEffect, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
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
import BackgroundGraphic from "../components/BackgroundGraphic";
import Scene3D from "../components/Scene3D";
import MovieModal from "../components/Moviemodal";
import { useTheme } from "../components/ThemeProvider";

function MainContent() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [shouldShowPreloader, setShouldShowPreloader] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const { accentColor } = useTheme();

  useEffect(() => {
    // Check if we've already loaded the app in this session
    if (sessionStorage.getItem("cinesense_loaded") === "true") {
      setIsLoaded(true);
      setShouldShowPreloader(false);
    }
  }, []);

  const handlePreloaderComplete = () => {
    setIsLoaded(true);
    setShouldShowPreloader(false);
    sessionStorage.setItem("cinesense_loaded", "true");
  };

  return (
    <main 
      className="relative min-h-screen text-white overflow-x-hidden selection:bg-emerald-500/30 transition-colors duration-1000"
      style={{
        '--accent': accentColor,
      } as React.CSSProperties}
    >
      {shouldShowPreloader && <Preloader onComplete={handlePreloaderComplete} />}
      
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
          <div id="home" className="relative z-10 pointer-events-auto">
            <Hero />
          </div>
          
          {/* 
            3D SCROLL AREA 
            The first 300vh of scrolling flies the camera through the 3D Poster Sphere and Neon Tunnel.
            The canvas is fixed behind this transparent spacer.
          */}
          <div className="h-[450vh] w-full pointer-events-none" />

          {/* RESTORED HTML SECTIONS (Wall of love, Trending, etc.) */}
          <div className="relative w-full z-10 bg-[#020305]/90 backdrop-blur-md pointer-events-auto flex flex-col gap-12 overflow-hidden border-t border-white/5">
            <div className="relative z-10 flex flex-col gap-12 pt-12">
              <BackgroundGraphic />
              <div id="trending">
                <Trending />
              </div>
              <Timeline />
            <Testimonials />
            <FAQ />
            <CTA />
            <Footer />
            </div>
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
    <MainContent />
  );
}