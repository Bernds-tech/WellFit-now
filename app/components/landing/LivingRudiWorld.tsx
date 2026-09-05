"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";

const ASSET_ROOT = "/landing/rudi";
const INITIAL_ANCHOR = "hero-wellfit-4";
const SURFACE_SELECTOR = [
  "[data-rudi-surface]",
  ".landing-page section h2",
  ".landing-page section article",
  ".landing-page section img",
].join(",");

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
type Motion = "initial-climb" | "perched" | "walk" | "peek" | "catchup-from-top" | "catchup-from-bottom";
type AttentionTarget = "login" | "register" | null;
type WorldLayer = "front" | "back";

type PointerAttention = {
  x: number;
  y: number;
  level: number;
};

type WorldModelProps = {
  anchorRef: MutableRefObject<HTMLElement | null>;
  surfaceFractionRef: MutableRefObject<number>;
  motion: Motion;
  routeVersion: number;
  attentionRef: MutableRefObject<PointerAttention>;
  attentionTarget: AttentionTarget;
};

function normalizeAnimationClip(source: THREE.AnimationClip, scene: THREE.Object3D) {
  const clip = source.clone();
  const hips = scene.getObjectByName("Hips");

  clip.tracks = clip.tracks
    .filter((track) => !track.name.endsWith(".scale"))
    .map((track) => {
      const normalized = track.clone();

      if (hips && normalized.name === "Hips.position") {
        const values = normalized.values;
        const offsetX = hips.position.x - values[0];
        const offsetY = hips.position.y - values[1];
        const offsetZ = hips.position.z - values[2];
        for (let index = 0; index < values.length; index += 3) {
          values[index] += offsetX;
          values[index + 1] += offsetY;
          values[index + 2] += offsetZ;
        }
      }

      if (hips && normalized.name === "Hips.quaternion") {
        const values = normalized.values;
        const first = new THREE.Quaternion(values[0], values[1], values[2], values[3]).normalize();
        const correction = hips.quaternion.clone().multiply(first.invert());
        const frame = new THREE.Quaternion();
        for (let index = 0; index < values.length; index += 4) {
          frame.set(values[index], values[index + 1], values[index + 2], values[index + 3]).normalize();
          frame.premultiply(correction).normalize();
          values[index] = frame.x;
          values[index + 1] = frame.y;
          values[index + 2] = frame.z;
          values[index + 3] = frame.w;
        }
      }

      return normalized;
    });

  clip.name = `${source.name}-wellfit-world-normalized`;
  clip.resetDuration();
  return clip;
}

