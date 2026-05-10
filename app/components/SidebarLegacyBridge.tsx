"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "wellfit-sidebar-collapsed";

const hasCentralSidebar = () => Boolean(document.querySelector("[data-wellfit-sidebar='central']"));
const hasLegacySidebar = () => Boolean(document.querySelector("main > div.flex > aside"));

const readCollapsed = () => localStorage.getItem(STORAGE_KEY) === "true";

const applyCollapsedState = (collapsed: boolean) => {
  document.documentElement.dataset.wellfitSidebarCollapsed = String(collapsed);
};

export default function SidebarLegacyBridge() {
  const [showLegacyToggle, setShowLegacyToggle] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const sync = () => {
      const nextCollapsed = readCollapsed();
      applyCollapsedState(nextCollapsed);
      setCollapsed(nextCollapsed);
      setShowLegacyToggle(!hasCentralSidebar() && hasLegacySidebar());
    };

    sync();

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) sync();
    };

    const onClick = () => window.setTimeout(sync, 0);
    const onResize = () => window.setTimeout(sync, 0);

    window.addEventListener("storage", onStorage);
    window.addEventListener("click", onClick);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("click", onClick);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  if (!showLegacyToggle) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const next = !readCollapsed();
        localStorage.setItem(STORAGE_KEY, String(next));
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
