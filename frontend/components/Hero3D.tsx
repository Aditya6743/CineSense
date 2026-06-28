"use client";

/* eslint-disable react-hooks/purity */

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Points, PointMaterial, Html } from "@react-three/drei";
import * as THREE from "three";

function Particles({ count = 300, color = "#7C5CFF", speed = 1, parallax = 0.5, radius = 2.5 }: { count?: number, color?: string, speed?: number, parallax?: number, radius?: number }) {
  const ref = useRef<THREE.Points>(null);
  
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Generate points in a sphere shell
      const r = radius + Math.random() * 1.5;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);
      p[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      p[i * 3 + 2] = r * Math.cos(phi);
    }
    return p;
  }, [count, radius]);

  useFrame((state, delta) => {
    if (ref.current) {
      // Base continuous rotation
      ref.current.rotation.x -= delta * 0.05 * speed;
      ref.current.rotation.y -= delta * 0.07 * speed;
      
      // Magnetic parallax effect based on cursor
      const targetX = state.mouse.x * parallax;
      const targetY = state.mouse.y * parallax;
      
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, targetX, 0.05);
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, targetY, 0.05);
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial 
        transparent 
        color={color} 
        size={0.03} 
        sizeAttenuation={true} 
        depthWrite={false} 
        blending={THREE.AdditiveBlending} 
      />
    </Points>
  );
}

import { Film } from "lucide-react";
import { motion } from "framer-motion";

function HolographicOrb() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    // Magnetic mouse tracking
    const targetX = state.mouse.x * 1.5;
    const targetY = state.mouse.y * 1.5;
    
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
    
    // Smooth 3D tilt based on mouse position
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -state.mouse.y * 0.5, 0.05);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, state.mouse.x * 0.5, 0.05);
  });

  return (
    <Float floatIntensity={3} rotationIntensity={1} speed={2}>
      <group ref={groupRef}>
        <Html transform center distanceFactor={12}>
          <div className="relative flex h-20 w-20 items-center justify-center">
            {/* Outer Rotating Square */}
            <motion.div 
              animate={{ 
                rotate: 360,
                boxShadow: [
                  "0 0 20px rgba(124,92,255,0.4), inset 0 0 10px rgba(255,255,255,0.1)",
                  "0 0 40px rgba(124,92,255,0.8), inset 0 0 15px rgba(255,255,255,0.3)",
                  "0 0 20px rgba(124,92,255,0.4), inset 0 0 10px rgba(255,255,255,0.1)"
                ]
              }}
              transition={{ 
                rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 4, repeat: Infinity, ease: "easeInOut" }
              }}
              className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-br from-violet-600/30 to-blue-600/30 border border-white/20"
            />
            
            {/* Static Inner Logo (Smaller) */}
            <div className="relative z-10 flex items-center justify-center">
              <Film className="w-10 h-10 text-violet-400 drop-shadow-[0_0_10px_rgba(167,139,250,0.6)]" />
            </div>
          </div>
        </Html>
      </group>
    </Float>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
      <Canvas camera={{ position: [0, 0, 7], fov: 50 }} gl={{ antialias: true, alpha: true }}>
        <fog attach="fog" args={["#070B1A", 5, 15]} />
        {/* Layer 1: Slow, deep particles */}
        <Particles count={210} color="#7C5CFF" speed={0.8} parallax={0.3} radius={2.0} />
        {/* Layer 2: Mid-speed particles */}
        <Particles count={210} color="#4EA8FF" speed={1.2} parallax={0.6} radius={2.8} />
        {/* Layer 3: Fast, outer particles */}
        <Particles count={140} color="#D946EF" speed={1.5} parallax={0.9} radius={3.5} />
        <HolographicOrb />
      </Canvas>
    </div>
  );
}
