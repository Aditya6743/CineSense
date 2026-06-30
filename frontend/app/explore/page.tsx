"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import ConstellationGraph from "@/components/ConstellationGraph";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function ExplorePage() {
  return (
    <main className="w-full h-screen bg-black overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full z-10 p-8 pointer-events-none">
        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          CineSense Constellations
        </h1>
        <p className="text-gray-400 mt-2 max-w-md">
          Explore the endless universe of cinema. Click on any movie to fly towards it and uncover its connections.
        </p>
      </div>

      <ErrorBoundary>
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }} className="absolute inset-0">
          <color attach="background" args={["#000000"]} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <Suspense fallback={null}>
            {/* Start with a wildly popular movie to guarantee connections */}
            <ConstellationGraph initialMovie="Inception" />
          </Suspense>

          <OrbitControls 
            enablePan={false}
            enableZoom={true}
            maxDistance={100}
            minDistance={2}
            dampingFactor={0.05}
          />

          <EffectComposer multisampling={0}>
            <Bloom
              luminanceThreshold={0.2}
              mipmapBlur
              intensity={1.5}
              radius={0.8}
            />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </Canvas>
      </ErrorBoundary>
    </main>
  );
}
