"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { ArBuddyMood, ArBuddyPosition } from "./ArBuddyOverlay";

export type ArScreenAnchor = {
  x: number;
  y: number;
};

type ArDragonSceneProps = {
  isCameraActive: boolean;
  mood: ArBuddyMood;
  position: ArBuddyPosition;
  actionCount: number;
  anchor: ArScreenAnchor | null;
  autoWalkEnabled: boolean;
  onDragonTap: () => void;
  onSceneTap: (anchor: ArScreenAnchor) => void;
};

type DragonModelProps = {
  mood: ArBuddyMood;
  position: ArBuddyPosition;
  actionCount: number;
  anchor: ArScreenAnchor | null;
  autoWalkEnabled: boolean;
  onDragonTap: () => void;
};

const dragonPositions: Record<ArBuddyPosition, [number, number, number]> = {
  nearLeft: [-1.15, -0.55, 0.35],
  center: [0, -0.42, -0.15],
  farRight: [1.2, -0.28, -0.65],
  nearRight: [1.05, -0.55, 0.3],
  farLeft: [-1.15, -0.3, -0.65],
};

function anchorToWorld(anchor: ArScreenAnchor): [number, number, number] {
  const worldX = (anchor.x - 0.5) * 2.7;
  const worldY = (0.5 - anchor.y) * 1.9 - 0.18;
  const worldZ = anchor.y > 0.62 ? 0.28 : anchor.y > 0.48 ? -0.2 : -0.66;
  return [worldX, worldY, worldZ];
}

function getMoodScale(mood: ArBuddyMood) {
  if (mood === "playful") return 1.08;
  if (mood === "happy") return 1.12;
  if (mood === "returning") return 1.04;
  if (mood === "curious") return 1.06;
  return 1;
}

