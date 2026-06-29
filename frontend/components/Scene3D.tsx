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
import { MeshSurfaceSampler, FontLoader, TextGeometry } from "three-stdlib";
import { useMemo } from "react";

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


function PremiumParticleText({ text, size, yOffset, zOffset, count = 2000 }: { text: string, size: number, yOffset: number, zOffset: number, count?: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const [targetPositions, setTargetPositions] = useState<Float32Array | null>(null);
  const [startPositions, setStartPositions] = useState<Float32Array | null>(null);

  useEffect(() => {
    const loader = new FontLoader();
    loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_bold.typeface.json', (font) => {
      // Extremely thin text geometry so the sampled points are flat and perfectly readable
      const geo = new TextGeometry(text, { font, size, height: 0.01, curveSegments: 3 });
      geo.center();
      
      const tempMesh = new THREE.Mesh(geo);
      const sampler = new MeshSurfaceSampler(tempMesh).build();
      
      const targets = new Float32Array(count * 3);
      const starts = new Float32Array(count * 3);
      const tempPosition = new THREE.Vector3();
      
      for(let i=0; i<count; i++) {
        sampler.sample(tempPosition);
        targets[i*3] = tempPosition.x;
        targets[i*3+1] = tempPosition.y;
        targets[i*3+2] = tempPosition.z;
        
        // Start randomly in a massive 3D area in front of the text
        starts[i*3] = tempPosition.x + (Math.random() - 0.5) * 300;
        starts[i*3+1] = tempPosition.y + (Math.random() - 0.5) * 300;
        starts[i*3+2] = tempPosition.z + (Math.random() - 0.5) * 400 + 200; // start closer to camera
      }
      
      setTargetPositions(targets);
      setStartPositions(starts);
    });
  }, [text, size, count]);

  const { camera } = useThree();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current || !targetPositions || !startPositions) return;
    
    // distance ranges from ~200 down to 0 as you scroll towards the text
    const distance = camera.position.z - (zOffset + 30);
    
    // Progress is 0 when distance > 150, and 1 when distance < 0
    let progress = 1.0 - Math.min(1, Math.max(0, distance / 150));
    
    // Smooth cinematic easing
    progress = progress * progress * (3 - 2 * progress); 

    for (let i = 0; i < count; i++) {
      // Direct exact lerp so particles only assemble exactly when you scroll!
      dummy.position.x = THREE.MathUtils.lerp(startPositions[i*3], targetPositions[i*3], progress);
      dummy.position.y = THREE.MathUtils.lerp(startPositions[i*3+1], targetPositions[i*3+1], progress);
      dummy.position.z = THREE.MathUtils.lerp(startPositions[i*3+2], targetPositions[i*3+2], progress);
      
      // Zero rotation when fully assembled to ensure pure crisp text readability
      // When completely scattered (progress=0), give them random rotation
      dummy.rotation.set(
        (1 - progress) * startPositions[i*3],
        (1 - progress) * startPositions[i*3+1],
        0
      );
      
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    
    // Float the whole word slightly for a breathing effect
    meshRef.current.position.y = yOffset + Math.sin(state.clock.elapsedTime) * 0.5;
  });

  if (!targetPositions) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} position={[0, yOffset, zOffset]}>
      <icosahedronGeometry args={[0.06, 0]} />
      <meshPhysicalMaterial color="#ffffff" metalness={0.2} roughness={0.1} emissive="#ffffff" emissiveIntensity={0.8} />
    </instancedMesh>
  );
}

function WelcomeUniverse() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      // Bob the scroll down text
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.2;
    }
  });

  return (
    <group>
      <PremiumParticleText text="Aditya says" size={3} yOffset={3} zOffset={-315} count={4000} />
      <PremiumParticleText text="hello to you" size={3} yOffset={-2} zOffset={-315} count={4500} />
      
      <group position={[0, -6, -315]} ref={groupRef}>
        <Center>
          <Text3D 
            font="https://raw.githubusercontent.com/mrdoob/three.js/master/examples/fonts/helvetiker_regular.typeface.json"
            size={0.8}
            height={0.1}
            curveSegments={2}
          >
            Scroll Down ↓
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1} />
          </Text3D>
        </Center>
      </group>
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
