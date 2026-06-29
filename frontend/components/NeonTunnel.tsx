"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLenis } from "lenis/react";
import { Image } from "@react-three/drei";
import axios from "axios";

// -----------------------------------------------------
// 1) Glowing Accelerator Rings
// -----------------------------------------------------
function NeonRings({ length, radius }: { length: number, radius: number }) {
  const ringCount = 15; // 15 massive rings spanning the tunnel
  const rings = useMemo(() => {
    const arr = [];
    for (let i = 0; i < ringCount; i++) {
      arr.push({
        z: -(i / ringCount) * length - 10,
        rotationZ: Math.random() * Math.PI, // Random initial rotation
      });
    }
    return arr;
  }, [length, ringCount]);

  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!groupRef.current) return;
    // Slowly rotate the entire ring system
    groupRef.current.rotation.z += 0.0005;
  });

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i} position={[0, 0, ring.z]} rotation={[0, 0, ring.rotationZ]}>
          <torusGeometry args={[radius + 5, 0.1, 16, 100]} />
          {/* Intense emissive blue/purple to trigger Bloom */}
          <meshPhysicalMaterial 
            color="#4e5cff" 
            emissive={i % 2 === 0 ? "#4e5cff" : "#b04eff"} 
            emissiveIntensity={2} 
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

  useFrame((state) => {
    if (!groupRef.current || !meshRef.current || !backplateRef.current) return;
    
    // Smooth Hover scaling and popping out
    const targetScale = hovered ? 1.15 : 1;
    const targetZ = hovered ? 5 : 0; // Pop inwards towards the camera
    const targetEmissive = hovered ? 2.5 : 0.5; // Backplate glows intensely on hover
    
    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, position[2] + targetZ, 0.1);
    
    const currentEmissive = backplateRef.current.material.emissiveIntensity;
    backplateRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(currentEmissive, targetEmissive, 0.1);
    
    // Scroll tilting logic (tilt up/down based on scroll velocity)
    if (lenis && typeof lenis.velocity === 'number') {
      const targetTilt = THREE.MathUtils.clamp(lenis.velocity * 0.15, -Math.PI / 4, Math.PI / 4);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation[0] + targetTilt, 0.1);
    } else {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation[0], 0.1);
    }
    
    // Floating breathing effect for premium feel
    const floatOffset = Math.sin(state.clock.elapsedTime * 2 + position[2]) * 0.5;
    groupRef.current.position.y = position[1] + floatOffset;
  });

  const posterUrl = movie.poster || "https://via.placeholder.com/256x384/4e5cff/ffffff?text=No+Poster";

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
      {/* Glowing Backplate / Frame */}
      <mesh ref={backplateRef} position={[0, 0, -0.5]}>
        <boxGeometry args={[12.5, 18.5, 0.2]} />
        <meshPhysicalMaterial 
          color="#000000" 
          metalness={0.8}
          roughness={0.2}
          emissive="#4e5cff" 
          emissiveIntensity={0.5} 
          toneMapped={false}
        />
      </mesh>
      
      {/* Actual Poster Image */}
      <Image
        ref={meshRef}
        url={posterUrl}
        transparent
        opacity={1}
        scale={[12, 18]} 
      />
    </group>
  );
}

// -----------------------------------------------------
// 3) Main Neon Tunnel
// -----------------------------------------------------
export default function NeonTunnel({ count = 100, length = 200, radius = 22, onMovieSelect }: { count?: number, length?: number, radius?: number, onMovieSelect?: (movie: any) => void }) {
  const groupRef = useRef<THREE.Group>(null);
  const lenis = useLenis();
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axios.get("/api/trending"); 
        let results = res.data;
        while (results.length > 0 && results.length < count) {
          results = [...results, ...res.data];
        }
        setMovies(results.slice(0, count));
      } catch (err) {
        console.error("Failed to fetch tunnel movies", err);
      }
    };
    fetchMovies();
  }, [count]);

  const positions = useMemo(() => {
    const pos = [];
    // Increase density drastically. We wrap them in a spiral.
    // 12 items per ring roughly
    const itemsPerRing = 12;
    for (let i = 0; i < count; i++) {
      const z = -(i / count) * length;
      
      // Calculate angle in the spiral
      const theta = (i % itemsPerRing) * ((Math.PI * 2) / itemsPerRing) + (i * 0.15); 
      
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
    
    // Constant cinematic slow rotation
    groupRef.current.rotation.z -= 0.001;
    
    // Accelerate rotation when scrolling really fast for warp-speed feeling
    if (lenis && lenis.velocity) {
      groupRef.current.rotation.z -= lenis.velocity * 0.00005;
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
            <InteractiveTunnelPoster 
              key={`${movie.title}-tunnel-${i}`}
              movie={movie}
              position={p.position}
              rotation={p.rotation}
              onClick={() => onMovieSelect?.(movie)}
            />
          );
        })}
      </group>
    </group>
  );
}
