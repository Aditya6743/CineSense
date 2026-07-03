"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useLenis } from "lenis/react";
import { Image } from "@react-three/drei";
import { WebGLErrorBoundary } from "./WebGLErrorBoundary";

// Number of decorative rings — posters will sit exactly on these
const RING_COUNT = 12;

// -----------------------------------------------------
// 1) Glowing Accelerator Rings
// -----------------------------------------------------
function NeonRings({ length, radius }: { length: number; radius: number }) {
  const groupRef = useRef<THREE.Group>(null);

  const rings = useMemo(() => {
    const arr = [];
    for (let i = 0; i < RING_COUNT; i++) {
      arr.push({
        z: -(i / (RING_COUNT - 1)) * length,
        rotationZ: (i * Math.PI * 0.37), // deterministic, no random so SSR safe
      });
    }
    return arr;
  }, [length]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z -= 0.0003;
  });

  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;

  return (
    <group ref={groupRef}>
      {rings.map((ring, i) => (
        <mesh key={i} position={[0, 0, ring.z]} rotation={[0, 0, ring.rotationZ]}>
          {/* Fewer segments on mobile for lower geometry cost */}
          <torusGeometry args={[radius + 2, 0.025, 6, isMobile ? 24 : 40]} />
          {isMobile ? (
            <meshBasicMaterial
              color={i % 2 === 0 ? "#4e5cff" : "#b04eff"}
              toneMapped={false}
            />
          ) : (
            <meshPhysicalMaterial
              color="#4e5cff"
              emissive={i % 2 === 0 ? "#4e5cff" : "#b04eff"}
              emissiveIntensity={3}
              toneMapped={false}
            />
          )}
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

    // Smooth time-based entrance animation (1.5s)
    const age = state.clock.elapsedTime - spawnTimeRef.current;
    let spawnScale = THREE.MathUtils.clamp(age / 1.5, 0, 1);
    spawnScale = spawnScale * (2 - spawnScale); // ease-out

    // Camera-driven size scale: small at home, bigger in tunnel
    const camZ = camera.position.z;
    const sizeProgress = THREE.MathUtils.clamp((camZ - (-20)) / ((-60) - (-20)), 0, 1);
    const cameraScale = THREE.MathUtils.lerp(0.45, 1.3, sizeProgress);
    const entranceScale = spawnScale * cameraScale;

    // Hover
    const targetScale = (hovered ? 1.12 : 1) * entranceScale;
    const targetZ = hovered ? 6 : 0;
    const targetEmissive = hovered ? 2.5 : 0.15;

    groupRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.07);
    groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, position[2] + targetZ, 0.05);

    const currentEmissive = backplateRef.current.material.emissiveIntensity;
    backplateRef.current.material.emissiveIntensity = THREE.MathUtils.lerp(currentEmissive, targetEmissive, 0.05);

    // Scroll tilt
    if (lenis && typeof lenis.velocity === "number") {
      const targetTilt = THREE.MathUtils.clamp(lenis.velocity * 0.08, -Math.PI / 5, Math.PI / 5);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation[0] + targetTilt, 0.05);
    } else {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation[0], 0.05);
    }

    // Gentle float
    const floatOffset = Math.sin(state.clock.elapsedTime * 1.0 + position[2] * 0.5) * 0.3;
    groupRef.current.position.y = position[1] + floatOffset;

    // Fade out when camera passes
    const distToCamera = groupRef.current.position.z - camera.position.z;
    let fade = 1;
    if (distToCamera > -20) fade = 1 - (distToCamera + 20) / 20;
    fade = THREE.MathUtils.clamp(fade, 0, 1);

    backplateRef.current.material.transparent = true;
    backplateRef.current.material.opacity = fade;
    meshRef.current.material.transparent = true;
    meshRef.current.material.opacity = hovered ? fade : fade * 0.85;
  });

  let posterUrl = movie.poster || "https://via.placeholder.com/200x300/4e5cff/ffffff?text=No+Poster";
  if (posterUrl.includes("/w500/")) {
    posterUrl = posterUrl.replace("/w500/", "/w200/");
  }

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "auto"; }}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      {/* Glowing backplate */}
      <mesh ref={backplateRef} position={[0, 0, -0.1]}>
        <planeGeometry args={[7.5, 11]} />
        <meshBasicMaterial
          color="#0a0a1a"
          toneMapped={false}
          side={THREE.FrontSide}
        />
      </mesh>

      {/* Poster image */}
      <Image ref={meshRef} url={posterUrl} scale={[7, 10.5]} />
    </group>
  );
}

// -----------------------------------------------------
// 3) Main Neon Tunnel
// -----------------------------------------------------
export default function NeonTunnel({
  count: propCount = 60,
  length = 300,
  radius = 25,
  onMovieSelect,
  trendingMovies = [],
}: {
  count?: number;
  length?: number;
  radius?: number;
  onMovieSelect?: (movie: any) => void;
  trendingMovies?: any[];
}) {
  const groupRef = useRef<THREE.Group>(null);
  const lenis = useLenis();
  const [movies, setMovies] = useState<any[]>([]);
  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;

  // Always use full ring count — same experience on mobile and desktop
  const postersPerRing = 5;
  const ringCountToUse = RING_COUNT; // 12 rings on all devices
  const count = ringCountToUse * postersPerRing;

  useEffect(() => {
    if (trendingMovies.length > 0) {
      let results = [...trendingMovies];
      while (results.length > 0 && results.length < count) {
        results = [...results, ...trendingMovies];
      }
      setMovies(results.slice(0, count));
    }
  }, [count, trendingMovies]);

  // Poster positions aligned exactly with ring Z positions
  const positions = useMemo(() => {
    const pos = [];
    for (let ringIdx = 0; ringIdx < ringCountToUse; ringIdx++) {
      // Match the exact same formula used by NeonRings
      const z = -(ringIdx / (RING_COUNT - 1)) * length;

      for (let itemIdx = 0; itemIdx < postersPerRing; itemIdx++) {
        // Evenly space the 5 posters around the ring circumference
        // Offset each ring by a small angle for a gentle twist effect
        const theta = (itemIdx * (Math.PI * 2)) / postersPerRing + ringIdx * 0.25;
        const x = Math.cos(theta) * radius;
        const y = Math.sin(theta) * radius;

        const position = new THREE.Vector3(x, y, z);
        const dummyObj = new THREE.Object3D();
        dummyObj.position.copy(position);
        dummyObj.lookAt(0, 0, z);

        pos.push({
          position: [position.x, position.y, position.z] as [number, number, number],
          rotation: [dummyObj.rotation.x, dummyObj.rotation.y, dummyObj.rotation.z] as [number, number, number],
        });
      }
    }
    return pos;
  }, [ringCountToUse, postersPerRing, radius, length]);

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z -= 0.0003;
    if (lenis && lenis.velocity) {
      groupRef.current.rotation.z -= lenis.velocity * 0.00002;
    }
  });

  return (
    <group>
      <NeonRings length={length} radius={radius} />
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
