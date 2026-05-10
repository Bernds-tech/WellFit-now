"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SIDEBAR_STORAGE_KEY = "wellfit-sidebar-collapsed";
const BRIGHTNESS_STORAGE_KEY = "wellfit-brightness";

const clampBrightness = (value: number) => {
  if (!Number.isFinite(value)) return 100;
  return Math.max(5, Math.min(100, Math.round(value)));
};

const readBrightness = () => clampBrightness(Number(localStorage.getItem(BRIGHTNESS_STORAGE_KEY) ?? 100));
const readCollapsed = () => localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
const hasCentralSidebar = () => Boolean(document.querySelector("[data-wellfit-sidebar='central']"));
const hasLegacySidebar = () => Boolean(document.querySelector("main > div.flex > aside"));

const createChromeColor = (brightness: number) => {
  const ratio = Math.max(0.05, Math.min(1, brightness / 100));
  const green = Math.round(35 + ratio * 75);
  const blue = Math.round(40 + ratio * 85);
  return `rgba(2, ${green}, ${blue}, 0.96)`;
};

const createPageBackground = (brightness: number) => {
  const ratio = Math.max(0.05, Math.min(1, brightness / 100));
  return `linear-gradient(to bottom right, rgba(0,170,190,${ratio}), rgba(0,80,90,1))`;
};

const applyCollapsedState = (collapsed: boolean) => {
  document.documentElement.dataset.wellfitSidebarCollapsed = String(collapsed);
};

const setNativeRangeValue = (range: HTMLInputElement, value: string) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  setter?.call(range, value);
};

const dispatchRangeUpdate = (range: HTMLInputElement, value: number) => {
  const nextValue = String(value);
  if (range.value !== nextValue) {
    setNativeRangeValue(range, nextValue);
  }
  range.dispatchEvent(new Event("input", { bubbles: true }));
  range.dispatchEvent(new Event("change", { bubbles: true }));
};

const applyBrightness = (brightness: number, syncReactRanges = true) => {
  const safeBrightness = clampBrightness(brightness);
  const color = createChromeColor(safeBrightness);

  document.documentElement.style.setProperty("--wellfit-sidebar-bg", color);
  document.documentElement.style.setProperty("--wellfit-footer-bg", color);

  document.querySelectorAll("input[type='range']").forEach((input) => {
    const range = input as HTMLInputElement;
    if (range.min === "5" && range.max === "100") {
      if (syncReactRanges) {
        dispatchRangeUpdate(range, safeBrightness);
      } else {
        setNativeRangeValue(range, String(safeBrightness));
      }
    }
  });

  const main = document.querySelector("main.h-screen") as HTMLElement | null;
  if (main) {
    main.style.background = createPageBackground(safeBrightness);
  }
};

const syncRepeatedly = (sync: () => void) => {
  sync();
  window.setTimeout(sync, 0);
  window.setTimeout(sync, 50);
  window.setTimeout(sync, 150);
  window.setTimeout(sync, 350);
};

export default function SidebarLegacyBridge() {
  const pathname = usePathname();
  const [showLegacyToggle, setShowLegacyToggle] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const sync = () => {
      const nextCollapsed = readCollapsed();
      const nextBrightness = readBrightness();
      applyCollapsedState(nextCollapsed);
      applyBrightness(nextBrightness);
      setCollapsed(nextCollapsed);
      setShowLegacyToggle(!hasCentralSidebar() && hasLegacySidebar());
    };

    const persistRangeInput = (event: Event) => {
      const target = event.target as HTMLInputElement | null;
      if (target?.type === "range" && target.min === "5" && target.max === "100") {
        const next = clampBrightness(Number(target.value));
        localStorage.setItem(BRIGHTNESS_STORAGE_KEY, String(next));
        applyBrightness(next, false);
      }
    };

    syncRepeatedly(sync);

    const observer = new MutationObserver(() => window.setTimeout(sync, 0));
    observer.observe(document.body, { childList: true, subtree: true });

    const onStorage = (event: StorageEvent) => {
      if (event.key === SIDEBAR_STORAGE_KEY || event.key === BRIGHTNESS_STORAGE_KEY) syncRepeatedly(sync);
    };
    const onInteraction = () => window.setTimeout(sync, 0);

    window.addEventListener("storage", onStorage);
    window.addEventListener("click", onInteraction);
    window.addEventListener("input", persistRangeInput, true);
    window.addEventListener("resize", onInteraction);
    window.addEventListener("popstate", onInteraction);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("click", onInteraction);
      window.removeEventListener("input", persistRangeInput, true);
      window.removeEventListener("resize", onInteraction);
      window.removeEventListener("popstate", onInteraction);
    };
  }, [pathname]);

  if (!showLegacyToggle) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const next = !readCollapsed();
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
        applyCollapsedState(next);
        setCollapsed(next);
      }}
      className="fixed left-[237px] top-7 z-[80] flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/30 bg-[#063b43] text-xs font-black text-cyan-100 shadow-[0_6px_18px_rgba(0,0,0,0.25)] hover:bg-[#0a4c55]"
      title={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
      aria-label={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
    >
      {collapsed ? "+" : "-"}
    </button>
  );
}
