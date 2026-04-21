"use client";

import { Html } from "@react-three/drei";
import { StageData } from "@/types/stage";
import { memo } from "react";

interface FaceProps {
  position: [number, number, number];
  rotation: [number, number, number];
  data: StageData | null;
  isActive: boolean;
  isCompleted: boolean;
  onClick: () => void;
}

export const Face = memo(({ position, rotation, data, isActive, isCompleted, onClick }: FaceProps) => {
  const opacity = isCompleted ? 1 : 0.1;

  return (
    <group position={position} rotation={rotation}>
      <mesh 
        onPointerOver={() => (document.body.style.cursor = "pointer")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
        onClick={(e) => {
          e.stopPropagation();
          if (isCompleted) onClick();
        }}
      >
        <planeGeometry args={[1.9, 1.9]} />
        <meshStandardMaterial
          color={isCompleted ? (isActive ? '#CA8A04' : '#1C1917') : (isActive ? "#CA8A04" : "#1C1917")}
          transparent
          opacity={opacity}
          emissive={isActive ? "#CA8A04" : "#000000"}
          emissiveIntensity={isActive ? 0.2 : 0}
          toneMapped={false}
        />
      </mesh>

      {isCompleted && data && (
        <Html
          transform
          distanceFactor={1.5}
          position={[0, 0, 0.02]}
          className="pointer-events-none select-none"
        >
          <div className="w-[450px] flex flex-col items-center justify-center text-center p-6">
            <h3 className={`font-heading text-4xl font-bold tracking-wider mb-4 ${isActive ? 'text-white' : 'text-accent'}`}>
              {data.title.toUpperCase()}
            </h3>
            <p className="font-body text-xl text-white/90 leading-relaxed line-clamp-4">
              {data.preview}
            </p>
          </div>
        </Html>
      )}
    </group>
  );
});

Face.displayName = "Face";
