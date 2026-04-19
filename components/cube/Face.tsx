"use client";

import { Html } from "@react-three/drei";
import { StageData } from "@/types/stage";
import { useMemo, memo } from "react";

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
          color={isActive ? "#CA8A04" : "#1C1917"}
          transparent
          opacity={opacity}
          emissive={isActive ? "#CA8A04" : "#000000"}
          emissiveIntensity={isActive ? 0.8 : 0}
          toneMapped={false}
        />
      </mesh>

      {isCompleted && data && (
        <Html
          transform
          distanceFactor={1.5}
          position={[0, 0, 0.01]}
          className="select-none"
        >
          <div 
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="flex flex-col items-center justify-center text-center p-6 w-80 h-80 bg-black/60 backdrop-blur-md rounded-2xl border border-white/20 hover:border-accent/60 transition-colors cursor-pointer"
          >
            <span className="text-xs uppercase tracking-[0.3em] text-accent font-black mb-4">
              {data.title}
            </span>
            <p className="text-white text-base font-body leading-relaxed max-w-[200px]">
              {data.preview}
            </p>
            {isActive && (
              <div className="mt-8 px-4 py-2 bg-accent/20 border border-accent/40 rounded-full text-[10px] text-accent font-bold animate-pulse tracking-widest uppercase">
                Active
              </div>
            )}
            {!isActive && (
              <div className="mt-8 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[8px] text-white/40 font-bold tracking-widest uppercase">
                View Details
              </div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
});

Face.displayName = "Face";

