"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Environment, Stars, Float, MeshTransmissionMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useLenis } from "lenis/react";

function CameraRig() {
  const { camera } = useThree();
  const lenis = useLenis();
  
  useFrame((state) => {
    if (!lenis) return;
    
    // lenis.progress goes from 0 to 1
    const progress = lenis.progress;
    
    // Cinematic camera path
    // At top (0), camera is at z=5
    // As we scroll, we move forward through the scene
    camera.position.z = THREE.MathUtils.lerp(5, -20, progress);
    
    // Add subtle bobbing/breathing effect
    camera.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
    camera.position.x = Math.cos(state.clock.elapsedTime * 0.3) * 0.2;
    
    // Look ahead slightly down
    camera.lookAt(0, -1, camera.position.z - 5);
  });
  
  return null;
}

function CinematicDust() {
  const pointsRef = useRef<THREE.Points>(null);
  
  // Procedural geometry for dust particles
  const [particles] = useState(() => {
    const geometry = new THREE.BufferGeometry();
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // Spread over a long tunnel in Z
      positions[i * 3] = (Math.random() - 0.5) * 30; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10; // z
      
      // Cinematic colors: Blues and Purples
      color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5 + Math.random() * 0.5);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geometry;
  });
  
  useFrame((state) => {
    if (!pointsRef.current) return;
    // Slow cinematic rotation
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02;
    pointsRef.current.rotation.z = state.clock.elapsedTime * 0.01;
  });

  return (
    <points ref={pointsRef} geometry={particles}>
      <pointsMaterial
        size={0.05}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function Monoliths() {
  // Create abstract floating glass structures representing different "universes" or sections
  return (
    <>
      {/* Hero Monolith */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh position={[-3, 1, 0]} rotation={[0.2, 0.5, -0.1]}>
          <boxGeometry args={[2, 4, 0.5]} />
          <MeshTransmissionMaterial 
            backside
            thickness={0.5}
            roughness={0.1}
            transmission={1}
            ior={1.5}
            chromaticAberration={0.4}
            color="#4e5cff"
          />
        </mesh>
      </Float>
      
      {/* Trending Monolith */}
      <Float speed={1.5} rotationIntensity={0.8} floatIntensity={2}>
        <mesh position={[4, -2, -8]} rotation={[-0.2, -0.5, 0.1]}>
          <icosahedronGeometry args={[2, 0]} />
          <MeshTransmissionMaterial 
            backside
            thickness={1}
            roughness={0.2}
            transmission={1}
            ior={1.2}
            chromaticAberration={0.8}
            color="#9d4edd"
          />
        </mesh>
      </Float>
      
      {/* Timeline Monolith */}
      <Float speed={3} rotationIntensity={0.2} floatIntensity={1.5}>
        <mesh position={[-2, 3, -15]} rotation={[0.5, 0.2, 0.4]}>
          <torusGeometry args={[1.5, 0.4, 16, 100]} />
          <MeshTransmissionMaterial 
            backside
            thickness={0.2}
            roughness={0}
            transmission={1}
            ior={1.4}
            chromaticAberration={0.2}
            color="#00f5d4"
          />
        </mesh>
      </Float>
    </>
  );
}

export default function Scene3D() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#4e5cff" />
      
      <Environment preset="city" />
      
      {/* Elements */}
      <CameraRig />
      <CinematicDust />
      <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Monoliths />
      
      {/* Post Processing */}
      <EffectComposer>
        <Bloom 
          luminanceThreshold={0.2} 
          luminanceSmoothing={0.9} 
          intensity={1.5} 
          mipmapBlur 
        />
        <DepthOfField 
          focusDistance={0.02} 
          focalLength={0.05} 
          bokehScale={2} 
        />
        <ChromaticAberration 
          offset={new THREE.Vector2(0.002, 0.002)}
          blendFunction={BlendFunction.NORMAL} 
        />
        <Noise opacity={0.02} blendFunction={BlendFunction.OVERLAY} />
      </EffectComposer>
    </>
  );
}
