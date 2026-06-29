"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Environment, Stars, Float, MeshTransmissionMaterial } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, DepthOfField, Noise } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useLenis } from "lenis/react";

import PosterSphere from "./PosterSphere";
import NeonTunnel from "./NeonTunnel";

import { Text3D, Center } from "@react-three/drei";

function CameraRig() {
  const { camera } = useThree();
  const lenis = useLenis();
  
  useFrame((state) => {
    if (!lenis) return;
    
    // Calculate how far we've scrolled in pixels
    // We want the 3D journey to complete over the first 300vh of scrolling
    const scrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    const scrollHeight300vh = typeof window !== 'undefined' ? window.innerHeight * 3 : 3000;
    
    // Map scroll progress (0 to 1) over just the first 300vh
    const localProgress = Math.min(1, Math.max(0, scrollY / scrollHeight300vh));
    
    // Camera travels completely through Sphere and Tunnel to the end logo
    // It stops at -300 when we hit the HTML sections
    camera.position.z = THREE.MathUtils.lerp(5, -300, localProgress);
    
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
  
  const [particles] = useState(() => {
    const geometry = new THREE.BufferGeometry();
    const count = 1500; // Increased count for better distribution
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // Spread evenly across a massive volume so it doesn't look clustered
      positions[i * 3] = (Math.random() - 0.5) * 200; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 200; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 600 - 150; // z (from +150 to -450)
      
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
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.01;
    pointsRef.current.rotation.z = state.clock.elapsedTime * 0.005;
  });

  return (
    <points ref={pointsRef} geometry={particles}>
      <pointsMaterial
        size={0.1}
        vertexColors
        transparent
        opacity={0.4}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}


function WelcomeUniverse() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  return (
    <group position={[0, 0, -315]} ref={groupRef}>
      <Center position={[0, 2, 0]}>
        <Text3D 
          font="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_bold.typeface.json"
          size={5}
          height={1.5}
          curveSegments={4} // Optimized
          bevelEnabled
          bevelThickness={0.2}
          bevelSize={0.05}
          bevelOffset={0}
          bevelSegments={2} // Optimized
        >
          WELCOME
          <meshPhysicalMaterial 
            color="#00f5d4" 
            emissive="#00f5d4" 
            emissiveIntensity={2} 
            metalness={0.9} 
            roughness={0.1} 
          />
        </Text3D>
      </Center>
      
      <Center position={[0, -3, 0]}>
        <Text3D 
          font="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json"
          size={1.5}
          height={0.5}
          curveSegments={4} // Optimized
          bevelEnabled
          bevelThickness={0.05}
          bevelSize={0.02}
          bevelSegments={2} // Optimized
        >
          To The Future of Cinema
          <meshPhysicalMaterial 
            color="#ffffff" 
            metalness={0.8} 
            roughness={0.2} 
          />
        </Text3D>
      </Center>
    </group>
  );
}

export default function Scene3D({ onMovieSelect }: { onMovieSelect?: (movie: any) => void }) {
  return (
    <>
      {/* Optimized Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      
      {/* Elements */}
      <CameraRig />
      <CinematicDust />
      
      {/* Universes */}
      <PosterSphere count={60} radius={25} onMovieSelect={onMovieSelect} />
      {/* Tunnel spans the entire remaining scroll distance (from -30 to -300) */}
      <group position={[0, 0, -30]}> 
        <NeonTunnel count={40} length={270} radius={15} onMovieSelect={onMovieSelect} />
      </group>
      
      <WelcomeUniverse />
      
      {/* Highly Optimized Post Processing - Removed ChromaticAberration for 120FPS */}
      <EffectComposer multisampling={0}>
        <Bloom 
          luminanceThreshold={0.5} 
          luminanceSmoothing={0.9} 
          intensity={1.0} 
          mipmapBlur={false} // Huge performance save
        />
      </EffectComposer>
    </>
  );
}
