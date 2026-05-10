"use client";

import { useEffect } from "react";

const STORAGE_KEY = "wellfit-sidebar-collapsed";

const applyCollapsedState = (collapsed: boolean) => {
  document.documentElement.dataset.wellfitSidebarCollapsed = String(collapsed);
};

export default function SidebarLegacyBridge() {
  useEffect(() => {
    applyCollapsedState(localStorage.getItem(STORAGE_KEY) === "true");

    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        applyCollapsedState(event.newValue === "true");
      }
    };

    const onClick = () => {
      window.setTimeout(() => {
        applyCollapsedState(localStorage.getItem(STORAGE_KEY) === "true");
      }, 0);
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("click", onClick);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