function DragonModel({ mood, position, actionCount, anchor, autoWalkEnabled, onDragonTap }: DragonModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  const leftWingRef = useRef<THREE.Mesh>(null);
  const rightWingRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const sparkARef = useRef<THREE.Mesh>(null);
  const sparkBRef = useRef<THREE.Mesh>(null);
  const anchorBase = anchor ? anchorToWorld(anchor) : null;
  const fallbackPosition = dragonPositions[position];

  const bodyColor = useMemo(() => {
    if (mood === "happy") return "#ffb347";
    if (mood === "playful") return "#ff8a2a";
    if (mood === "curious") return "#facc15";
    if (mood === "listening") return "#67e8f9";
    return "#fb923c";
  }, [mood]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const group = groupRef.current;

    if (group) {
      const walkSpeed = mood === "playful" ? 1.85 : 1.15;
      const orbitX = anchorBase && autoWalkEnabled ? Math.sin(time * walkSpeed + actionCount) * 0.38 : 0;
      const orbitZ = anchorBase && autoWalkEnabled ? Math.cos(time * walkSpeed + actionCount) * 0.22 : 0;
      const driftX = !anchorBase && mood === "curious" ? Math.sin(time * 0.65 + actionCount) * 0.1 : 0;
      const driftZ = !anchorBase && mood === "listening" ? Math.cos(time * 0.55 + actionCount) * 0.06 : 0;
      const targetPosition: [number, number, number] = anchorBase
        ? [anchorBase[0] + orbitX, anchorBase[1], anchorBase[2] + orbitZ]
        : [fallbackPosition[0] + driftX, fallbackPosition[1], fallbackPosition[2] + driftZ];

      group.position.lerp(new THREE.Vector3(...targetPosition), mood === "returning" ? 0.14 : 0.08);
      group.rotation.y = anchorBase && autoWalkEnabled
        ? Math.sin(time * walkSpeed + actionCount) * 0.85
        : Math.sin(time * 0.9 + actionCount) * (mood === "curious" ? 0.34 : 0.22);
      group.rotation.z = Math.sin(time * 1.7) * 0.035;
      const bounceSpeed = mood === "playful" ? 4.8 : mood === "happy" ? 3.1 : 2.1;
      const bounceHeight = mood === "playful" ? 0.13 : mood === "happy" ? 0.075 : 0.045;
      group.position.y = targetPosition[1] + Math.sin(time * bounceSpeed) * bounceHeight;
      const isFar = anchorBase ? targetPosition[2] < -0.45 : position.includes("far");
      const breathing = 1 + Math.sin(time * 2.35) * 0.018;
      const scale = getMoodScale(mood) * (isFar ? 0.76 : 1) * breathing;
      group.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.12);
    }

    if (bodyRef.current) {
      bodyRef.current.rotation.x = Math.sin(time * 1.4) * 0.035;
    }

    if (leftWingRef.current) {
      leftWingRef.current.rotation.z = -0.55 + Math.sin(time * 6.4) * (mood === "playful" ? 0.46 : 0.24);
      leftWingRef.current.rotation.y = Math.sin(time * 4.6) * 0.09;
    }

    if (rightWingRef.current) {
      rightWingRef.current.rotation.z = 0.55 - Math.sin(time * 6.4) * (mood === "playful" ? 0.46 : 0.24);
      rightWingRef.current.rotation.y = -Math.sin(time * 4.6) * 0.09;
    }

    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(time * 2.7) * (mood === "happy" ? 0.46 : 0.35);
      tailRef.current.rotation.z = 0.25 + Math.sin(time * 2.1) * 0.12;
    }

    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(time * 1.2 + actionCount) * (mood === "curious" ? 0.3 : 0.18);
      headRef.current.rotation.x = Math.sin(time * 1.6) * 0.08;
    }

    const blink = Math.sin(time * 3.2) > 0.965 ? 0.25 : 1;
    if (leftEyeRef.current) {
      leftEyeRef.current.scale.y = THREE.MathUtils.lerp(leftEyeRef.current.scale.y, blink, 0.32);
    }
    if (rightEyeRef.current) {
      rightEyeRef.current.scale.y = THREE.MathUtils.lerp(rightEyeRef.current.scale.y, blink, 0.32);
    }

    if (glowRef.current) {
      const glowPulse = mood === "happy" || mood === "playful" || mood === "curious" ? 0.3 + Math.sin(time * 3.4) * 0.12 : 0.12;
      glowRef.current.scale.setScalar(1 + Math.sin(time * 2.8) * 0.08);
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = glowPulse;
    }

    if (sparkARef.current) {
      sparkARef.current.position.y = 0.72 + Math.sin(time * 3.1) * 0.08;
      sparkARef.current.position.x = -0.18 + Math.cos(time * 2.2) * 0.05;
    }
    if (sparkBRef.current) {
      sparkBRef.current.position.y = 0.6 + Math.cos(time * 2.7) * 0.07;
      sparkBRef.current.position.x = 0.22 + Math.sin(time * 2.4) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={anchorBase || fallbackPosition} onClick={(event) => { event.stopPropagation(); onDragonTap(); }}>
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.72, 48]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.26} />
      </mesh>

      <mesh ref={glowRef} position={[0, 0.1, 0.05]}>
        <sphereGeometry args={[0.58, 32, 32]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={0.14} depthWrite={false} />
      </mesh>

      <mesh ref={bodyRef} castShadow position={[0, 0, 0]}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial color={bodyColor} roughness={0.42} metalness={0.08} />
      </mesh>

      <mesh ref={headRef} castShadow position={[0, 0.42, 0.28]}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color={bodyColor} roughness={0.4} metalness={0.05} />
      </mesh>

      <mesh ref={leftEyeRef} castShadow position={[-0.1, 0.52, 0.51]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#042f35" roughness={0.18} />
      </mesh>
      <mesh ref={rightEyeRef} castShadow position={[0.1, 0.52, 0.51]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#042f35" roughness={0.18} />
      </mesh>

      <mesh castShadow position={[-0.16, 0.71, 0.22]} rotation={[0.25, 0.1, -0.35]}>
        <coneGeometry args={[0.06, 0.22, 12]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.32} />
      </mesh>
      <mesh castShadow position={[0.16, 0.71, 0.22]} rotation={[0.25, -0.1, 0.35]}>
        <coneGeometry args={[0.06, 0.22, 12]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.32} />
      </mesh>

      <mesh ref={leftWingRef} castShadow position={[-0.43, 0.12, -0.04]} rotation={[0.25, 0.25, -0.55]}>
        <coneGeometry args={[0.22, 0.62, 3]} />
        <meshStandardMaterial color="#22d3ee" roughness={0.34} transparent opacity={0.88} />
      </mesh>
      <mesh ref={rightWingRef} castShadow position={[0.43, 0.12, -0.04]} rotation={[0.25, -0.25, 0.55]}>
        <coneGeometry args={[0.22, 0.62, 3]} />
        <meshStandardMaterial color="#22d3ee" roughness={0.34} transparent opacity={0.88} />
      </mesh>

      <mesh ref={tailRef} castShadow position={[0, -0.04, -0.48]} rotation={[1.25, 0, 0.25]}>
        <coneGeometry args={[0.13, 0.72, 16]} />
        <meshStandardMaterial color="#f97316" roughness={0.46} />
      </mesh>

      <mesh castShadow position={[-0.24, -0.34, 0.22]} rotation={[0.15, 0, -0.18]}>
        <coneGeometry args={[0.08, 0.24, 12]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.35} />
      </mesh>
      <mesh castShadow position={[0.24, -0.34, 0.22]} rotation={[0.15, 0, 0.18]}>
        <coneGeometry args={[0.08, 0.24, 12]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.35} />
      </mesh>

      {mood === "happy" || mood === "playful" || mood === "curious" ? (
        <>
          <mesh ref={sparkARef} position={[-0.18, 0.72, 0.7]}>
            <sphereGeometry args={[0.045, 16, 16]} />
            <meshBasicMaterial color="#fde68a" transparent opacity={0.88} />
          </mesh>
          <mesh ref={sparkBRef} position={[0.22, 0.6, 0.72]}>
            <sphereGeometry args={[0.035, 16, 16]} />
            <meshBasicMaterial color="#67e8f9" transparent opacity={0.82} />
          </mesh>
        </>
      ) : null}
    </group>
  );
}

export default function ArDragonScene({ isCameraActive, mood, position, actionCount, anchor, autoWalkEnabled, onDragonTap, onSceneTap }: ArDragonSceneProps) {
  if (!isCameraActive) {
    return null;
  }

  return (
    <div className="pointer-events-auto absolute inset-0 z-20">
      <Canvas
        shadows
        camera={{ position: [0, 0.65, 3.4], fov: 46 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
        onPointerDown={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          onSceneTap({
            x: (event.clientX - rect.left) / rect.width,
            y: (event.clientY - rect.top) / rect.height,
          });
        }}
      >
        <ambientLight intensity={1.1} />
        <directionalLight position={[2.8, 4, 3]} intensity={2.1} castShadow />
        <pointLight position={[-1.8, 1.6, 2.2]} intensity={0.8} color="#67e8f9" />
        {anchor ? (
          <mesh position={anchorToWorld(anchor)} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.46, 0.51, 64]} />
            <meshBasicMaterial color="#67e8f9" transparent opacity={0.68} />
          </mesh>
        ) : null}
        <DragonModel mood={mood} position={position} actionCount={actionCount} anchor={anchor} autoWalkEnabled={autoWalkEnabled} onDragonTap={onDragonTap} />
      </Canvas>
    </div>
  );
}
