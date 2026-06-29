"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useLenis } from "lenis/react";

export default function NeonTunnel({ count = 200, length = 100, radius = 8 }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const lenis = useLenis();

  // Create a neon glowing texture for the tunnel posters
  const texture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (context) {
      context.fillStyle = "#0a0a0a";
      context.fillRect(0, 0, 128, 128);
      
      // Neon border
      context.strokeStyle = "#00f5d4";
      context.lineWidth = 4;
      context.strokeRect(4, 4, 120, 120);
      
      // Neon grid lines
      context.beginPath();
      context.moveTo(64, 0);
      context.lineTo(64, 128);
      context.moveTo(0, 64);
      context.lineTo(128, 64);
      context.strokeStyle = "rgba(0, 245, 212, 0.5)";
      context.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    
    // Distribute panels in rings forming a tunnel along the Z axis
    for (let i = 0; i < count; i++) {
      // Z position spans from 0 down to -length
      const z = -(i / count) * length;
      
      // Angle around the tunnel
      const theta = (i % 10) * ((Math.PI * 2) / 10) + (i * 0.1); 
      
      const x = Math.cos(theta) * radius;
      const y = Math.sin(theta) * radius;
      
      dummy.position.set(x, y, z);
      
      // Face inward towards the center of the tunnel
      dummy.lookAt(0, 0, z);
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      
      // Color variations: Cyan and Magenta
      const color = new THREE.Color();
      if (i % 2 === 0) {
        color.set("#00f5d4"); // Cyan
      } else {
        color.set("#f15bb5"); // Magenta
      }
      meshRef.current.setColorAt(i, color);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true;
    }
  }, [count, radius, length, dummy]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    // Optional: make the whole tunnel slowly rotate
    meshRef.current.rotation.z -= 0.001;
    
    // Tie movement to scroll? The camera already moves through Z.
    // If we want the tunnel to feel like it's spinning faster on scroll:
    if (lenis && lenis.velocity) {
      meshRef.current.rotation.z -= lenis.velocity * 0.0001;
    }
  });

  return (
    <group position={[0, 0, -50]}> {/* Place tunnel starting deeper in Z, after the sphere */}
      <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
        <planeGeometry args={[2, 2]} />
        <meshBasicMaterial 
          map={texture} 
          side={THREE.DoubleSide}
          transparent
          opacity={0.8}
        />
      </instancedMesh>
    </group>
  );
}
