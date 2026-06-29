"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLenis } from "lenis/react";
import { Image } from "@react-three/drei";
import axios from "axios";

export default function NeonTunnel({ count = 60, length = 200, radius = 10, onMovieSelect }: { count?: number, length?: number, radius?: number, onMovieSelect?: (movie: any) => void }) {
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
    for (let i = 0; i < count; i++) {
      const z = -(i / count) * length;
      const theta = (i % 10) * ((Math.PI * 2) / 10) + (i * 0.1); 
      
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius;
      
      const position = new THREE.Vector3(x, y, z);
      const dummyObj = new THREE.Object3D();
      dummyObj.position.copy(position);
      dummyObj.lookAt(0, 0, z); // Look inward towards tunnel center
      
      pos.push({
        position: [position.x, position.y, position.z] as [number, number, number],
        rotation: [dummyObj.rotation.x, dummyObj.rotation.y, dummyObj.rotation.z] as [number, number, number]
      });
    }
    return pos;
  }, [count, radius, length]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z -= 0.001;
    
    if (lenis && lenis.velocity) {
      groupRef.current.rotation.z -= lenis.velocity * 0.0001;
    }
  });

  return (
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
  );
}

function InteractiveTunnelPoster({ movie, position, rotation, onClick }: any) {
  const meshRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (!meshRef.current) return;
    // When hovered, pull the poster slightly off the tunnel wall towards the center
    const targetScale = hovered ? 1.2 : 1;
    const targetZ = hovered ? 2 : 0; // Local translation towards center
    
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, targetZ, 0.1);
  });

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
          // Important: reset local position Z when unhovered
          if(meshRef.current) meshRef.current.position.z = 0;
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        scale={[4, 6]} 
      />
    </group>
  );
}
