"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const ASSET_ROOT = "/landing/rudi";

const clips = {
  walk: `${ASSET_ROOT}/rudi-walk.animation.glb`,
  idle: `${ASSET_ROOT}/rudi-idle.animation.glb`,
  alert: `${ASSET_ROOT}/rudi-alert.animation.glb`,
  point: `${ASSET_ROOT}/rudi-point.animation.glb`,
  inspect: `${ASSET_ROOT}/rudi-inspect.animation.glb`,
  celebrate: `${ASSET_ROOT}/rudi-celebrate.animation.glb`,
  jump: `${ASSET_ROOT}/rudi-jump.animation.glb`,
  sit: `${ASSET_ROOT}/rudi-sit.animation.glb`,
  climb: `${ASSET_ROOT}/rudi-climb.animation.glb`,
} as const;

type ClipName = keyof typeof clips;

type Chapter = {
  clip: ClipName;
  x: number;
  y: number;
  direction: 1 | -1;
  duration: number;
  message: string;
  prop?: "coffee" | "table" | "lounge";
  layer?: "front" | "back";
};

const chapters: Chapter[] = [
  { clip: "walk", x: 72, y: 68, direction: -1, duration: 7200, message: "Ich sehe mich hier kurz um." },
  { clip: "point", x: 78, y: 34, direction: -1, duration: 6200, message: "Dort geht es zu Missionen und Erlebnissen." },
  { clip: "inspect", x: 18, y: 55, direction: 1, duration: 6500, message: "Hast du Fragen zu dieser WellFit-Welt?" },
  { clip: "sit", x: 45, y: 73, direction: 1, duration: 8000, message: "Den Tisch stelle ich mir einfach hierher.", prop: "table", layer: "front" },
  { clip: "walk", x: 48, y: 72, direction: 1, duration: 7000, message: "Komm, ich zeige dir noch mehr." , layer: "back"},
  { clip: "sit", x: 70, y: 70, direction: -1, duration: 9000, message: "Eine kurze Kaffeepause muss auch sein.", prop: "coffee" },
  { clip: "sit", x: 25, y: 72, direction: 1, duration: 8500, message: "Manchmal hole ich mir sogar meinen Liegestuhl.", prop: "lounge" },
  { clip: "alert", x: 26, y: 31, direction: 1, duration: 5500, message: "Moment – hast du den Reality Glitch schon entdeckt?" },
  { clip: "celebrate", x: 52, y: 61, direction: 1, duration: 6000, message: "Sehr gut! Du kennst WellFit schon ziemlich gut." },
  { clip: "idle", x: 84, y: 65, direction: -1, duration: 7000, message: "Ich wohne hier. Schau dich ruhig weiter um." },
];

function Cape({ moving }: { moving: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);
  const original = useRef<Float32Array | null>(null);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const geometry = mesh.current.geometry;
    const positions = geometry.attributes.position as THREE.BufferAttribute;
    if (!original.current) original.current = Float32Array.from(positions.array as ArrayLike<number>);
    const t = clock.elapsedTime;
    for (let index = 0; index < positions.count; index += 1) {
      const offset = index * 3;
      const x = original.current[offset];
      const y = original.current[offset + 1];
      const row = THREE.MathUtils.clamp(0.5 - y / 1.28, 0, 1);
      const wave = Math.sin(t * (moving ? 6.2 : 2.1) + x * 7 + row * 2.4);
      positions.setXYZ(index, x, y, original.current[offset + 2] + wave * row * (moving ? 0.11 : 0.035) + row * row * 0.08);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={mesh} position={[0, 0.43, -0.2]} rotation={[0.04, Math.PI, 0]}>
      <planeGeometry args={[0.9, 1.28, 10, 14]} />
      <meshStandardMaterial color="#56358f" roughness={0.68} metalness={0.08} side={THREE.DoubleSide} />
    </mesh>
  );
}

function CoffeeProp() {
  return (
    <group position={[0.5, 0.15, 0.3]} rotation={[0, 0, -0.1]}>
      <mesh>
        <cylinderGeometry args={[0.11, 0.09, 0.25, 20]} />
        <meshStandardMaterial color="#f5e7d1" roughness={0.38} />
      </mesh>
      <mesh position={[0.12, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.07, 0.018, 8, 18, Math.PI * 1.6]} />
        <meshStandardMaterial color="#f5e7d1" roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.13, 0]}>
        <cylinderGeometry args={[0.085, 0.085, 0.008, 20]} />
        <meshStandardMaterial color="#603915" roughness={0.9} />
      </mesh>
    </group>
  );
}

function FurnitureProp({ kind }: { kind: "table" | "lounge" }) {
  if (kind === "lounge") {
    return (
      <group position={[-0.05, -0.78, -0.2]} rotation={[0, -0.12, 0]}>
        <mesh position={[0, 0.12, 0]} rotation={[-0.34, 0, 0]}>
          <boxGeometry args={[1.1, 0.08, 0.78]} />
          <meshStandardMaterial color="#f0b44b" roughness={0.62} />
        </mesh>
        <mesh position={[0, 0.62, -0.32]} rotation={[-0.88, 0, 0]}>
          <boxGeometry args={[1.1, 0.08, 1.15]} />
          <meshStandardMaterial color="#f0b44b" roughness={0.62} />
        </mesh>
        {[-0.46, 0.46].map((x) => (
          <group key={x} position={[x, -0.14, 0]}>
            <mesh rotation={[0, 0, 0.16]}><cylinderGeometry args={[0.025, 0.025, 1.05, 10]} /><meshStandardMaterial color="#d7e4e6" metalness={0.75} roughness={0.28} /></mesh>
            <mesh position={[0, 0, -0.3]} rotation={[0, 0, -0.34]}><cylinderGeometry args={[0.025, 0.025, 1.05, 10]} /><meshStandardMaterial color="#d7e4e6" metalness={0.75} roughness={0.28} /></mesh>
          </group>
        ))}
      </group>
    );
  }

  return (
    <group position={[0.28, -0.48, 0.45]}>
      <mesh><cylinderGeometry args={[0.62, 0.68, 0.1, 28]} /><meshStandardMaterial color="#4f2c18" roughness={0.72} /></mesh>
      <mesh position={[0, -0.48, 0]}><cylinderGeometry args={[0.08, 0.12, 0.95, 16]} /><meshStandardMaterial color="#243b3d" metalness={0.45} roughness={0.4} /></mesh>
    </group>
  );
}

