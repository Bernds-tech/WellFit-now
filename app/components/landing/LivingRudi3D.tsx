"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const ASSET_ROOT = "/landing/rudi";

const clips = {
  walk: `${ASSET_ROOT}/rudi-walk.animation.glb`,
  run: `${ASSET_ROOT}/rudi-run.animation.glb`,
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

type RudiPhase = "travel" | "perform";
type ScrollMotion = "settled" | "anchored" | "catchup-up" | "catchup-down" | "catchup-jump";
type AttentionTarget = "login" | "register" | null;

type PointerAttention = {
  x: number;
  y: number;
  level: number;
};

const chapters: Chapter[] = [
  { clip: "walk", x: 72, y: 68, direction: -1, duration: 4800, message: "Ich sehe mich hier kurz um." },
  { clip: "sit", x: 45, y: 73, direction: 1, duration: 8000, message: "Den Tisch stelle ich mir einfach hierher.", prop: "table", layer: "front" },
  { clip: "point", x: 78, y: 34, direction: -1, duration: 5200, message: "Dort geht es zu Missionen und Erlebnissen." },
  { clip: "inspect", x: 18, y: 55, direction: 1, duration: 5200, message: "Hast du Fragen zu dieser WellFit-Welt?" },
  { clip: "jump", x: 48, y: 58, direction: 1, duration: 4200, message: "Manchmal nehme ich einfach die Abkürzung.", layer: "front" },
  { clip: "walk", x: 62, y: 72, direction: 1, duration: 4800, message: "Komm, ich zeige dir noch mehr." },
  { clip: "sit", x: 70, y: 70, direction: -1, duration: 7200, message: "Eine kurze Kaffeepause muss auch sein.", prop: "coffee" },
  { clip: "sit", x: 25, y: 72, direction: 1, duration: 7200, message: "Manchmal hole ich mir sogar meinen Liegestuhl.", prop: "lounge" },
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
      const wave = Math.sin(t * (moving ? 4.8 : 1.8) + x * 6.2 + row * 2.2);
      positions.setXYZ(index, x, y, original.current[offset + 2] + wave * row * (moving ? 0.075 : 0.025) + row * row * 0.045);
    }
    positions.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={mesh} position={[0, 1.08, -0.21]} rotation={[0.12, Math.PI, 0]}>
      <planeGeometry args={[0.9, 1.28, 10, 14]} />
      <meshStandardMaterial color="#56358f" roughness={0.68} metalness={0.08} side={THREE.DoubleSide} />
    </mesh>
  );
}

function CoffeeProp() {
  return (
    <group position={[0.48, 0.98, 0.32]} rotation={[0, 0, -0.1]}>
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
    <group position={[0.78, 0.78, 0.38]}>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.68, 0.72, 0.14, 32]} />
        <meshStandardMaterial color="#8b4b20" roughness={0.58} metalness={0.08} />
      </mesh>
      <mesh position={[0, -0.35, 0]}>
        <cylinderGeometry args={[0.09, 0.13, 0.78, 18]} />
        <meshStandardMaterial color="#38cfc9" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.75, 0]}>
        <cylinderGeometry args={[0.31, 0.38, 0.08, 24]} />
        <meshStandardMaterial color="#173f43" metalness={0.38} roughness={0.42} />
      </mesh>
    </group>
  );
}

function GroundShadow({ airborne }: { airborne: boolean }) {
  const shadow = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (!shadow.current) return;
    const material = shadow.current.material as THREE.MeshBasicMaterial;
    material.opacity = THREE.MathUtils.damp(material.opacity, airborne ? 0.12 : 0.28, 5, delta);
    shadow.current.scale.x = THREE.MathUtils.damp(shadow.current.scale.x, airborne ? 0.52 : 0.72, 5, delta);
    shadow.current.scale.y = THREE.MathUtils.damp(shadow.current.scale.y, airborne ? 0.09 : 0.13, 5, delta);
  });

  return (
    <mesh ref={shadow} position={[0, 0.025, -0.34]} scale={[0.72, 0.13, 1]}>
      <circleGeometry args={[0.72, 40]} />
      <meshBasicMaterial color="#001318" transparent opacity={0.28} depthWrite={false} />
    </mesh>
  );
}

