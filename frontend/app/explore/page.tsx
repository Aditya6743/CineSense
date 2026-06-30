"use client";

import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import ConstellationGraph from "@/components/ConstellationGraph";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function ExplorePage() {
  return (
    <main className="w-full h-screen bg-black overflow-hidden relative">
      {/* Top Heading */}
      <div className="absolute top-24 left-8 md:left-12 z-10 pointer-events-none">
        <h1 className="text-2xl md:text-3xl font-black tracking-widest text-white/90 uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          Constellations
        </h1>
        <div className="h-[3px] w-12 bg-[#6b7cff] mt-2 rounded-full shadow-[0_0_10px_rgba(107,124,255,0.8)]" />
      </div>

      {/* HUD Instructions */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-[95%] max-w-2xl pointer-events-none flex flex-col items-center text-center">
        <div className="bg-[#050510]/70 backdrop-blur-2xl py-4 px-6 md:px-10 rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(78,92,255,0.2)] flex flex-col gap-3">
          
          {/* What it is */}
          <p className="text-gray-200 text-sm md:text-base font-medium tracking-wide leading-relaxed">
            <span className="text-[#6b7cff] font-bold mr-1">Discover</span> 
            visually connected movies mapped by AI. Follow the glowing paths to find your next favorite film.
          </p>
          
          <div className="w-full h-[1px] bg-white/10 rounded-full" />

          {/* How to use */}
          <p className="text-gray-400 text-xs font-semibold tracking-widest uppercase">
            Drag to rotate <span className="mx-2 md:mx-3 opacity-40">|</span> Scroll to zoom <span className="mx-2 md:mx-3 opacity-40">|</span> Click poster to expand
          </p>
        </div>
      </div>

      <ErrorBoundary>
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }} className="absolute inset-0">
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <Suspense fallback={null}>
            <ConstellationGraph />
          </Suspense>

          <EffectComposer multisampling={0}>
            <Bloom
              luminanceThreshold={0.2}
              mipmapBlur
              intensity={0.8}
              radius={0.8}
            />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Canvas>
      </ErrorBoundary>
    </main>
  );
}
