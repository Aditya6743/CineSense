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
      <div className="absolute top-0 left-0 w-full z-10 p-8 pointer-events-none flex flex-col items-center text-center mt-12">
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter bg-gradient-to-r from-white via-blue-200 to-gray-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          Constellations
        </h1>
        <p className="text-gray-300 mt-4 max-w-lg text-sm md:text-base bg-black/20 backdrop-blur-sm p-4 rounded-2xl border border-white/5">
          Explore the endless universe of cinema. Click on any movie to fly towards it and uncover its hidden connections.
        </p>
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
