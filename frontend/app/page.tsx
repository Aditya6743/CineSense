"use client";

import { useState } from "react";
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
          {/* Global Background Glows that adapt to theme */}
          <div 
            className="pointer-events-none absolute left-[-200px] top-[-150px] h-[500px] w-[500px] rounded-full blur-[150px] transition-colors duration-1000" 
            style={{ backgroundColor: `${accentColor}20` }} // 20% opacity hex equivalent approx
          />
          <div 
            className="pointer-events-none absolute right-[-150px] top-[1500px] h-[600px] w-[600px] rounded-full blur-[150px] transition-colors duration-1000" 
            style={{ backgroundColor: `${accentColor}15` }}
          />
          <div 
            className="pointer-events-none absolute left-[-150px] top-[3000px] h-[700px] w-[700px] rounded-full blur-[170px] transition-colors duration-1000" 
            style={{ backgroundColor: `${accentColor}10` }}
          />

          {/* Grid overlay for texture */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] pointer-events-none mix-blend-overlay" />

          <BackgroundGraphic />

          <Navbar />
          <Hero />
          <Trending />
          <Timeline />
          <Testimonials />
          <FAQ />
          <CTA />
          <Footer />
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