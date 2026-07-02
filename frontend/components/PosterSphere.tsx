"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLenis } from "lenis/react";
import { Image } from "@react-three/drei";
import axios from "axios";
import { WebGLErrorBoundary } from "./WebGLErrorBoundary";

export default function PosterSphere({ radius = 25, onMovieSelect, trendingMovies = [] }: { radius?: number, onMovieSelect?: (movie: any) => void, trendingMovies?: any[] }) {
  const groupRef = useRef<THREE.Group>(null);
  const lenis = useLenis();
  const [movies, setMovies] = useState<any[]>([]);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  // Drastically reduce count on mobile to prevent GPU Out Of Memory (OOM) crashes
  const count = isMobile ? 12 : 30;

  useEffect(() => {
    if (trendingMovies.length > 0) {
      // Duplicate array if we don't have enough movies to fill the sphere
      let results = [...trendingMovies];
      while (results.length > 0 && results.length < count) {
        results = [...results, ...trendingMovies];
      }
      const finalMovies = results.slice(0, count);
      setMovies(finalMovies);
      
      // Eagerly preload posters into browser cache to prevent 3D popping/late loading
      finalMovies.forEach((m: any) => {
        if (m.poster) {
          const img = new globalThis.Image();
          img.src = m.poster;
        }
      });
    }
  }, [count, trendingMovies]);

  // Calculate positions
  const positions = useMemo(() => {
    const pos = [];
    const phi = Math.PI * (3 - Math.sqrt(5));
    
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      
      // We calculate the rotation needed to look at the center
      const position = new THREE.Vector3(x * radius, y * radius, z * radius);
      const dummyObj = new THREE.Object3D();
      dummyObj.position.copy(position);
      dummyObj.lookAt(0, 0, 0);
      
      pos.push({
        position: [position.x, position.y, position.z] as [number, number, number],
        rotation: [dummyObj.rotation.x, dummyObj.rotation.y, dummyObj.rotation.z] as [number, number, number]
      });
    }
    return pos;
  }, [count, radius]);

  useFrame((state) => {
    if (!groupRef.current) return;
    
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    
    if (lenis) {
      groupRef.current.rotation.x = -lenis.progress * Math.PI;
    }
  });

  return (
    <group position={[0, 0, -40]} ref={groupRef}>
      {movies.map((movie, i) => {
        const p = positions[i];
        if (!p) return null;
        
        return (
          <WebGLErrorBoundary key={`${movie.title}-${i}`}>
            <InteractivePoster 
              movie={movie}
              position={p.position}
              rotation={p.rotation}
              onClick={() => onMovieSelect?.(movie)}
            />
          </WebGLErrorBoundary>
        );
      })}
    </group>
  );
}

function InteractivePoster({ movie, position, rotation, onClick }: any) {
  const meshRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  // Smooth hover animation
  useFrame(() => {
    if (!meshRef.current) return;
    const targetScale = hovered ? 1.2 : 1;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  // Use a fallback placeholder if poster is null
  const posterUrl = movie.poster || "https://via.placeholder.com/256x384/4e5cff/ffffff?text=No+Poster";

  return (
    <group position={position} rotation={rotation}>
      <Image
        ref={meshRef}
        url={posterUrl}
        transparent
        opacity={hovered ? 1 : 0.8}
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
        scale={[2, 3]} // Poster aspect ratio
      />
    </group>
  );
}
