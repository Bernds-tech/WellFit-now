"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { ArBuddyMood, ArBuddyPosition } from "./ArBuddyOverlay";

export type ArScreenAnchor = { x: number; y: number };

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

type DragonModelProps = Omit<ArDragonSceneProps, "isCameraActive" | "onSceneTap">;

const positions: Record<ArBuddyPosition, [number, number, number]> = {
  nearLeft: [-1.05, -0.55, 0.3],
  center: [0, -0.43, -0.12],
  farRight: [1.05, -0.32, -0.62],
  nearRight: [1, -0.55, 0.28],
  farLeft: [-1.05, -0.32, -0.62],
};

function anchorToWorld(anchor: ArScreenAnchor): [number, number, number] {
  return [(anchor.x - 0.5) * 2.7, (0.5 - anchor.y) * 1.9 - 0.18, anchor.y > 0.62 ? 0.28 : anchor.y > 0.48 ? -0.2 : -0.66];
}

function buddyColor(mood: ArBuddyMood) {
  if (mood === "happy") return "#ffb347";
  if (mood === "playful") return "#ff8a2a";
  if (mood === "curious") return "#facc15";
  if (mood === "listening") return "#67e8f9";
  return "#fb923c";
}

function ClearCanvas() {
  useFrame(({ gl, scene }) => {
    gl.setClearAlpha(0);
    gl.setClearColor(0x000000, 0);
    scene.background = null;
  });
  return null;
}