function Cape({ moving, anchor, character }: { moving: boolean; anchor: MutableRefObject<THREE.Bone | null>; character: MutableRefObject<THREE.Group | null> }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const original = useRef<Float32Array | null>(null);
  const anchorPosition = useRef(new THREE.Vector3());

  useFrame(({ clock }, delta) => {
    if (group.current && anchor.current && character.current) {
      anchor.current.getWorldPosition(anchorPosition.current);
      character.current.worldToLocal(anchorPosition.current);
      anchorPosition.current.add(new THREE.Vector3(0, 0.1, -0.2));
      group.current.position.lerp(anchorPosition.current, 1 - Math.exp(-14 * delta));
    }
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
    <group ref={group} position={[0, 1.18, -0.2]}>
      <mesh ref={mesh} position={[0, -0.48, 0]} rotation={[0.12, Math.PI, 0]}>
        <planeGeometry args={[0.82, 1.08, 10, 12]} />
        <meshStandardMaterial color="#56358f" roughness={0.68} metalness={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function GroundShadow({ climbing }: { climbing: boolean }) {
  return (
    <mesh position={[0, 0.025, -0.34]} scale={[climbing ? 0.42 : 0.72, climbing ? 0.08 : 0.13, 1]}>
      <circleGeometry args={[0.72, 40]} />
      <meshBasicMaterial color="#001318" transparent opacity={climbing ? 0.1 : 0.27} depthWrite={false} />
    </mesh>
  );
}

function WorldRudiModel({ anchorRef, surfaceFractionRef, motion, routeVersion, attentionRef, attentionTarget }: WorldModelProps) {
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
  const normalizedClips = useMemo(() => {
    const fallback = base.animations[0] ?? walkGlb.animations[0];
    if (!fallback) throw new Error("Rudi animation baseline is missing");
    return {
      walk: normalizeAnimationClip(walkGlb.animations[0] ?? fallback, scene),
      run: normalizeAnimationClip(runGlb.animations[0] ?? fallback, scene),
      idle: normalizeAnimationClip(idleGlb.animations[0] ?? fallback, scene),
      alert: normalizeAnimationClip(alertGlb.animations[0] ?? fallback, scene),
      point: normalizeAnimationClip(pointGlb.animations[0] ?? fallback, scene),
      inspect: normalizeAnimationClip(inspectGlb.animations[0] ?? fallback, scene),
      celebrate: normalizeAnimationClip(celebrateGlb.animations[0] ?? fallback, scene),
      jump: normalizeAnimationClip(jumpGlb.animations[0] ?? fallback, scene),
      sit: normalizeAnimationClip(sitGlb.animations[0] ?? fallback, scene),
      climb: normalizeAnimationClip(climbGlb.animations[0] ?? fallback, scene),
    } satisfies Record<ClipName, THREE.AnimationClip>;
  }, [alertGlb.animations, base.animations, celebrateGlb.animations, climbGlb.animations, idleGlb.animations, inspectGlb.animations, jumpGlb.animations, pointGlb.animations, runGlb.animations, scene, sitGlb.animations, walkGlb.animations]);
  const currentAction = useRef<THREE.AnimationAction | null>(null);
  const group = useRef<THREE.Group>(null);
  const character = useRef<THREE.Group>(null);
  const headBone = useRef<THREE.Bone | null>(null);
  const spineBone = useRef<THREE.Bone | null>(null);
  const capeBone = useRef<THREE.Bone | null>(null);
  const lastRouteVersion = useRef(-1);
  const routeStage = useRef<"edge" | "top">("edge");
  const viewport = useThree((state) => state.viewport);

  useEffect(() => {
    headBone.current = scene.getObjectByName("Head") as THREE.Bone | null;
    spineBone.current = scene.getObjectByName("Spine02") as THREE.Bone | null;
    capeBone.current = scene.getObjectByName("Spine02") as THREE.Bone | null;
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
  }, [scene]);

  useEffect(() => {
    const activeClip: ClipName = attentionTarget
      ? "celebrate"
      : motion === "initial-climb" || motion.startsWith("catchup-")
        ? "climb"
        : motion === "walk"
          ? "walk"
          : motion === "peek"
            ? "inspect"
            : "idle";
    const nextAction = mixer.clipAction(normalizedClips[activeClip]);
    if (nextAction === currentAction.current) return;
    currentAction.current?.fadeOut(0.2);
    nextAction.reset().setLoop(THREE.LoopRepeat, Infinity).fadeIn(0.25).play();
    currentAction.current = nextAction;
  }, [attentionTarget, mixer, motion, normalizedClips]);

  useEffect(() => {
    return () => {
      mixer.stopAllAction();
    };
  }, [mixer]);

  useFrame(({ clock }, delta) => {
    mixer.update(delta);
    if (!group.current || !anchorRef.current) return;

    const rect = anchorRef.current.getBoundingClientRect();
    const factor = viewport.factor;
    const surfaceX = rect.left + rect.width * surfaceFractionRef.current;
    const surfaceY = rect.top - 3;
    const edgeX = rect.left + Math.min(Math.max(rect.width * 0.16, 7), 18);
    const peekX = rect.left + Math.min(Math.max(rect.width * 0.12, 5), 15);
    const peekY = rect.top + Math.min(rect.height * 0.34, 58);
    const toWorldX = (clientX: number) => (clientX - window.innerWidth / 2) / factor;
    const toWorldY = (clientY: number) => (window.innerHeight / 2 - clientY) / factor;
    const targetX = toWorldX(surfaceX);
    const targetY = toWorldY(surfaceY);
    const targetEdgeX = toWorldX(edgeX);

    if (lastRouteVersion.current !== routeVersion) {
      lastRouteVersion.current = routeVersion;
      routeStage.current = "edge";
      if (motion === "initial-climb") {
        group.current.position.set(targetEdgeX, toWorldY(rect.bottom + 20), 0);
      } else if (motion === "catchup-from-top") {
        group.current.position.set(targetEdgeX, toWorldY(-150), 0);
      } else if (motion === "catchup-from-bottom") {
        group.current.position.set(targetEdgeX, toWorldY(window.innerHeight + 150), 0);
      }
    }

    const climbing = motion === "initial-climb" || motion.startsWith("catchup-");
    if (climbing) {
      if (routeStage.current === "edge") {
        group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetEdgeX, 8, delta);
        group.current.position.y = THREE.MathUtils.damp(group.current.position.y, targetY, 2.4, delta);
        if (Math.abs(group.current.position.y - targetY) < 0.06) routeStage.current = "top";
      } else {
        group.current.position.y = targetY;
        group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, 4.6, delta);
      }
    } else if (motion === "peek") {
      group.current.position.y = toWorldY(peekY);
      group.current.position.x = THREE.MathUtils.damp(group.current.position.x, toWorldX(peekX), 5.5, delta);
    } else {
      // Deliberately no viewport clamp: when the DOM surface scrolls away, Rudi leaves the screen with it.
      group.current.position.y = targetY;
      group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetX, motion === "walk" ? 2.6 : 7.5, delta);
    }

    const excitement = attentionRef.current.level;
    const facingRight = targetX >= group.current.position.x;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, facingRight ? 0.2 : -0.2, 7, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, attentionRef.current.x * -0.03 * excitement, 6, delta);

    if (character.current) {
      const pulse = 0.46 * (1 + Math.sin(clock.elapsedTime * 7.5) * 0.012);
      character.current.scale.setScalar(pulse);
    }
    if (headBone.current) {
      if (excitement > 0.01) {
        headBone.current.rotation.y += attentionRef.current.x * 0.25 * excitement;
        headBone.current.rotation.x += -attentionRef.current.y * 0.11 * excitement;
      } else {
        headBone.current.rotation.y += Math.sin(clock.elapsedTime * 0.5) * 0.045;
        headBone.current.rotation.x += Math.sin(clock.elapsedTime * 0.32 + 0.8) * 0.018;
      }
    }
    if (spineBone.current) {
      spineBone.current.rotation.y += excitement > 0.01
        ? attentionRef.current.x * 0.075 * excitement
        : Math.sin(clock.elapsedTime * 0.38) * 0.014;
    }
  });

  const bubbleMessage = attentionTarget === "login"
    ? "Dort kannst du dich anmelden. Ich bleibe hier auf meinem Platz."
    : attentionTarget === "register"
      ? "Dort beginnt dein WellFit-Abenteuer!"
      : motion === "initial-climb"
        ? "Das F ist mein erstes Podest. Da klettere ich rauf."
        : motion === "catchup-from-top"
          ? "Ich komme von oben wieder zu dir runter."
          : motion === "catchup-from-bottom"
            ? "Warte kurz – ich klettere wieder zu dir hoch."
            : motion === "peek"
              ? "Ich bin noch da. Das hier ist schließlich mein Zuhause."
              : null;

  return (
    <group ref={group}>
      {bubbleMessage ? (
        <Html center position={[0, 1.65, 0]} style={{ pointerEvents: "none" }}>
          <div className="relative w-52 rounded-2xl border border-cyan-100/45 bg-[#031820]/96 px-3 py-2.5 text-center text-[11px] font-bold leading-4 text-white shadow-[0_14px_36px_rgba(0,0,0,.36)] backdrop-blur-xl">
            {bubbleMessage}
            <span className="absolute bottom-[-9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b border-r border-cyan-100/45 bg-[#031820]" />
          </div>
        </Html>
      ) : null}
      <group ref={character} scale={0.46}>
        <GroundShadow climbing={motion === "initial-climb" || motion.startsWith("catchup-")} />
        <Cape moving={motion === "walk" || motion === "initial-climb" || motion.startsWith("catchup-")} anchor={capeBone} character={character} />
        <primitive object={scene} />
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

function isUsableSurface(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return element.offsetParent !== null
    && style.visibility !== "hidden"
    && style.display !== "none"
    && rect.width >= 34
    && rect.height >= 18;
}

function visibleSurfaces(page: HTMLElement) {
  const unique = new Set<HTMLElement>();
  page.querySelectorAll<HTMLElement>(SURFACE_SELECTOR).forEach((element) => {
    if (isUsableSurface(element)) unique.add(element);
  });
  return Array.from(unique).filter((element) => {
    const rect = element.getBoundingClientRect();
    return rect.bottom > 64 && rect.top < window.innerHeight - 42;
  });
}

function chooseCatchupSurface(page: HTMLElement, direction: 1 | -1, current: HTMLElement | null) {
  const surfaces = visibleSurfaces(page).filter((element) => element !== current);
  if (!surfaces.length) return null;
  const preferredY = direction > 0 ? Math.min(210, window.innerHeight * 0.3) : Math.max(window.innerHeight - 210, window.innerHeight * 0.7);
  return surfaces.sort((a, b) => {
    const ar = a.getBoundingClientRect();
    const br = b.getBoundingClientRect();
    const aExplicit = a.dataset.rudiSurface ? -45 : 0;
    const bExplicit = b.dataset.rudiSurface ? -45 : 0;
    const aY = direction > 0 ? ar.top : ar.bottom;
    const bY = direction > 0 ? br.top : br.bottom;
    return Math.abs(aY - preferredY) + aExplicit - (Math.abs(bY - preferredY) + bExplicit);
  })[0] ?? null;
}

function RudiRouteGuide({ anchorRef, motion }: { anchorRef: MutableRefObject<HTMLElement | null>; motion: Motion }) {
  const guideRef = useRef<HTMLDivElement>(null);
  const capRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const guide = guideRef.current;
      const cap = capRef.current;
      const anchor = anchorRef.current;
      const active = motion === "catchup-from-top" || motion === "catchup-from-bottom";
      if (!guide || !cap || !anchor || !active) {
        if (guide) guide.style.opacity = "0";
        if (cap) cap.style.opacity = "0";
        frame = window.requestAnimationFrame(update);
        return;
      }

      const rect = anchor.getBoundingClientRect();
      const edgeX = rect.left + Math.min(Math.max(rect.width * 0.16, 7), 18);
      const targetY = rect.top - 3;
      const fromTop = motion === "catchup-from-top";
      const top = fromTop ? 0 : Math.max(0, Math.min(targetY, window.innerHeight));
      const height = fromTop
        ? Math.max(0, Math.min(targetY, window.innerHeight))
        : Math.max(0, window.innerHeight - top);

      guide.style.left = `${edgeX}px`;
      guide.style.top = `${top}px`;
      guide.style.height = `${height}px`;
      guide.style.opacity = height > 3 ? "0.72" : "0";
      cap.style.left = `${edgeX - 7}px`;
      cap.style.top = `${Math.max(0, Math.min(targetY - 1, window.innerHeight - 2))}px`;
      cap.style.opacity = "0.82";
      frame = window.requestAnimationFrame(update);
    };

    frame = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frame);
  }, [anchorRef, motion]);

  return (
    <>
      <div
        ref={guideRef}
        data-rudi-route-guide="catchup"
        className="fixed w-[2px] -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,rgba(138,255,235,.12),rgba(138,255,235,.88),rgba(255,214,91,.62))] opacity-0 shadow-[0_0_9px_rgba(94,235,222,.48)] transition-opacity duration-200"
      />
      <div
        ref={capRef}
        aria-hidden="true"
        className="fixed h-[2px] w-[14px] rounded-full bg-cyan-100/75 opacity-0 shadow-[0_0_7px_rgba(94,235,222,.45)] transition-opacity duration-200"
      />
    </>
  );
}

