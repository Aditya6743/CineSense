"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useLenis } from "lenis/react";
import { Image } from "@react-three/drei";
import axios from "axios";
import { WebGLErrorBoundary } from "./WebGLErrorBoundary";

// -----------------------------------------------------
// 1) Glowing Accelerator Rings
// -----------------------------------------------------
function NeonRings({ length, radius }: { length: number, radius: number }) {
  const ringCount = 15; // 15 massive rings spanning the tunnel
  const rings = useMemo(() => {
    const arr = [];
    for (let i = 0; i < ringCount; i++) {
      arr.push({
        z: -(i / ringCount) * length,
        rotationZ: Math.random() * Math.PI, // Random initial rotation
      });
    }
    return arr;
  }, [length, ringCount]);

  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    // Slowly rotate the entire ring system smoothly
    groupRef.current.rotation.z -= 0.0003;
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i} position={[0, 0, ring.z]} rotation={[0, 0, ring.rotationZ]}>
          <torusGeometry args={[radius + 2, 0.02, 8, 30]} />
          {/* Intense emissive blue/purple to trigger Bloom */}
          <meshPhysicalMaterial 
            color="#4e5cff" 
            emissive={i % 2 === 0 ? "#4e5cff" : "#b04eff"} 
            emissiveIntensity={3} 
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// -----------------------------------------------------
// 2) Premium Tunnel Poster
// -----------------------------------------------------
function InteractiveTunnelPoster({ movie, position, rotation, onClick }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<any>(null);
  const backplateRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);
  const lenis = useLenis();
  const { camera } = useThree();

    const spawnTimeRef = useRef(0);

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current || !backplateRef.current) return;
    
    // Initialize spawn time once
    if (spawnTimeRef.current === 0) {
      spawnTimeRef.current = state.clock.elapsedTime;
    }
    
    // Smooth time-based entrance animation (grows over 1.5 seconds, independently of scroll)
    const age = state.clock.elapsedTime - spawnTimeRef.current;
    let entranceScale = THREE.MathUtils.clamp(age / 1.5, 0, 1);
    // Smooth ease-out
    entranceScale = entranceScale * (2 - entranceScale);
    
    // Smooth Hover scaling and popping out
    const targetScale = (hovered ? 1.15 : 1) * entranceScale;
    const targetZ = hovered ? 8 : 0; 
    const targetEmissive = hovered ? 3.0 : 0.2; 
    
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.05);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, position[2] + targetZ, 0.05);
    
    const currentEmissive = backplateRef.current.material.emissiveIntensity;
    backplateRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(currentEmissive, targetEmissive, 0.05);
    
    // Scroll tilting logic (smoother)
    if (lenis && typeof lenis.velocity === 'number') {
      const targetTilt = THREE.MathUtils.clamp(lenis.velocity * 0.1, -Math.PI / 4, Math.PI / 4);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation[0] + targetTilt, 0.05);
    } else {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation[0], 0.05);
    }
    
    // Floating breathing effect
    const floatOffset = Math.sin(state.clock.elapsedTime * 1.5 + position[2]) * 0.8;
    groupRef.current.position.y = position[1] + floatOffset;

    // Cinematic Fade out when camera passes it
    const distToCamera = groupRef.current.position.z - camera.position.z;
    let fade = 1;
    // distToCamera > 0 means poster is behind camera. distToCamera < 0 means in front.
    if (distToCamera > -20) {
       fade = 1 - (distToCamera + 20) / 20; 
    }
    fade = THREE.MathUtils.clamp(fade, 0, 1);
    
    backplateRef.current.material.transparent = true;
    backplateRef.current.material.opacity = fade;
    
    meshRef.current.material.transparent = true;
    meshRef.current.material.opacity = hovered ? fade : fade * 0.8;
  });

  let posterUrl = movie.poster || "https://via.placeholder.com/256x384/4e5cff/ffffff?text=No+Poster";
  if (posterUrl.includes("/w500/")) {
    posterUrl = posterUrl.replace("/w500/", "/w200/");
  }

  return (
    <group 
      ref={groupRef} 
      position={position} 
      rotation={rotation}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Glowing Backplate / Frame (Now a thin plane, only renders front) */}
      <mesh ref={backplateRef} position={[0, 0, -0.1]}>
        <planeGeometry args={[12.5, 18.5]} />
        <meshPhysicalMaterial 
          color="#000000" 
          metalness={0.9}
          roughness={0.1}
          emissive="#4e5cff" 
          emissiveIntensity={0.2} 
          toneMapped={false}
          side={THREE.FrontSide}
        />
      </mesh>
      
      {/* Actual Poster Image */}
      <Image
        ref={meshRef}
        url={posterUrl}
        scale={[12, 18]} 
      />
    </group>
  );
}

