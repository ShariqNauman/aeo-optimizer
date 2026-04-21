"use client";

import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float } from "@react-three/drei";
import { Cube } from "./Cube";
import { Stage, StageData } from "@/types/stage";
import { Suspense, useMemo } from "react";
import { Loader } from "../ui/Loader";
import * as THREE from "three";

interface CubeSceneProps {
  stages: Partial<Record<Stage, StageData>>;
  selectedStage: Stage | null;
  onFaceClick: (stage: Stage) => void;
}

const CameraController = ({ selectedStage }: { selectedStage: Stage | null }) => {
  const { camera } = useThree();
  const targetPos = useMemo(() => new THREE.Vector3(0, 0, 4), []);
  const targetLook = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useFrame((state, delta) => {
    if (selectedStage) {
      // Smoothly glide camera back to home
      camera.position.lerp(targetPos, 4 * delta);
      camera.lookAt(targetLook);
    }
  });

  return null;
};

export const CubeScene = ({ stages, selectedStage, onFaceClick }: CubeSceneProps) => {
  return (
    <div className="w-full h-[600px] relative">
      <Canvas shadows gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
          <CameraController selectedStage={selectedStage} />
          
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            minDistance={2.5} 
            maxDistance={8}
            enableRotate={!selectedStage}
            autoRotate={!selectedStage}
            autoRotateSpeed={0.3}
          />
          
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} castShadow />
          <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
          
          <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <Cube 
              stages={stages} 
              selectedStage={selectedStage} 
              onFaceClick={onFaceClick} 
            />
          </Float>
          
          <ContactShadows 
            position={[0, -2, 0]} 
            opacity={0.4} 
            scale={10} 
            blur={2.5} 
            far={4} 
          />
          <Environment preset="city" />
        </Suspense>
      </Canvas>
    </div>
  );
};
