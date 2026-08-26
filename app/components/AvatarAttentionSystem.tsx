"use client";

import { useEffect } from "react";

const AVATAR_MIN_SIZE = 44;
const POINTER_SELECTOR = "a,button,[role='button'],input,select,textarea,[tabindex]";

type AvatarState = {
  element: HTMLImageElement;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  original: {
    translate: string;
    rotate: string;
    scale: string;
    transformOrigin: string;
    willChange: string;
  };
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isWellFitAvatar(image: HTMLImageElement) {
  if (image.dataset.avatarAttention === "off") return false;
  if (image.dataset.avatarAttention === "on") return true;

  const source = `${image.getAttribute("src") ?? ""} ${image.currentSrc}`.toLowerCase();
  const alt = (image.getAttribute("alt") ?? "").toLowerCase();

  return (
    source.includes("buddy") ||
    source.includes("rudi") ||
    source.includes("avatar") ||
    alt.includes("wellfit buddy") ||
    alt.includes("rudi") ||
    alt.includes("avatar")
  );
}

function interactiveTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return null;
  return target.closest<HTMLElement>(POINTER_SELECTOR);
}

export default function AvatarAttentionSystem() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const finePointer = window.matchMedia("(pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!finePointer.matches || reducedMotion.matches) return;

    const states = new Set<AvatarState>();
    const known = new WeakMap<HTMLImageElement, AvatarState>();

    let pointerX = window.innerWidth / 2;
    let pointerY = window.innerHeight / 2;
    let pointerActive = false;
    let hoverTarget: HTMLElement | null = null;
    let focusTarget: HTMLElement | null = null;
    let pulseUntil = 0;
    let frame: number | null = null;

    const addAvatar = (image: HTMLImageElement) => {
      if (known.has(image) || !isWellFitAvatar(image)) return;

      const state: AvatarState = {
        element: image,
        x: 0,
        y: 0,
        rotation: 0,
        scale: 1,
        original: {
          translate: image.style.translate,
          rotate: image.style.rotate,
          scale: image.style.scale,
          transformOrigin: image.style.transformOrigin,
          willChange: image.style.willChange,
        },
      };

      image.dataset.avatarAttentionActive = "true";
      image.style.transformOrigin = "50% 72%";
      image.style.willChange = "translate, rotate, scale";
      known.set(image, state);
      states.add(state);
    };

    const scan = (root: ParentNode = document) => {
      root.querySelectorAll<HTMLImageElement>("img").forEach(addAvatar);
    };

    const resetAvatar = (state: AvatarState) => {
      const { element, original } = state;
      element.style.translate = original.translate;
      element.style.rotate = original.rotate;
      element.style.scale = original.scale;
      element.style.transformOrigin = original.transformOrigin;
      element.style.willChange = original.willChange;
      delete element.dataset.avatarAttentionActive;
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
      if (frame === null) frame = requestAnimationFrame(update);
    };

    const update = (now: number) => {
      frame = null;
      const point = targetPoint();
      const pulsing = now < pulseUntil;
      let needsAnotherFrame = pulsing;

      for (const state of Array.from(states)) {
        const image = state.element;
        if (!image.isConnected) {
          states.delete(state);
          continue;
        }

        const rect = image.getBoundingClientRect();
        const visible =
          rect.width >= AVATAR_MIN_SIZE &&
          rect.height >= AVATAR_MIN_SIZE &&
          rect.bottom > 0 &&
          rect.right > 0 &&
          rect.top < window.innerHeight &&
          rect.left < window.innerWidth;

        const hasAttention = visible && (pointerActive || point.priority);
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height * 0.46;

        const normalizedX = hasAttention
          ? clamp((point.x - centerX) / Math.max(220, window.innerWidth * 0.42), -1, 1)
          : 0;
        const normalizedY = hasAttention
          ? clamp((point.y - centerY) / Math.max(180, window.innerHeight * 0.48), -1, 1)
          : 0;

        const desiredRotation = normalizedX * 7.5;
        const desiredX = normalizedX * 8;
        const desiredY = normalizedY * 5;
        const desiredScale = pulsing && visible ? 1.024 : point.priority && visible ? 1.012 : 1;

        const ease = 0.14;
        state.x += (desiredX - state.x) * ease;
        state.y += (desiredY - state.y) * ease;
        state.rotation += (desiredRotation - state.rotation) * ease;
        state.scale += (desiredScale - state.scale) * 0.16;

        image.style.translate = `${state.x.toFixed(2)}px ${state.y.toFixed(2)}px`;
        image.style.rotate = `${state.rotation.toFixed(2)}deg`;
        image.style.scale = state.scale.toFixed(4);

        if (
          Math.abs(desiredX - state.x) > 0.08 ||
          Math.abs(desiredY - state.y) > 0.08 ||
          Math.abs(desiredRotation - state.rotation) > 0.08 ||
          Math.abs(desiredScale - state.scale) > 0.001
        ) {
          needsAnotherFrame = true;
        }
      }

      if (needsAnotherFrame) schedule();
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
      pulseUntil = performance.now() + 300;
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

    scan();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof Element)) continue;
          if (node instanceof HTMLImageElement) addAvatar(node);
          scan(node);
        }
      }
      schedule();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      if (frame !== null) cancelAnimationFrame(frame);
      states.forEach(resetAvatar);
      states.clear();
    };
  }, []);

  return null;
}
