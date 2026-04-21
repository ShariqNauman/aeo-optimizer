"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Face } from "./Face";
import { Stage, StageData } from "@/types/stage";
import { Edges } from "@react-three/drei";

interface CubeProps {
  stages: Partial<Record<Stage, StageData>>;
  selectedStage: Stage | null;
  onFaceClick: (stage: Stage) => void;
}

const FACES: { stage: Stage; position: [number, number, number]; rotation: [number, number, number] }[] = [
  { stage: "original", position: [0, 0, 1], rotation: [0, 0, 0] },         // Front
  { stage: "evaluation", position: [1, 0, 0], rotation: [0, Math.PI / 2, 0] }, // Right
  { stage: "gap", position: [0, 0, -1], rotation: [0, Math.PI, 0] },        // Back
  { stage: "optimization", position: [-1, 0, 0], rotation: [0, -Math.PI / 2, 0] }, // Left
  { stage: "validation", position: [0, 1, 0], rotation: [-Math.PI / 2, 0, 0] },  // Top
  { stage: "result", position: [0, -1, 0], rotation: [Math.PI / 2, 0, 0] },     // Bottom
];

export const Cube = ({ stages, selectedStage, onFaceClick }: CubeProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const boxRef = useRef<THREE.Mesh>(null);
  const isComplete = Object.keys(stages).length === 6;

  const targetQuaternion = useMemo(() => new THREE.Quaternion(), []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      if (!selectedStage) {
        meshRef.current.rotation.y += delta * 0.1;
        meshRef.current.rotation.x += delta * 0.05;
      } else {
        const selectedFace = FACES.find(f => f.stage === selectedStage);
        if (selectedFace) {
          const faceQuat = new THREE.Quaternion().setFromEuler(
            new THREE.Euler(selectedFace.rotation[0], selectedFace.rotation[1], selectedFace.rotation[2], 'XYZ')
          );
          targetQuaternion.copy(faceQuat).invert();
          meshRef.current.quaternion.slerp(targetQuaternion, 5 * delta);
        }
      }
    }

    if (boxRef.current && isComplete) {
      const material = boxRef.current.material as THREE.MeshStandardMaterial;
      const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.2 + 0.3;
      material.emissiveIntensity = pulse;
    }
  });

  return (
    <group ref={meshRef}>
      {/* The Core "Black Box" */}
      <mesh ref={boxRef}>
        <boxGeometry args={[1.98, 1.98, 1.98]} />
        <meshStandardMaterial 
          color="#0C0A09" 
          metalness={0.9} 
          roughness={0.1}
          emissive={isComplete ? "#CA8A04" : "#000000"}
          emissiveIntensity={0}
        />
        <Edges color="#CA8A04" threshold={15} scale={1.001} />
      </mesh>

      {/* Interactive Faces */}
      {FACES.map((f) => (
        <Face
          key={f.stage}
          position={f.position}
          rotation={f.rotation}
          data={stages[f.stage] || null}
          isActive={selectedStage === f.stage}
          isCompleted={!!stages[f.stage]}
          onClick={() => onFaceClick(f.stage)}
        />
      ))}
    </group>
  );
};