function FallbackRudi({ anchorRef }: { anchorRef: MutableRefObject<HTMLElement | null> }) {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let frame = 0;
    const follow = () => {
      const element = anchorRef.current;
      const image = imageRef.current;
      if (element && image) {
        const rect = element.getBoundingClientRect();
        image.style.left = `${rect.left + rect.width * 0.5}px`;
        image.style.top = `${rect.top - 3}px`;
      }
      frame = window.requestAnimationFrame(follow);
    };
    frame = window.requestAnimationFrame(follow);
    return () => window.cancelAnimationFrame(frame);
  }, [anchorRef]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imageRef}
      src={`${ASSET_ROOT}/rudi-front.png`}
      alt=""
      className="fixed w-[126px] -translate-x-1/2 -translate-y-full object-contain drop-shadow-[0_18px_34px_rgba(0,0,0,.45)]"
    />
  );
}

export default function LivingRudiWorld() {
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [motion, setMotion] = useState<Motion>("initial-climb");
  const [routeVersion, setRouteVersion] = useState(0);
  const [layer, setLayer] = useState<WorldLayer>("front");
  const [attentionTarget, setAttentionTarget] = useState<AttentionTarget>(null);
  const anchorRef = useRef<HTMLElement | null>(null);
  const surfaceFractionRef = useRef(0.52);
  const attentionRef = useRef<PointerAttention>({ x: 0, y: 0, level: 0 });
  const motionRef = useRef<Motion>("initial-climb");

  const applyMotion = (next: Motion) => {
    motionRef.current = next;
    setMotion(next);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setWebgl(supportsWebGL()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let finishTimer = 0;
    const initTimer = window.setTimeout(() => {
      const page = document.querySelector<HTMLElement>(".landing-page");
      if (!page) return;
      const preferred = page.querySelector<HTMLElement>(`[data-rudi-anchor="${INITIAL_ANCHOR}"]`)
        ?? visibleSurfaces(page)[0]
        ?? null;
      anchorRef.current = preferred;
      setLayer(preferred?.dataset.rudiLayer === "back" ? "back" : "front");
      setRouteVersion((value) => value + 1);
      finishTimer = window.setTimeout(() => applyMotion("perched"), 2600);
    }, 0);
    return () => {
      window.clearTimeout(initTimer);
      window.clearTimeout(finishTimer);
    };
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
    const clear = () => {
      attentionRef.current = { x: 0, y: 0, level: 0 };
      setAttentionTarget(null);
    };
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", clear);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", clear);
    };
  }, []);

  useEffect(() => {
    const page = document.querySelector<HTMLElement>(".landing-page");
    if (!page) return;
    let lastScrollTop = page.scrollTop;
    let direction: 1 | -1 = 1;
    let settleTimer = 0;
    let finishTimer = 0;

    const catchUpIfNeeded = () => {
      const current = anchorRef.current;
      if (!current) return;
      const rect = current.getBoundingClientRect();
      const offscreen = rect.bottom < -32 || rect.top > window.innerHeight + 32;
      if (!offscreen) return;
      const next = chooseCatchupSurface(page, direction, current);
      if (!next) return;
      anchorRef.current = next;
      surfaceFractionRef.current = direction > 0 ? 0.28 : 0.72;
      setLayer(next.dataset.rudiLayer === "back" ? "back" : "front");
      applyMotion(direction > 0 ? "catchup-from-top" : "catchup-from-bottom");
      setRouteVersion((value) => value + 1);
      window.clearTimeout(finishTimer);
      finishTimer = window.setTimeout(() => applyMotion("perched"), 2500);
    };

    const handleScroll = () => {
      const nextScrollTop = page.scrollTop;
      const delta = nextScrollTop - lastScrollTop;
      lastScrollTop = nextScrollTop;
      if (Math.abs(delta) > 0.5) direction = delta > 0 ? 1 : -1;
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(catchUpIfNeeded, 520);
    };

    page.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      page.removeEventListener("scroll", handleScroll);
      window.clearTimeout(settleTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  useEffect(() => {
    let finishTimer = 0;
    const interval = window.setInterval(() => {
      if (motionRef.current !== "perched" || !anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;

      if (Math.random() < 0.28) {
        setLayer("back");
        applyMotion("peek");
        finishTimer = window.setTimeout(() => {
          setLayer(anchorRef.current?.dataset.rudiLayer === "back" ? "back" : "front");
          applyMotion("perched");
        }, 1900);
        return;
      }

      surfaceFractionRef.current = surfaceFractionRef.current < 0.5 ? 0.72 : 0.28;
      applyMotion("walk");
      finishTimer = window.setTimeout(() => applyMotion("perched"), 1800);
    }, 5200);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(finishTimer);
    };
  }, []);

  if (webgl === null || typeof document === "undefined") return null;

  return createPortal(
    <aside
      aria-label="Rudi Rastlos, erster WellFit-Buddy und Bewohner der Webseite"
      data-rudi-world="dom-surface-bound"
      className={`pointer-events-none fixed inset-0 hidden h-[100dvh] w-screen overflow-visible lg:block ${layer === "front" ? "z-[45]" : "z-[18]"}`}
    >
      <RudiRouteGuide anchorRef={anchorRef} motion={motion} />
      {webgl ? (
        <Canvas orthographic camera={{ position: [0, 0, 10], zoom: 100 }} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }} dpr={[0.75, 1]}>
          <ambientLight intensity={1.25} />
          <directionalLight position={[2.5, 4, 3]} intensity={2.2} color="#fff7df" />
          <directionalLight position={[-3, 2, 1]} intensity={1.1} color="#7ff5ed" />
          <Suspense fallback={null}>
            <WorldRudiModel
              anchorRef={anchorRef}
              surfaceFractionRef={surfaceFractionRef}
              motion={motion}
              routeVersion={routeVersion}
              attentionRef={attentionRef}
              attentionTarget={attentionTarget}
            />
          </Suspense>
        </Canvas>
      ) : <FallbackRudi anchorRef={anchorRef} />}
    </aside>,
    document.body,
  );
}

useGLTF.preload(`${ASSET_ROOT}/rudi-rigged.glb`);
Object.values(clips).forEach((asset) => useGLTF.preload(asset));