function DragonModel({ mood, position, actionCount, anchor, autoWalkEnabled, onDragonTap }: DragonModelProps) {
  const root = useRef<THREE.Group>(null);
  const head = useRef<THREE.Mesh>(null);
  const tail = useRef<THREE.Mesh>(null);
  const leftWing = useRef<THREE.Mesh>(null);
  const rightWing = useRef<THREE.Mesh>(null);
  const leftEye = useRef<THREE.Mesh>(null);
  const rightEye = useRef<THREE.Mesh>(null);
  const anchorBase = anchor ? anchorToWorld(anchor) : null;
  const fallback = positions[position];
  const color = useMemo(() => buddyColor(mood), [mood]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const target = new THREE.Vector3(...fallback);

    if (anchorBase) {
      target.set(anchorBase[0], anchorBase[1], anchorBase[2]);
      if (autoWalkEnabled) {
        target.x += Math.sin(t * 1.8 + actionCount) * 0.42;
        target.z += Math.cos(t * 1.8 + actionCount) * 0.24;
      }
    } else if (autoWalkEnabled || mood === "playful") {
      target.x += Math.sin(t * 1.15 + actionCount) * 0.28;
      target.z += Math.cos(t * 1.05 + actionCount) * 0.12;
    } else if (mood === "curious") {
      target.x += Math.sin(t * 0.65 + actionCount) * 0.12;
    }

    if (root.current) {
      root.current.position.lerp(target, 0.09);
      root.current.position.y = target.y + Math.sin(t * (mood === "playful" ? 5.2 : 2.4)) * (mood === "playful" ? 0.13 : 0.05);
      root.current.rotation.y = Math.sin(t * 1.2 + actionCount) * (autoWalkEnabled ? 0.75 : 0.25);
      root.current.rotation.z = Math.sin(t * 1.8) * 0.04;
      const far = target.z < -0.45;
      const scale = (far ? 0.76 : 1) * (mood === "happy" ? 1.12 : mood === "playful" ? 1.08 : 1) * (1 + Math.sin(t * 2.3) * 0.018);
      root.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.12);
    }

    if (head.current) {
      head.current.rotation.y = Math.sin(t * 1.4) * (mood === "curious" ? 0.35 : 0.18);
      head.current.rotation.x = Math.sin(t * 1.8) * 0.08;
    }
    if (tail.current) {
      tail.current.rotation.y = Math.sin(t * 2.8) * 0.45;
      tail.current.rotation.z = 0.25 + Math.sin(t * 2.1) * 0.14;
    }
    if (leftWing.current) leftWing.current.rotation.z = -0.55 + Math.sin(t * 6.5) * (mood === "playful" ? 0.48 : 0.24);
    if (rightWing.current) rightWing.current.rotation.z = 0.55 - Math.sin(t * 6.5) * (mood === "playful" ? 0.48 : 0.24);

    const blink = Math.sin(t * 3.1) > 0.965 ? 0.2 : 1;
    if (leftEye.current) leftEye.current.scale.y = THREE.MathUtils.lerp(leftEye.current.scale.y, blink, 0.35);
    if (rightEye.current) rightEye.current.scale.y = THREE.MathUtils.lerp(rightEye.current.scale.y, blink, 0.35);
  });

  return (
    <group ref={root} position={anchorBase || fallback} onClick={(event) => { event.stopPropagation(); onDragonTap(); }}>
      <mesh position={[0, -0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.72, 48]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0.08, 0.04]}>
        <sphereGeometry args={[0.58, 24, 24]} />
        <meshBasicMaterial color="#67e8f9" transparent opacity={mood === "happy" || mood === "playful" ? 0.28 : 0.12} depthWrite={false} />
      </mesh>
      <mesh position={[0, 0, 0]} castShadow>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.42} />
      </mesh>
      <mesh ref={head} position={[0, 0.42, 0.28]} castShadow>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh ref={leftEye} position={[-0.1, 0.52, 0.51]}><sphereGeometry args={[0.045, 16, 16]} /><meshStandardMaterial color="#042f35" /></mesh>
      <mesh ref={rightEye} position={[0.1, 0.52, 0.51]}><sphereGeometry args={[0.045, 16, 16]} /><meshStandardMaterial color="#042f35" /></mesh>
      <mesh position={[-0.16, 0.71, 0.22]} rotation={[0.25, 0.1, -0.35]}><coneGeometry args={[0.06, 0.22, 12]} /><meshStandardMaterial color="#fef3c7" /></mesh>
      <mesh position={[0.16, 0.71, 0.22]} rotation={[0.25, -0.1, 0.35]}><coneGeometry args={[0.06, 0.22, 12]} /><meshStandardMaterial color="#fef3c7" /></mesh>
      <mesh ref={leftWing} position={[-0.43, 0.12, -0.04]} rotation={[0.25, 0.25, -0.55]}><coneGeometry args={[0.22, 0.62, 3]} /><meshStandardMaterial color="#22d3ee" transparent opacity={0.88} /></mesh>
      <mesh ref={rightWing} position={[0.43, 0.12, -0.04]} rotation={[0.25, -0.25, 0.55]}><coneGeometry args={[0.22, 0.62, 3]} /><meshStandardMaterial color="#22d3ee" transparent opacity={0.88} /></mesh>
      <mesh ref={tail} position={[0, -0.04, -0.48]} rotation={[1.25, 0, 0.25]}><coneGeometry args={[0.13, 0.72, 16]} /><meshStandardMaterial color="#f97316" /></mesh>
      {(mood === "happy" || mood === "playful" || mood === "curious") && (
        <>
          <mesh position={[-0.18, 0.72, 0.7]}><sphereGeometry args={[0.045, 16, 16]} /><meshBasicMaterial color="#fde68a" transparent opacity={0.88} /></mesh>
          <mesh position={[0.22, 0.6, 0.72]}><sphereGeometry args={[0.035, 16, 16]} /><meshBasicMaterial color="#67e8f9" transparent opacity={0.82} /></mesh>
        </>
      )}
    </group>
  );
}

export default function ArDragonScene({ isCameraActive, mood, position, actionCount, anchor, autoWalkEnabled, onDragonTap, onSceneTap }: ArDragonSceneProps) {
  if (!isCameraActive) return null;

  return (
    <div className="pointer-events-auto absolute inset-0 z-20 bg-transparent">
      <Canvas
        shadows
        camera={{ position: [0, 0.65, 3.4], fov: 46 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance", premultipliedAlpha: false }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
        onPointerDown={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          onSceneTap({ x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height });
        }}
      >
        <ClearCanvas />
        <ambientLight intensity={1.1} />
        <directionalLight position={[2.8, 4, 3]} intensity={2.1} castShadow />
        <pointLight position={[-1.8, 1.6, 2.2]} intensity={0.8} color="#67e8f9" />
        {anchor && (
          <mesh position={anchorToWorld(anchor)} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.46, 0.51, 64]} />
            <meshBasicMaterial color="#67e8f9" transparent opacity={0.68} depthWrite={false} />
          </mesh>
        )}
        <DragonModel mood={mood} position={position} actionCount={actionCount} anchor={anchor} autoWalkEnabled={autoWalkEnabled} onDragonTap={onDragonTap} />
      </Canvas>
    </div>
  );
}