function RudiModel({
  chapter,
  phase,
  attentionRef,
  attentionTarget,
  scrollOffsetRef,
  scrollMotion,
}: {
  chapter: Chapter;
  phase: RudiPhase;
  attentionRef: MutableRefObject<PointerAttention>;
  attentionTarget: AttentionTarget;
  scrollOffsetRef: MutableRefObject<number>;
  scrollMotion: ScrollMotion;
}) {
  const base = useGLTF(`${ASSET_ROOT}/rudi-rigged.glb`);
  const walkGlb = useGLTF(clips.walk);
  const runGlb = useGLTF(clips.run);
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
  const currentAction = useRef<THREE.AnimationAction | null>(null);
  const group = useRef<THREE.Group>(null);
  const character = useRef<THREE.Group>(null);
  const basePosition = useRef(new THREE.Vector2());
  const positionInitialized = useRef(false);
  const headBone = useRef<THREE.Bone | null>(null);
  const spineBone = useRef<THREE.Bone | null>(null);
  const viewport = useThree((state) => state.viewport);

  useEffect(() => {
    headBone.current = scene.getObjectByName("Head") as THREE.Bone | null;
    spineBone.current = scene.getObjectByName("Spine02") as THREE.Bone | null;
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    const animationGlbs = { walk: walkGlb, run: runGlb, idle: idleGlb, alert: alertGlb, point: pointGlb, inspect: inspectGlb, celebrate: celebrateGlb, jump: jumpGlb, sit: sitGlb, climb: climbGlb };
    const activeClip: ClipName = attentionTarget
      ? "celebrate"
      : scrollMotion === "catchup-jump"
        ? "jump"
        : scrollMotion === "catchup-up"
        ? "climb"
        : scrollMotion === "catchup-down"
          ? "run"
          : phase === "travel"
            ? "walk"
            : chapter.clip;
    const selected = animationGlbs[activeClip].animations[0] ?? base.animations[0];
    if (!selected) return;
    const nextAction = mixer.clipAction(selected);
    if (nextAction === currentAction.current) return;
    currentAction.current?.fadeOut(0.22);
    nextAction.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.28).play();
    currentAction.current = nextAction;
  }, [alertGlb, attentionTarget, base.animations, celebrateGlb, chapter.clip, climbGlb, idleGlb, inspectGlb, jumpGlb, mixer, phase, pointGlb, runGlb, scrollMotion, sitGlb, walkGlb]);

  useEffect(() => () => {
    mixer.stopAllAction();
  }, [mixer]);

  useFrame(({ clock }, delta) => {
    mixer.update(delta);
    if (group.current) {
      const rawTargetX = (chapter.x / 100 - 0.5) * viewport.width;
      const rawTargetY = (0.5 - chapter.y / 100) * viewport.height;
      const safeLeft = -viewport.width / 2 + 0.72;
      const safeRight = viewport.width / 2 - 0.72;
      const safeBottom = -viewport.height / 2 + 1.05;
      const safeTop = viewport.height / 2 - 2.35;
      const targetX = THREE.MathUtils.clamp(rawTargetX, safeLeft, safeRight);
      const targetY = THREE.MathUtils.clamp(rawTargetY, safeBottom, safeTop);
      if (!positionInitialized.current) {
        basePosition.current.set(targetX, targetY);
        positionInitialized.current = true;
      }
      const travelDirection = targetX >= basePosition.current.x ? 1 : -1;
      basePosition.current.x = THREE.MathUtils.damp(basePosition.current.x, targetX, 2.2, delta);
      basePosition.current.y = THREE.MathUtils.damp(basePosition.current.y, targetY, 2.2, delta);
      if (scrollMotion.startsWith("catchup-")) {
        scrollOffsetRef.current = THREE.MathUtils.damp(scrollOffsetRef.current, 0, 1.45, delta);
      }
      group.current.position.x = basePosition.current.x;
      const worldAnchoredY = basePosition.current.y + scrollOffsetRef.current / viewport.factor;
      group.current.position.y = THREE.MathUtils.clamp(worldAnchoredY, safeBottom, safeTop);
      if (scrollMotion === "catchup-jump") {
        group.current.position.y += Math.abs(Math.sin(clock.elapsedTime * 5.2)) * 0.16;
      }
      const facing = phase === "travel" || scrollMotion.startsWith("catchup-") ? travelDirection : chapter.direction;
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, facing === 1 ? 0.22 : -0.22, 7, delta);
      const excitement = attentionRef.current.level;
      group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, attentionRef.current.x * -0.035 * excitement, 6, delta);
      if (character.current) {
        const pulse = 0.66 * (1 + Math.sin(clock.elapsedTime * 8) * 0.018 * excitement);
        character.current.scale.setScalar(pulse);
      }
      if (headBone.current) {
        headBone.current.rotation.y += attentionRef.current.x * 0.28 * excitement;
        headBone.current.rotation.x += -attentionRef.current.y * 0.12 * excitement;
      }
      if (spineBone.current) spineBone.current.rotation.y += attentionRef.current.x * 0.08 * excitement;
    }
  });

  const bubbleMessage = attentionTarget === "login"
    ? "Ja! Dort kannst du dich anmelden – ich warte schon auf dich."
    : attentionTarget === "register"
      ? "Genau dort beginnt dein eigenes WellFit-Abenteuer!"
      : scrollMotion === "catchup-jump"
        ? "Da bist du ja – ich springe schnell nach!"
        : scrollMotion === "catchup-up"
        ? "Warte – ich klettere zu dir nach!"
        : scrollMotion === "catchup-down"
          ? "Nicht so schnell – ich komme schon!"
          : chapter.message;
  const showBubble = attentionTarget !== null || scrollMotion.startsWith("catchup-") || phase === "perform";

  return (
    <group ref={group}>
      <Html center position={[0, 2.15, 0]} style={{ pointerEvents: "none", opacity: showBubble ? 1 : 0, transition: "opacity 240ms ease" }}>
        <div className="relative w-64 rounded-2xl border border-cyan-100/45 bg-[#031820]/94 px-4 py-3 text-center text-xs font-bold leading-5 text-white shadow-[0_14px_36px_rgba(0,0,0,.36)] backdrop-blur-xl">
          {bubbleMessage}
          <span className="absolute bottom-[-9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-cyan-100/45 bg-[#031820]" />
        </div>
      </Html>
      <group ref={character} scale={0.66}>
        <GroundShadow airborne={scrollMotion === "catchup-jump" || (phase === "perform" && (chapter.clip === "jump" || chapter.clip === "climb"))} />
        <Cape moving={phase === "travel" || scrollMotion.startsWith("catchup-") || chapter.clip === "walk" || chapter.clip === "jump" || chapter.clip === "climb"} />
        <primitive object={scene} />
        {phase === "perform" && chapter.prop === "coffee" ? <CoffeeProp /> : null}
        {phase === "perform" && (chapter.prop === "table" || chapter.prop === "lounge") ? <FurnitureProp kind={chapter.prop} /> : null}
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
  const [phase, setPhase] = useState<RudiPhase>("perform");
  const [scrollMotion, setScrollMotion] = useState<ScrollMotion>("settled");
  const [attentionTarget, setAttentionTarget] = useState<AttentionTarget>(null);
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const attentionRef = useRef<PointerAttention>({ x: 0, y: 0, level: 0 });
  const scrollOffsetRef = useRef(0);
  const scrollDistanceRef = useRef(0);
  const chapter = chapters[chapterIndex];

  useEffect(() => {
    const timer = window.setTimeout(() => setWebgl(supportsWebGL()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const visibleTargets = Array.from(document.querySelectorAll<HTMLElement>("[data-rudi-cta]"))
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          return rect.bottom > 0 && rect.top < window.innerHeight;
        });
      let closestTarget: AttentionTarget = null;
      let closestDistance = Number.POSITIVE_INFINITY;

      visibleTargets.forEach((element) => {
        const rect = element.getBoundingClientRect();
        const dx = Math.max(rect.left - event.clientX, 0, event.clientX - rect.right);
        const dy = Math.max(rect.top - event.clientY, 0, event.clientY - rect.bottom);
        const distance = Math.hypot(dx, dy);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestTarget = element.dataset.rudiCta === "login" ? "login" : "register";
        }
      });

      const level = Math.max(0, 1 - closestDistance / 320);
      attentionRef.current = {
        x: event.clientX / window.innerWidth * 2 - 1,
        y: -(event.clientY / window.innerHeight * 2 - 1),
        level,
      };
      const nextTarget = level > 0.12 ? closestTarget : null;
      setAttentionTarget((current) => current === nextTarget ? current : nextTarget);
    };
    const handlePointerLeave = () => {
      attentionRef.current = { x: 0, y: 0, level: 0 };
      setAttentionTarget(null);
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".landing-page");
    if (!page) return;
    let lastScrollTop = page.scrollTop;
    let catchupTimer = 0;
    let settleTimer = 0;

    const handleScroll = () => {
      const nextScrollTop = page.scrollTop;
      const delta = nextScrollTop - lastScrollTop;
      lastScrollTop = nextScrollTop;
      if (Math.abs(delta) < 0.5) return;
      const limit = page.clientHeight * 0.62;
      scrollDistanceRef.current += Math.abs(delta);
      scrollOffsetRef.current = THREE.MathUtils.clamp(scrollOffsetRef.current - delta, -limit, limit);
      setScrollMotion("anchored");
      window.clearTimeout(catchupTimer);
      window.clearTimeout(settleTimer);
      catchupTimer = window.setTimeout(() => {
        const nextMotion = scrollDistanceRef.current > page.clientHeight * 0.42
          ? "catchup-jump"
          : scrollOffsetRef.current > 0
            ? "catchup-up"
            : "catchup-down";
        scrollDistanceRef.current = 0;
        setScrollMotion(nextMotion);
      }, 420);
      settleTimer = window.setTimeout(() => {
        scrollOffsetRef.current = 0;
        setScrollMotion("settled");
      }, 4200);
    };

    page.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      page.removeEventListener("scroll", handleScroll);
      window.clearTimeout(catchupTimer);
      window.clearTimeout(settleTimer);
    };
  }, []);

  useEffect(() => {
    if (scrollMotion !== "settled") return;
    const timer = window.setTimeout(() => {
      if (phase === "perform") {
        setChapterIndex((value) => (value + 1) % chapters.length);
        setPhase("travel");
        return;
      }
      setPhase("perform");
    }, phase === "travel" ? 2400 : chapter.duration);
    return () => window.clearTimeout(timer);
  }, [chapter.duration, chapterIndex, phase, scrollMotion]);

  if (webgl === null) return null;

  return createPortal(
    <aside
      aria-label="Rudi Rastlos, der lebendige WellFit-Begleiter"
      className={`rudi-world-overlay pointer-events-none fixed inset-0 hidden h-[100dvh] w-screen overflow-visible transition-opacity duration-500 lg:block ${chapter.layer === "front" ? "z-[60]" : "z-40"}`}
    >
      {webgl ? (
        <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 100 }} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }} dpr={[0.75, 1]}>
          <ambientLight intensity={1.25} />
          <directionalLight position={[2.5, 4, 3]} intensity={2.2} color="#fff7df" />
          <directionalLight position={[-3, 2, 1]} intensity={1.1} color="#7ff5ed" />
          <Suspense fallback={null}>
            <RudiModel
              chapter={chapter}
              phase={phase}
              attentionRef={attentionRef}
              attentionTarget={attentionTarget}
              scrollOffsetRef={scrollOffsetRef}
              scrollMotion={scrollMotion}
            />
          </Suspense>
        </Canvas>
      ) : (
        <>
          <div
            className="absolute w-64 -translate-x-1/2 -translate-y-[135%] rounded-2xl border border-cyan-100/45 bg-[#031820]/94 px-4 py-3 text-center text-xs font-bold leading-5 text-white shadow-[0_14px_36px_rgba(0,0,0,.36)] backdrop-blur-xl transition-[left,top] duration-[2200ms] ease-in-out"
            style={{ left: `clamp(8rem, ${chapter.x}%, calc(100% - 8rem))`, top: `clamp(8rem, ${chapter.y}%, calc(100% - 11rem))` }}
          >
            {chapter.message}
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${ASSET_ROOT}/rudi-front.png`}
            alt=""
            className="absolute w-[126px] -translate-x-1/2 -translate-y-full object-contain drop-shadow-[0_18px_34px_rgba(0,0,0,.45)] transition-[left,top] duration-[2200ms] ease-in-out"
            style={{ left: `clamp(4.5rem, ${chapter.x}%, calc(100% - 4.5rem))`, top: `clamp(10rem, ${chapter.y}%, calc(100% - 1.5rem))` }}
          />
        </>
      )}
    </aside>,
    document.body,
  );
}

useGLTF.preload(`${ASSET_ROOT}/rudi-rigged.glb`);
Object.values(clips).forEach((asset) => useGLTF.preload(asset));