// -----------------------------------------------------
// 3) Main Neon Tunnel
// -----------------------------------------------------
export default function NeonTunnel({ count: propCount = 60, length = 300, radius = 30, onMovieSelect, trendingMovies = [] }: { count?: number, length?: number, radius?: number, onMovieSelect?: (movie: any) => void, trendingMovies?: any[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const lenis = useLenis();
  const [movies, setMovies] = useState<any[]>([]);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  // Override the prop count on mobile to avoid GPU crashes
  const count = isMobile ? 16 : propCount;

  useEffect(() => {
    if (trendingMovies.length > 0) {
      let results = [...trendingMovies];
      while (results.length > 0 && results.length < count) {
        results = [...results, ...trendingMovies];
      }
      setMovies(results.slice(0, count));
    }
  }, [count, trendingMovies]);

  const positions = useMemo(() => {
    const pos = [];
    // Only 4 items per ring, giving massive horizontal breathing room
    // creating a sleek, highly curated premium gallery feel
    const itemsPerRing = 4;
    const numRings = Math.ceil(count / itemsPerRing);
    
    for (let i = 0; i < count; i++) {
      const ringIndex = Math.floor(i / itemsPerRing);
      const itemIndex = i % itemsPerRing;
      
      // All items in the same ring share the exact same Z coordinate
      // This prevents the "some at top, some at bottom missing" spiral effect
      const z = -(ringIndex / numRings) * length;
      
      // Calculate angle in the ring, offset each ring slightly for a twist effect
      const theta = (itemIndex * ((Math.PI * 2) / itemsPerRing)) + (ringIndex * 0.3); 
      
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius;
      
      const position = new THREE.Vector3(x, y, z);
      const dummyObj = new THREE.Object3D();
      dummyObj.position.copy(position);
      dummyObj.lookAt(0, 0, z); // Look exactly at center of tunnel at this Z slice
      
      pos.push({
        position: [position.x, position.y, position.z] as [number, number, number],
        rotation: [dummyObj.rotation.x, dummyObj.rotation.y, dummyObj.rotation.z] as [number, number, number]
      });
    }
    return pos;
  }, [count, radius, length]);

  useFrame(() => {
    if (!groupRef.current) return;
    
    // Constant cinematic slow rotation (match rings for synced smooth feel)
    groupRef.current.rotation.z -= 0.0003;
    
    // Accelerate rotation when scrolling really fast for warp-speed feeling
    if (lenis && lenis.velocity) {
      groupRef.current.rotation.z -= lenis.velocity * 0.00002;
    }
  });

  return (
    <group>
      {/* The static but rotating structural rings */}
      <NeonRings length={length} radius={radius} />
      
      {/* The rotating posters tunnel */}
      <group ref={groupRef}>
        {movies.map((movie, i) => {
          const p = positions[i];
          if (!p) return null;
          
          return (
            <WebGLErrorBoundary key={`${movie.title}-tunnel-${i}`}>
              <InteractiveTunnelPoster 
                movie={movie}
                position={p.position}
                rotation={p.rotation}
                onClick={() => onMovieSelect?.(movie)}
              />
            </WebGLErrorBoundary>
          );
        })}
      </group>
    </group>
  );
}
