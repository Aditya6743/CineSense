"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sparkles, Environment } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";

function CursorParticles() {
  const { viewport, mouse } = useThree();
  const sparklesRef = useRef<THREE.Group>(null);
  const targetRef = useRef(new THREE.Vector2());

  useFrame(() => {
    if (sparklesRef.current) {
      // Very subtle mouse reaction for the entire particle field
      targetRef.current.x = (mouse.x * viewport.width) / 2;
      targetRef.current.y = (mouse.y * viewport.height) / 2;
      
      sparklesRef.current.position.x += (targetRef.current.x * 0.05 - sparklesRef.current.position.x) * 0.02;
      sparklesRef.current.position.y += (targetRef.current.y * 0.05 - sparklesRef.current.position.y) * 0.02;
    }
  });

  return (
    <group ref={sparklesRef}>
      <Sparkles count={400} scale={20} size={1.5} speed={0.4} opacity={0.3} color="#34d399" />
      <Sparkles count={200} scale={25} size={2} speed={0.2} opacity={0.2} color="#22d3ee" />
    </group>
  );
}

export default function AmbientCanvas() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-60">
      <Canvas camera={{ position: [0, 0, 10], fov: 45 }} dpr={[1, 2]}>
        <color attach="background" args={["#05070A"]} />
        <ambientLight intensity={0.2} />
        <directionalLight position={[10, 10, 5]} intensity={1} color="#34d399" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#22d3ee" />
        <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} castShadow intensity={2} shadow-bias={-0.0001} color="#818cf8" />
        
        {/* Environment for reflections */}
        <Environment preset="city" />

        {/* Removed LiquidBlobs for maximum FPS performance */}

        <CursorParticles />
      </Canvas>
      
      {/* CSS Overlay for extra aurora glow mapping (Pure CSS = High Performance) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-[#05070A]/90 to-[#05070A] mix-blend-multiply" />
    </div>
  );
}
