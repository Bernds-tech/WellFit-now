"use client";

import { useEffect, useState } from "react";

export const WELLFIT_BRIGHTNESS_STORAGE_KEY = "wellfit-brightness";

const clampBrightness = (value: number) => {
  if (!Number.isFinite(value)) return 100;
  return Math.max(5, Math.min(100, Math.round(value)));
};

export const createWellFitChromeColor = (brightness: number) => {
  const ratio = Math.max(0.05, Math.min(1, brightness / 100));
  const green = Math.round(35 + ratio * 75);
  const blue = Math.round(40 + ratio * 85);
  return `rgba(2, ${green}, ${blue}, 0.96)`;
};

export const applyWellFitBrightnessVars = (brightness: number) => {
  if (typeof document === "undefined") return;
  const color = createWellFitChromeColor(brightness);
  document.documentElement.style.setProperty("--wellfit-sidebar-bg", color);
  document.documentElement.style.setProperty("--wellfit-footer-bg", color);
};

export function useWellFitBrightness(defaultValue = 100) {
  const [brightness, setBrightnessState] = useState(defaultValue);

  useEffect(() => {
    const saved = localStorage.getItem(WELLFIT_BRIGHTNESS_STORAGE_KEY);
    const next = clampBrightness(saved ? Number(saved) : defaultValue);
    setBrightnessState(next);
    applyWellFitBrightnessVars(next);
  }, [defaultValue]);

  const setBrightness = (value: number) => {
    const next = clampBrightness(value);
    setBrightnessState(next);
    localStorage.setItem(WELLFIT_BRIGHTNESS_STORAGE_KEY, String(next));
    applyWellFitBrightnessVars(next);
  };

  return [brightness, setBrightness] as const;
}
