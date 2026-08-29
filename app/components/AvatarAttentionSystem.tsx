"use client";

import { useEffect } from "react";

const AVATAR_MIN_SIZE = 44;
const POINTER_SELECTOR = "a,button,[role='button'],input,select,textarea,[tabindex]";

type PuppetConfig = {
  headBottom: number;
  bodyTop: number;
  headPivotX: number;
  headPivotY: number;
  maxHeadYaw: number;
  maxHeadPitch: number;
  maxHeadTilt: number;
  maxHeadX: number;
  maxHeadY: number;
  maxBodyYaw: number;
  maxBodyTilt: number;
  maxBodyX: number;
};

type PuppetMotion = {
  headX: number;
  headY: number;
  headYaw: number;
  headPitch: number;
  headTilt: number;
  headScale: number;
  bodyX: number;
  bodyYaw: number;
  bodyTilt: number;
  bodyScale: number;
};

type PuppetState = {
  element: HTMLImageElement;
  root: HTMLSpanElement;
  head: HTMLImageElement;
  body: HTMLImageElement;
  host: HTMLElement;
  config: PuppetConfig;
  motion: PuppetMotion;
  original: {
    opacity: string;
    willChange: string;
  };
};

const DEFAULT_CONFIG: PuppetConfig = {
  headBottom: 0.5,
  bodyTop: 0.44,
  headPivotX: 0.5,
  headPivotY: 0.46,
  maxHeadYaw: 14,
  maxHeadPitch: 7,
  maxHeadTilt: 4.5,
  maxHeadX: 11,
  maxHeadY: 7,
  maxBodyYaw: 4,
  maxBodyTilt: 2.6,
  maxBodyX: 3.5,
};

