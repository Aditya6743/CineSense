"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line, Billboard, Image as DreiImage, Html, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import * as THREE from "three";
import axios from "axios";

interface MovieData {
  movie_id: number;
  title: string;
  poster: string | null;
  overview?: string;
  release_date?: string;
}

interface Node {
  id: string; // Movie title
  data: MovieData;
  position: THREE.Vector3;
  parent?: string;
  level: number;
}

interface Edge {
  source: string;
  target: string;
}

function MovieNode({ 
  node, 
  onClick 
}: { 
  node: Node, 
  onClick: (node: Node) => void 
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const targetScale = hovered ? 1.25 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.15);
    
    // Gentle floating
    meshRef.current.position.y = node.position.y + Math.sin(state.clock.elapsedTime * 2 + node.position.x) * 0.15;
  });

  const hasPoster = !!node.data.poster;

  return (
    <Billboard position={node.position}>
      <group 
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
        onClick={(e) => { e.stopPropagation(); onClick(node); }}
      >
        {/* Glowing Aura */}
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[2.5, 3.5]} />
          <meshBasicMaterial color={hovered ? "#ffffff" : "#4e5cff"} transparent opacity={hovered ? 0.4 : 0.05} />
        </mesh>
        
        {/* Poster */}
        {hasPoster ? (
          <DreiImage url={node.data.poster!} scale={[2, 3]} transparent />
        ) : (
          <mesh>
            <planeGeometry args={[2, 3]} />
            <meshBasicMaterial color="#1a1a2e" />
          </mesh>
        )}
        
        {/* Sleek HTML Tooltip */}
        {hovered && (
          <Html position={[0, -1.8, 0]} center zIndexRange={[100, 0]}>
            <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-full border border-white/20 whitespace-nowrap text-sm font-semibold tracking-wide shadow-[0_0_20px_rgba(78,92,255,0.5)]">
              {node.data.title}
            </div>
          </Html>
        )}
      </group>
    </Billboard>
  );
}

export default function ConstellationGraph() {
  const [nodes, setNodes] = useState<Map<string, Node>>(new Map());
  const [edges, setEdges] = useState<Edge[]>([]);
  const [activeNode, setActiveNode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  
  const { camera } = useThree();
  const targetCameraPos = useRef(new THREE.Vector3(0, 0, 15));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Initialize central node by fetching trending movies
  useEffect(() => {
    const initializeGraph = async () => {
      try {
        const trendingRes = await axios.get("/api/trending");
        const trendingMovies: MovieData[] = trendingRes.data;
        
        if (trendingMovies && trendingMovies.length > 0) {
          const firstMovie = trendingMovies[0]; // Start with the top trending movie
          const initNode: Node = {
            id: firstMovie.title,
            data: firstMovie, // Contains the actual poster!
            position: new THREE.Vector3(0, 0, 0),
            level: 0
          };
          
          const map = new Map();
          map.set(firstMovie.title, initNode);
          setNodes(map);
          setActiveNode(firstMovie.title);
          
          // Now fetch its connections
          fetchConnections(initNode, map);
        }
      } catch (err) {
        console.error("Failed to initialize constellation graph:", err);
      }
    };
    
    initializeGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchConnections = async (sourceNode: Node, currentNodesMap: Map<string, Node> = nodes) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/recommend/${encodeURIComponent(sourceNode.id)}`);
      // Update source node data if it was mocked
      setNodes(prev => {
        const next = new Map(prev);
        const sn = next.get(sourceNode.id);
        if (sn) {
          sn.data.title = res.data.movie;
          next.set(sourceNode.id, sn);
        }
        return next;
      });

      const recommendations: MovieData[] = res.data.recommendations || [];
      const newEdges: Edge[] = [];
      const newNodesList: Node[] = [];

      // Calculate spherical positions for children
      const radius = 10 + sourceNode.level * 2; // Expand radius for deeper levels
      const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio for spherical distribution

      recommendations.forEach((rec, i) => {
        if (nodes.has(rec.title)) {
          // If node already exists, just link it
          newEdges.push({ source: sourceNode.id, target: rec.title });
          return;
        }

        // Spherical distribution formula
        const theta = 2 * Math.PI * i / phi;
        const phiAngle = Math.acos(1 - 2 * (i + 0.5) / recommendations.length);
        
        const x = sourceNode.position.x + radius * Math.sin(phiAngle) * Math.cos(theta);
        const y = sourceNode.position.y + radius * Math.sin(phiAngle) * Math.sin(theta);
        const z = sourceNode.position.z + radius * Math.cos(phiAngle);

        const childNode: Node = {
          id: rec.title,
          data: rec,
          position: new THREE.Vector3(x, y, z),
          parent: sourceNode.id,
          level: sourceNode.level + 1
        };

        newNodesList.push(childNode);
        newEdges.push({ source: sourceNode.id, target: childNode.id });
      });

      setNodes(prev => {
        // Use the passed map if this is the initial fetch, otherwise use prev
        const baseMap = currentNodesMap.size > prev.size ? currentNodesMap : prev;
        const next = new Map(baseMap);
        newNodesList.forEach(n => next.set(n.id, n));
        return next;
      });
      
      setEdges(prev => [...prev, ...newEdges]);
      
    } catch (err) {
      console.error("Failed to fetch constellation connections", err);
    } finally {
      setLoading(false);
    }
  };

  // Removed the duplicate useEffect that relied on initialMovie

  const handleNodeClick = (node: Node) => {
    setActiveNode(node.id);
    
    // Set target camera position (look at node, back up slightly on Z)
    targetCameraPos.current = new THREE.Vector3(
      node.position.x,
      node.position.y,
      node.position.z + 15
    );
    
    // Set what the camera/controls should orbit around
    targetLookAt.current = new THREE.Vector3(
      node.position.x,
      node.position.y,
      node.position.z
    );

    fetchConnections(node);
  };

  // Smooth camera and subtle rotation
  useFrame(() => {
    if (groupRef.current) {
      // Very slow global rotation to make it feel alive
      groupRef.current.rotation.y += 0.001;
      groupRef.current.rotation.x += 0.0005;
    }

    // Lerp camera and orbit controls target only if they are far from the target
    if (controlsRef.current) {
      if (camera.position.distanceTo(targetCameraPos.current) > 0.1) {
        camera.position.lerp(targetCameraPos.current, 0.03);
      }
      if (controlsRef.current.target.distanceTo(targetLookAt.current) > 0.1) {
        controlsRef.current.target.lerp(targetLookAt.current, 0.03);
      }
      controlsRef.current.update();
    }
  });

  return (
    <>
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        maxDistance={100}
        minDistance={2}
        dampingFactor={0.05}
      />
      <group ref={groupRef}>
      {/* Edges */}
      {edges.map((edge, i) => {
        const sourceNode = nodes.get(edge.source);
        const targetNode = nodes.get(edge.target);
        if (!sourceNode || !targetNode) return null;

        return (
          <Line
            key={`edge-${i}`}
            points={[sourceNode.position, targetNode.position]}
            color="#6b7cff"
            opacity={0.6}
            transparent
            lineWidth={2.5}
          />
        );
      })}

      {/* Nodes */}
      {Array.from(nodes.values()).map(node => (
        <MovieNode 
          key={node.id} 
          node={node} 
          onClick={handleNodeClick} 
        />
      ))}
      </group>
    </>
  );
}
