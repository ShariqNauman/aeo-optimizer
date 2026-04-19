"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows, Float } from "@react-three/drei";
import { Cube } from "./Cube";
import { Stage, StageData } from "@/types/stage";
import { Suspense } from "react";
import { Loader } from "../ui/Loader";

interface CubeSceneProps {
  stages: Partial<Record<Stage, StageData>>;
  selectedStage: Stage | null;
  onFaceClick: (stage: Stage) => void;
}

export const CubeScene = ({ stages, selectedStage, onFaceClick }: CubeSceneProps) => {
  return (
    <div className="w-full h-[600px] relative">
      <Canvas shadows gl={{ antialias: true }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 4]} fov={50} />
          <OrbitControls 
            enablePan={false} 
            enableZoom={true} 
            minDistance={2.5} 
            maxDistance={8}
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
