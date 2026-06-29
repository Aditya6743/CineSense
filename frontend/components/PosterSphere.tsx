"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLenis } from "lenis/react";

export default function PosterSphere({ count = 300, radius = 25 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lenis = useLenis();

  // Procedural dummy texture for posters to save memory instead of loading 200 images
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 384;
    const context = canvas.getContext("2d");
    if (context) {
      // Abstract cinematic gradient
      const gradient = context.createLinearGradient(0, 0, 256, 384);
      gradient.addColorStop(0, "#4e5cff");
      gradient.addColorStop(1, "#9d4edd");
      context.fillStyle = gradient;
      context.fillRect(0, 0, 256, 384);
      
      // Fake text blocks
      context.fillStyle = "rgba(255, 255, 255, 0.8)";
      context.fillRect(20, 300, 150, 15);
      context.fillStyle = "rgba(255, 255, 255, 0.4)";
      context.fillRect(20, 325, 200, 10);
      context.fillRect(20, 345, 180, 10);
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Calculate positions and rotations for a sphere distribution
  const dummy = useMemo(() => new THREE.Object3D(), []);
  
  useEffect(() => {
    if (!meshRef.current) return;
    
    // Golden spiral algorithm to distribute points evenly on a sphere
    const phi = Math.PI * (3 - Math.sqrt(5));
    
    for (let i = 0; i < count; i++) {
      const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
      const r = Math.sqrt(1 - y * y); // radius at y
      
      const theta = phi * i;
      
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      
      // Position on sphere
      dummy.position.set(x * radius, y * radius, z * radius);
      
      // Look at center (so front faces inward)
      dummy.lookAt(0, 0, 0);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      
      // Give each instance a slightly different color tint
      const color = new THREE.Color();
      color.setHSL(0.6 + (i / count) * 0.3, 0.8, 0.5);
      meshRef.current.setColorAt(i, color);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [count, radius, dummy]);

  useFrame((state) => {
    if (!meshRef.current) return;
    
    // Base continuous rotation
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    
    // Tie rotation to scroll (Y axis)
    if (lenis) {
      meshRef.current.rotation.x = -lenis.progress * Math.PI;
    }
  });

  return (
    <group position={[0, 0, -40]}> {/* Place sphere deep in Z */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <planeGeometry args={[2, 3]} /> {/* Aspect ratio of a movie poster (2:3) */}
        <meshStandardMaterial 
          map={texture} 
          roughness={0.2} 
          metalness={0.8}
          side={THREE.DoubleSide}
        />
      </instancedMesh>
    </group>
  );
}
