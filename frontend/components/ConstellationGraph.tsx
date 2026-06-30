"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Line, Text, Billboard, Image as DreiImage } from "@react-three/drei";
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
    const targetScale = hovered ? 1.2 : 1.0;
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    
    // Gentle floating
    meshRef.current.position.y = node.position.y + Math.sin(state.clock.elapsedTime * 2 + node.position.x) * 0.2;
  });

  const posterUrl = node.data.poster || "https://via.placeholder.com/256x384/4e5cff/ffffff?text=No+Poster";

  return (
    <Billboard position={node.position}>
      <group 
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = "auto"; }}
        onClick={(e) => { e.stopPropagation(); onClick(node); }}
      >
        {/* Glowing Backplate */}
        <mesh position={[0, 0, -0.1]}>
          <planeGeometry args={[2.2, 3.2]} />
          <meshBasicMaterial color={hovered ? "#b04eff" : "#4e5cff"} transparent opacity={hovered ? 0.8 : 0.2} />
        </mesh>
        
        {/* Poster */}
        <DreiImage url={posterUrl} scale={[2, 3]} transparent />
        
        {/* Title Tag */}
        {hovered && (
          <Text 
            position={[0, -1.8, 0.1]} 
            fontSize={0.3} 
            color="white"
            anchorX="center"
            anchorY="top"
            maxWidth={3}
            textAlign="center"
          >
            {node.data.title}
          </Text>
        )}
      </group>
    </Billboard>
  );
}

export default function ConstellationGraph({ initialMovie }: { initialMovie: string }) {
  const [nodes, setNodes] = useState<Map<string, Node>>(() => {
    const initNode: Node = {
      id: initialMovie,
      data: { movie_id: 0, title: initialMovie, poster: null },
      position: new THREE.Vector3(0, 0, 0),
      level: 0
    };
    const map = new Map();
    map.set(initialMovie, initNode);
    return map;
  });
  const [edges, setEdges] = useState<Edge[]>([]);
  const [activeNode, setActiveNode] = useState<string>(initialMovie);
  const [loading, setLoading] = useState(false);
  const groupRef = useRef<THREE.Group>(null);
  
  const { camera } = useThree();
  const targetCameraPos = useRef(new THREE.Vector3(0, 0, 15));

  const fetchConnections = async (sourceNode: Node) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get(`/api/recommendations?movie_name=${encodeURIComponent(sourceNode.id)}`);
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
        const next = new Map(prev);
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

  // Fetch initial node connections on mount
  useEffect(() => {
    const initNode = nodes.get(initialMovie);
    if (initNode) {
      fetchConnections(initNode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMovie]);

  const handleNodeClick = (node: Node) => {
    setActiveNode(node.id);
    
    // Set target camera position (look at node, back up slightly on Z)
    targetCameraPos.current = new THREE.Vector3(
      node.position.x,
      node.position.y,
      node.position.z + 15
    );

    fetchConnections(node);
  };

  // Smooth camera and subtle rotation
  useFrame((state) => {
    if (groupRef.current) {
      // Very slow global rotation to make it feel alive
      groupRef.current.rotation.y += 0.001;
      groupRef.current.rotation.x += 0.0005;
    }

    // Lerp camera to target
    camera.position.lerp(targetCameraPos.current, 0.05);
    
    // Keep looking at active node if one exists
    const active = nodes.get(activeNode);
    if (active) {
      // Create a temporary vector to look at, lerping towards it
      // This prevents abrupt snapping
      const currentLookAt = new THREE.Vector3(0,0,0);
      camera.getWorldDirection(currentLookAt);
      currentLookAt.add(camera.position);
      
      currentLookAt.lerp(active.position, 0.05);
      camera.lookAt(currentLookAt);
    }
  });

  return (
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
            color="#4e5cff"
            opacity={0.3}
            transparent
            lineWidth={1.5}
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
  );
}