const CONFIGS: Array<{ matches: string[]; config: Partial<PuppetConfig> }> = [
  {
    matches: ["luma"],
    config: {
      headBottom: 0.5,
      bodyTop: 0.43,
      headPivotY: 0.46,
      maxHeadYaw: 16,
      maxHeadTilt: 5,
      maxHeadX: 13,
      maxHeadY: 8,
    },
  },
  {
    matches: ["mascottchen", "rudi"],
    config: {
      headBottom: 0.51,
      bodyTop: 0.44,
      headPivotY: 0.47,
      maxHeadYaw: 16,
      maxHeadTilt: 5,
      maxHeadX: 13,
      maxHeadY: 8,
    },
  },
  {
    matches: ["flammi"],
    config: { headBottom: 0.47, bodyTop: 0.41, headPivotY: 0.43, maxHeadYaw: 15 },
  },
  {
    matches: ["turt"],
    config: { headBottom: 0.45, bodyTop: 0.39, headPivotY: 0.41, maxHeadYaw: 13, maxHeadX: 9 },
  },
  {
    matches: ["king", "königin", "prinzessin", "zauberer", "gohst"],
    config: {
      headBottom: 0.38,
      bodyTop: 0.33,
      headPivotY: 0.35,
      maxHeadYaw: 12,
      maxHeadPitch: 5.5,
      maxHeadTilt: 3.5,
      maxHeadX: 8,
      maxHeadY: 5,
      maxBodyYaw: 3,
    },
  },
  {
    matches: ["drachen-königin", "drachen-prinzessin", "königlicher-drache", "drache"],
    config: {
      headBottom: 0.46,
      bodyTop: 0.4,
      headPivotY: 0.42,
      maxHeadYaw: 15,
      maxHeadTilt: 4.5,
      maxHeadX: 11,
    },
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function sourceKey(image: HTMLImageElement) {
  return `${image.getAttribute("src") ?? ""} ${image.currentSrc} ${image.getAttribute("alt") ?? ""}`.toLowerCase();
}

function getPuppetConfig(image: HTMLImageElement): PuppetConfig {
  const key = sourceKey(image);
  const match = CONFIGS.find((entry) => entry.matches.some((token) => key.includes(token)));
  const fromData = (name: string, fallback: number) => {
    const raw = image.dataset[name];
    if (!raw) return fallback;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const base = { ...DEFAULT_CONFIG, ...(match?.config ?? {}) };
  return {
    ...base,
    headBottom: fromData("avatarHeadBottom", base.headBottom),
    bodyTop: fromData("avatarBodyTop", base.bodyTop),
    headPivotX: fromData("avatarHeadPivotX", base.headPivotX),
    headPivotY: fromData("avatarHeadPivotY", base.headPivotY),
  };
}

function isWellFitAvatar(image: HTMLImageElement) {
  if (image.dataset.avatarPuppet === "off" || image.closest("[data-avatar-puppet-root='true']")) return false;
  if (image.dataset.avatarPuppet === "on") return true;

  const key = sourceKey(image);
  return (
    key.includes("/buddy/") ||
    key.includes("%2fbuddy%2f") ||
    key.includes("mascottchen") ||
    key.includes("rudi") ||
    key.includes("wellfit buddy") ||
    key.includes("avatar")
  );
}

function interactiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(POINTER_SELECTOR);
}

function createLayer(image: HTMLImageElement, kind: "head" | "body", config: PuppetConfig) {
  const layer = image.cloneNode(true) as HTMLImageElement;
  const computed = getComputedStyle(image);

  layer.removeAttribute("id");
  layer.alt = "";
  layer.setAttribute("aria-hidden", "true");
  layer.dataset.avatarPuppet = "off";
  layer.dataset.avatarPuppetLayer = kind;
  layer.style.position = "absolute";
  layer.style.inset = "0";
  layer.style.width = "100%";
  layer.style.height = "100%";
  layer.style.maxWidth = "none";
  layer.style.minWidth = "0";
  layer.style.objectFit = computed.objectFit;
  layer.style.objectPosition = computed.objectPosition;
  layer.style.pointerEvents = "none";
  layer.style.userSelect = "none";
  layer.style.opacity = "1";
  layer.style.filter = "none";
  layer.style.margin = "0";
  layer.style.willChange = "transform";
  layer.style.backfaceVisibility = "hidden";

  if (kind === "head") {
    layer.style.clipPath = `inset(0 0 ${((1 - config.headBottom) * 100).toFixed(2)}% 0)`;
    layer.style.transformOrigin = `${(config.headPivotX * 100).toFixed(1)}% ${(config.headPivotY * 100).toFixed(1)}%`;
    layer.style.zIndex = "2";
  } else {
    layer.style.clipPath = `inset(${(config.bodyTop * 100).toFixed(2)}% 0 0 0)`;
    layer.style.transformOrigin = "50% 78%";
    layer.style.zIndex = "1";
  }

  return layer;
}

function zeroMotion(): PuppetMotion {
  return {
    headX: 0,
    headY: 0,
    headYaw: 0,
    headPitch: 0,
    headTilt: 0,
    headScale: 1,
    bodyX: 0,
    bodyYaw: 0,
    bodyTilt: 0,
    bodyScale: 1,
  };
}

export default function AvatarAttentionSystem() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    const states = new Set<PuppetState>();
    const known = new WeakMap<HTMLImageElement, PuppetState>();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => schedule()) : null;

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let pointerActive = false;
    let hoverTarget: HTMLElement | null = null;
    let focusTarget: HTMLElement | null = null;
    let pulseStartedAt = -1;
    let pulseUntil = -1;
    let frame: number | null = null;

    const syncGeometry = (state: PuppetState) => {
      const image = state.element;
      const nextHost = (image.offsetParent as HTMLElement | null) ?? image.parentElement;
      if (!nextHost) return;

      if (state.host !== nextHost) {
        state.host = nextHost;
        nextHost.appendChild(state.root);
      }

      state.root.style.left = `${image.offsetLeft}px`;
      state.root.style.top = `${image.offsetTop}px`;
      state.root.style.width = `${image.offsetWidth}px`;
      state.root.style.height = `${image.offsetHeight}px`;
    };

    const addAvatar = (image: HTMLImageElement) => {
      if (known.has(image) || !isWellFitAvatar(image)) return;

      const host = (image.offsetParent as HTMLElement | null) ?? image.parentElement;
      if (!host) return;

      const computed = getComputedStyle(image);
      const config = getPuppetConfig(image);
      const root = document.createElement("span");
      root.dataset.avatarPuppetRoot = "true";
      root.setAttribute("aria-hidden", "true");
      root.style.position = "absolute";
      root.style.pointerEvents = "none";
      root.style.overflow = "visible";
      root.style.transformStyle = "preserve-3d";
      root.style.perspective = "760px";
      root.style.opacity = computed.opacity;
      root.style.visibility = computed.visibility;
      root.style.filter = computed.filter;
      root.style.zIndex = computed.zIndex === "auto" ? "0" : computed.zIndex;
      root.style.contain = "layout style";

      const body = createLayer(image, "body", config);
      const head = createLayer(image, "head", config);
      root.append(body, head);
      host.appendChild(root);

      const state: PuppetState = {
        element: image,
        root,
        head,
        body,
        host,
        config,
        motion: zeroMotion(),
        original: {
          opacity: image.style.opacity,
          willChange: image.style.willChange,
        },
      };

      image.dataset.avatarPuppetActive = "true";
      image.style.opacity = "0";
      image.style.willChange = "auto";
      known.set(image, state);
      states.add(state);
      resizeObserver?.observe(image);
      syncGeometry(state);
      schedule();
    };

    const scan = (root: ParentNode = document) => {
      root.querySelectorAll<HTMLImageElement>("img").forEach(addAvatar);
    };

    const resetAvatar = (state: PuppetState) => {
      resizeObserver?.unobserve(state.element);
      state.root.remove();
      state.element.style.opacity = state.original.opacity;
      state.element.style.willChange = state.original.willChange;
      delete state.element.dataset.avatarPuppetActive;
    };

    const targetPoint = () => {
      const priority = hoverTarget ?? focusTarget;
      if (priority?.isConnected) {
        const rect = priority.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          priority: true,
        };
      }

      return {
        x: pointerX,
        y: pointerY,
        priority: false,
      };
    };

    const schedule = () => {
      if (frame === null && !document.hidden) frame = requestAnimationFrame(update);
    };

    const update = (now: number) => {
      frame = null;
      const point = targetPoint();
      const pulsing = now < pulseUntil;
      const pulseDuration = 320;
      const pulseProgress = pulsing ? clamp((now - pulseStartedAt) / pulseDuration, 0, 1) : 1;
      const pulse = pulsing ? Math.sin(pulseProgress * Math.PI) : 0;
      let hasVisiblePuppet = false;

      for (const state of Array.from(states)) {
        const image = state.element;
        if (!image.isConnected) {
          resetAvatar(state);
          states.delete(state);
          continue;
        }

        syncGeometry(state);
        const rect = image.getBoundingClientRect();
        const visible =
          rect.width >= AVATAR_MIN_SIZE &&
          rect.height >= AVATAR_MIN_SIZE &&
          rect.bottom > 0 &&
          rect.right > 0 &&
          rect.top < window.innerHeight &&
          rect.left < window.innerWidth;

        state.root.style.display = visible ? "block" : "none";
        if (!visible) continue;
        hasVisiblePuppet = true;

        const hasAttention = pointerActive || point.priority;
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height * state.config.headPivotY;
        const attentionStrength = point.priority ? 1 : 0.9;

        const nx = hasAttention
          ? clamp((point.x - centerX) / Math.max(180, window.innerWidth * 0.34), -1, 1) * attentionStrength
          : 0;
        const ny = hasAttention
          ? clamp((point.y - centerY) / Math.max(150, window.innerHeight * 0.4), -1, 1) * attentionStrength
          : 0;

        const idleBreath = Math.sin(now / 1050 + rect.left * 0.002) * 0.0045;
        const idleHead = Math.sin(now / 1450 + rect.top * 0.002) * 0.8;
        const priorityBoost = point.priority ? 1.08 : 1;
        const cfg = state.config;

        const desired: PuppetMotion = {
          headX: nx * cfg.maxHeadX * priorityBoost,
          headY: ny * cfg.maxHeadY + idleHead + pulse * 2.8,
          headYaw: nx * cfg.maxHeadYaw * priorityBoost,
          headPitch: -ny * cfg.maxHeadPitch + pulse * 5.5,
          headTilt: nx * cfg.maxHeadTilt,
          headScale: 1 + (point.priority ? 0.008 : 0) + pulse * 0.012,
          bodyX: nx * cfg.maxBodyX,
          bodyYaw: nx * cfg.maxBodyYaw,
          bodyTilt: nx * cfg.maxBodyTilt,
          bodyScale: 1 + idleBreath + pulse * 0.004,
        };

        const m = state.motion;
        const headEase = point.priority ? 0.2 : 0.16;
        const bodyEase = 0.09;
        m.headX += (desired.headX - m.headX) * headEase;
        m.headY += (desired.headY - m.headY) * headEase;
        m.headYaw += (desired.headYaw - m.headYaw) * headEase;
        m.headPitch += (desired.headPitch - m.headPitch) * headEase;
        m.headTilt += (desired.headTilt - m.headTilt) * headEase;
        m.headScale += (desired.headScale - m.headScale) * 0.18;
        m.bodyX += (desired.bodyX - m.bodyX) * bodyEase;
        m.bodyYaw += (desired.bodyYaw - m.bodyYaw) * bodyEase;
        m.bodyTilt += (desired.bodyTilt - m.bodyTilt) * bodyEase;
        m.bodyScale += (desired.bodyScale - m.bodyScale) * 0.08;

        state.head.style.transform = [
          "perspective(760px)",
          `translate3d(${m.headX.toFixed(2)}px, ${m.headY.toFixed(2)}px, 10px)`,
          `rotateY(${m.headYaw.toFixed(2)}deg)`,
          `rotateX(${m.headPitch.toFixed(2)}deg)`,
          `rotateZ(${m.headTilt.toFixed(2)}deg)`,
          `scale(${m.headScale.toFixed(4)})`,
        ].join(" ");

        state.body.style.transform = [
          "perspective(760px)",
          `translate3d(${m.bodyX.toFixed(2)}px, 0, 0)`,
          `rotateY(${m.bodyYaw.toFixed(2)}deg)`,
          `rotateZ(${m.bodyTilt.toFixed(2)}deg)`,
          `scale(${m.bodyScale.toFixed(4)})`,
        ].join(" ");
      }

      if (hasVisiblePuppet) schedule();
    };

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType && event.pointerType !== "mouse" && event.pointerType !== "pen") return;
      pointerX = event.clientX;
      pointerY = event.clientY;
      pointerActive = true;
      hoverTarget = interactiveTarget(event.target);
      schedule();
    };

    const onPointerLeave = () => {
      pointerActive = false;
      hoverTarget = null;
      schedule();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!interactiveTarget(event.target)) return;
      pulseStartedAt = performance.now();
      pulseUntil = pulseStartedAt + 320;
      schedule();
    };

    const onFocusIn = (event: FocusEvent) => {
      focusTarget = interactiveTarget(event.target);
      schedule();
    };

    const onFocusOut = () => {
      focusTarget = null;
      schedule();
    };

    const onVisibilityChange = () => {
      if (!document.hidden) schedule();
    };

    scan();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof Element)) continue;
          if (node instanceof HTMLImageElement) addAvatar(node);
          if (!node.matches("[data-avatar-puppet-root='true']")) scan(node);
        }
      }
      schedule();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      resizeObserver?.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (frame !== null) cancelAnimationFrame(frame);
      states.forEach(resetAvatar);
      states.clear();
    };
  }, []);

  return null;
}
