"use client";

import { Text } from "@react-three/drei";
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
        <group position={[0, 0, 0.01]}>
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.18}
            color={isActive ? "white" : "#CA8A04"}
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.05}
            maxWidth={1.6}
            textAlign="center"
          >
            {data.title.toUpperCase()}
          </Text>

          <Text
            position={[0, -0.2, 0]}
            fontSize={0.12}
            color="white"
            maxWidth={1.7}
            textAlign="center"
            anchorX="center"
            anchorY="middle"
            lineHeight={1.4}
          >
            {data.preview}
          </Text>
        </group>
      )}
    </group>
  );
});

Face.displayName = "Face";