function RudiModel({ chapter }: { chapter: Chapter }) {
  const base = useGLTF(`${ASSET_ROOT}/rudi-rigged.glb`);
  const walkGlb = useGLTF(clips.walk);
  const idleGlb = useGLTF(clips.idle);
  const alertGlb = useGLTF(clips.alert);
  const pointGlb = useGLTF(clips.point);
  const inspectGlb = useGLTF(clips.inspect);
  const celebrateGlb = useGLTF(clips.celebrate);
  const jumpGlb = useGLTF(clips.jump);
  const sitGlb = useGLTF(clips.sit);
  const climbGlb = useGLTF(clips.climb);
  const scene = useMemo(() => clone(base.scene), [base.scene]);
  const mixer = useMemo(() => new THREE.AnimationMixer(scene), [scene]);
  const group = useRef<THREE.Group>(null);
  const viewport = useThree((state) => state.viewport);

  useEffect(() => {
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    const animationGlbs = { walk: walkGlb, idle: idleGlb, alert: alertGlb, point: pointGlb, inspect: inspectGlb, celebrate: celebrateGlb, jump: jumpGlb, sit: sitGlb, climb: climbGlb };
    const selected = animationGlbs[chapter.clip].animations[0] ?? base.animations[0];
    if (!selected) return;
    const action = mixer.clipAction(selected);
    action.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.28).play();
    return () => {
      action.fadeOut(0.22);
      window.setTimeout(() => action.stop(), 240);
    };
  }, [alertGlb, base.animations, celebrateGlb, chapter.clip, climbGlb, idleGlb, inspectGlb, jumpGlb, mixer, pointGlb, sitGlb, walkGlb]);

  useFrame((_, delta) => {
    mixer.update(delta);
    if (group.current) {
      const targetX = (chapter.x / 100 - 0.5) * viewport.width;
      const targetY = (0.5 - chapter.y / 100) * viewport.height;
      group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 2.2, delta);
      group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 2.2, delta);
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, chapter.direction === 1 ? 0.22 : -0.22, 7, delta);
    }
  });

  return (
    <group ref={group}>
      <group scale={0.94}>
        <Cape moving={chapter.clip === "walk" || chapter.clip === "jump" || chapter.clip === "climb"} />
        <primitive object={scene} />
        {chapter.prop === "coffee" ? <CoffeeProp /> : null}
        {chapter.prop === "table" || chapter.prop === "lounge" ? <FurnitureProp kind={chapter.prop} /> : null}
      </group>
    </group>
  );
}

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

export default function LivingRudi3D() {
  const [chapterIndex, setChapterIndex] = useState(0);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const chapter = chapters[chapterIndex];

  useEffect(() => {
    const timer = window.setTimeout(() => setWebgl(supportsWebGL()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setChapterIndex((value) => (value + 1) % chapters.length), chapter.duration);
    return () => window.clearTimeout(timer);
  }, [chapter.duration, chapterIndex]);

  if (webgl === null) return null;

  return (
    <aside
      aria-label="Rudi Rastlos, der lebendige WellFit-Begleiter"
      className={`pointer-events-none fixed inset-0 hidden overflow-visible transition-opacity duration-500 lg:block ${chapter.layer === "back" ? "z-10 opacity-90" : "z-[60]"}`}
    >
      <div
        className="absolute w-64 -translate-x-1/2 -translate-y-[135%] rounded-2xl border border-cyan-100/45 bg-[#031820]/94 px-4 py-3 text-center text-xs font-bold leading-5 text-white shadow-[0_14px_36px_rgba(0,0,0,.36)] backdrop-blur-xl transition-[left,top] duration-[2200ms] ease-in-out"
        style={{ left: `${chapter.x}%`, top: `${chapter.y}%` }}
      >
        {chapter.message}
        <span className="absolute bottom-[-9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-cyan-100/45 bg-[#031820]" />
      </div>

      {webgl ? (
        <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 100 }} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }} dpr={[0.75, 1]}>
          <ambientLight intensity={1.25} />
          <directionalLight position={[2.5, 4, 3]} intensity={2.2} color="#fff7df" />
          <directionalLight position={[-3, 2, 1]} intensity={1.1} color="#7ff5ed" />
          <Suspense fallback={null}>
            <RudiModel chapter={chapter} />
          </Suspense>
        </Canvas>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`${ASSET_ROOT}/rudi-front.png`}
          alt=""
          className="absolute w-[180px] -translate-x-1/2 -translate-y-full object-contain drop-shadow-[0_18px_34px_rgba(0,0,0,.45)] transition-[left,top] duration-[2200ms] ease-in-out"
          style={{ left: `${chapter.x}%`, top: `${chapter.y}%` }}
        />
      )}
    </aside>
  );
}

useGLTF.preload(`${ASSET_ROOT}/rudi-rigged.glb`);
Object.values(clips).forEach((asset) => useGLTF.preload(asset));
