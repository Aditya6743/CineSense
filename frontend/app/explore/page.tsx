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
      {/* Top Heading & Identity */}
      <div className="absolute top-24 left-6 md:left-10 z-10 pointer-events-none flex flex-col">
        <h1 className="text-2xl md:text-3xl font-black tracking-widest text-white/90 uppercase drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          Constellations
        </h1>
        <div className="h-[2px] w-12 bg-[#6b7cff] mt-2 mb-3 rounded-full shadow-[0_0_10px_rgba(107,124,255,0.8)]" />
        <p className="text-gray-300/90 text-sm font-medium tracking-wide">
          Discover AI-mapped movie connections.
        </p>
      </div>

      {/* HUD Instructions (Controls only) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-max max-w-[95%] pointer-events-none flex flex-col items-center text-center">
        <div className="bg-[#050510]/60 backdrop-blur-xl py-3 px-6 md:px-8 rounded-full border border-white/10 shadow-[0_0_30px_rgba(78,92,255,0.2)]">
          <p className="text-gray-300/80 text-[10px] md:text-xs font-bold tracking-widest uppercase">
            Drag to rotate <span className="mx-2 opacity-40">|</span> Scroll to zoom <span className="mx-2 opacity-40">|</span> Click poster to expand
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
              luminanceThreshold={0.9}
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
