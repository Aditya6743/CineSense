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

import { Text } from "@react-three/drei";

function CameraRig() {
  const { camera } = useThree();
  const lenis = useLenis();
  
  useFrame((state) => {
    if (!lenis) return;
    
    // lenis.progress goes from 0 to 1
    const progress = lenis.progress;
    
    // Camera travels completely through Sphere and Tunnel to the end logo
    camera.position.z = THREE.MathUtils.lerp(5, -300, progress);
    
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
  
  // Drastically reduced count for performance (from 3000 to 500)
  const [particles] = useState(() => {
    const geometry = new THREE.BufferGeometry();
    const count = 500;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    const color = new THREE.Color();
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40; // y
      // Spread particles all the way through the new universes (down to z=-350)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 350 - 150; // z
      
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

function EndUniverse() {
  const textRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (textRef.current) {
      textRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.5;
    }
  });

  return (
    <group position={[0, 0, -310]}>
      <Text 
        ref={textRef}
        fontSize={5}
        color="#00f5d4"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.1}
        outlineColor="#4e5cff"
      >
        CINESENSE
      </Text>
      <Text 
        position={[0, -4, 0]}
        fontSize={1.5}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        The Future of Cinema
      </Text>
    </group>
  );
}

export default function Scene3D() {
  return (
    <>
      {/* Optimized Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      
      {/* Elements */}
      <CameraRig />
      <CinematicDust />
      
      {/* Universes */}
      <PosterSphere count={250} radius={25} />
      {/* Move tunnel further back to z=-80, make it 200 long */}
      <group position={[0, 0, -30]}> 
        <NeonTunnel count={300} length={200} radius={10} />
      </group>
      <EndUniverse />
      
      {/* Highly Optimized Post Processing */}
      <EffectComposer multisampling={0}>
        <Bloom 
          luminanceThreshold={0.5} 
          luminanceSmoothing={0.9} 
          intensity={1.0} 
          mipmapBlur={false} // Huge performance save
        />
        <DepthOfField 
          focusDistance={0.02} 
          focalLength={0.05} 
          bokehScale={1.5} // Lower scale = faster
        />
        <ChromaticAberration 
          offset={new THREE.Vector2(0.001, 0.001)}
          blendFunction={BlendFunction.NORMAL} 
        />
      </EffectComposer>
    </>
  );
}
