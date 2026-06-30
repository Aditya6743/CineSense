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
      {/* HUD Instructions */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 w-max max-w-[90%] pointer-events-none flex flex-col items-center text-center">
        <div className="bg-[#050510]/50 backdrop-blur-xl py-4 px-8 rounded-full border border-white/10 shadow-[0_0_30px_rgba(78,92,255,0.2)]">
          <h1 className="text-lg md:text-xl font-bold tracking-widest text-white/90 uppercase drop-shadow-md flex items-center justify-center gap-2 mb-1">
            <span className="text-[#6b7cff]">✦</span> Constellations <span className="text-[#6b7cff]">✦</span>
          </h1>
          <p className="text-gray-300/80 text-xs md:text-sm font-medium tracking-wide">
            Drag to rotate <span className="mx-2 opacity-50">•</span> Scroll to zoom <span className="mx-2 opacity-50">•</span> Click any poster to expand the network
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
