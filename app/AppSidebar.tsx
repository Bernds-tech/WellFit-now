"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import AppInstallPrompt from "@/app/components/AppInstallPrompt";
import { updateCurrentDeviceLocation } from "@/app/lib/deviceLocation";

type AppSidebarProps = {
  brightness: number;
  onBrightnessChange: (value: number) => void;
  onLogout?: () => void;
};

const mainNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: "grid", active: (path: string) => path === "/dashboard" },
  { href: "/missionen/tagesmissionen", label: "Missionen", icon: "target", active: (path: string) => path.startsWith("/missionen"), location: true },
  { href: "/buddy", label: "Mein KI-Buddy", icon: "bot", active: (path: string) => path.startsWith("/buddy") },
  { href: "/marktplatz", label: "Marktplatz", icon: "shop", active: (path: string) => path.startsWith("/marktplatz") },
  { href: "/leaderboard", label: "Leaderboard", icon: "cup", active: (path: string) => path.startsWith("/leaderboard") },
  { href: "/punkte-shop", label: "Punkte-Shop", icon: "coin", active: (path: string) => path.startsWith("/punkte-shop") },
  { href: "/analytics", label: "Analytics & Stats", icon: "chart", active: (path: string) => path.startsWith("/analytics") },
];

const utilityNavItems = [
  { href: "/einstellungen", label: "Einstellungen", icon: "gear" },
  { href: "/datenschutz", label: "Datenschutz", icon: "lock" },
  { href: "/agb", label: "AGB", icon: "doc" },
  { href: "/impressum", label: "Impressum", icon: "info" },
  { href: "/faq", label: "FAQ", icon: "help" },
  { href: "/hilfe", label: "Hilfe", icon: "life" },
];

const createSidebarBackground = (brightness: number) => {
  const ratio = Math.max(0.05, Math.min(1, brightness / 100));
  const green = Math.round(35 + ratio * 75);
  const blue = Math.round(40 + ratio * 85);
  return `rgba(2, ${green}, ${blue}, 0.96)`;
};

function SidebarIcon({ name }: { name: string }) {
  const common = "h-5 w-5";
  if (name === "grid") {
    return <span className={`${common} grid grid-cols-2 gap-[3px]`}><i className="rounded-[2px] border border-current" /><i className="rounded-[2px] border border-current" /><i className="rounded-[2px] border border-current" /><i className="rounded-[2px] border border-current" /></span>;
  }
  if (name === "target") {
    return <span className={`${common} rounded-full border-2 border-current before:block before:h-2 before:w-2 before:translate-x-[5px] before:translate-y-[5px] before:rounded-full before:bg-current`} />;
  }
  if (name === "bot") {
    return <span className={`${common} rounded-md border-2 border-current before:block before:h-[3px] before:w-3 before:translate-x-[3px] before:translate-y-[7px] before:rounded-full before:bg-current`} />;
  }
  if (name === "shop") {
    return <span className={`${common} border-b-2 border-current before:block before:h-2 before:w-5 before:rounded-t-md before:border-2 before:border-b-0 before:border-current`} />;
  }
  if (name === "cup") {
    return <span className={`${common} rounded-b-lg border-2 border-t-0 border-current before:block before:h-2 before:w-3 before:translate-x-[3px] before:translate-y-[-3px] before:rounded-b-full before:bg-current`} />;
  }
  if (name === "coin") {
    return <span className={`${common} rounded-full border-2 border-current before:block before:h-[2px] before:w-3 before:translate-x-[3px] before:translate-y-[8px] before:bg-current`} />;
  }
  if (name === "chart") {
    return <span className={`${common} flex items-end justify-center gap-[3px]`}><i className="h-2 w-[3px] bg-current" /><i className="h-4 w-[3px] bg-current" /><i className="h-3 w-[3px] bg-current" /></span>;
  }
  if (name === "gear") return <span className="text-lg leading-none">*</span>;
  if (name === "lock") return <span className="text-lg leading-none">#</span>;
  if (name === "doc") return <span className="text-lg leading-none">[]</span>;
  if (name === "info") return <span className="text-lg leading-none">i</span>;
  if (name === "help") return <span className="text-lg leading-none">?</span>;
  if (name === "life") return <span className="text-lg leading-none">+</span>;
  return <span className="text-lg leading-none">.</span>;
}

export default function AppSidebar({ brightness, onBrightnessChange, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(localStorage.getItem("wellfit-sidebar-collapsed") === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem("wellfit-sidebar-collapsed", String(next));
      return next;
    });
  };

  const expandedClass = (active: boolean) => active ? "block font-bold text-orange-400" : "block text-white/80 hover:text-cyan-100";
  const collapsedClass = (active: boolean) => active
    ? "flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-orange-400"
    : "flex h-10 w-10 items-center justify-center rounded-xl text-white/80 hover:bg-white/5 hover:text-cyan-100";

  return (
    <aside
      data-wellfit-sidebar="central"
      className={`relative flex h-full shrink-0 flex-col border-r border-cyan-400/10 transition-[width] duration-200 ease-out ${collapsed ? "w-[74px]" : "w-[250px]"}`}
      style={{ backgroundColor: createSidebarBackground(brightness) }}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
        title={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
        className="absolute right-[-13px] top-7 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/30 bg-[#063b43] text-xs font-black text-cyan-100 shadow-[0_6px_18px_rgba(0,0,0,0.25)] hover:bg-[#0a4c55]"
      >
        {collapsed ? "+" : "-"}
      </button>

      <div className={`flex h-full min-h-0 flex-col ${collapsed ? "items-center px-2 py-6" : "px-5 py-6"}`}>
        <div className="mb-8 flex shrink-0 justify-center">
          <Image
            src="/logo.png"
            alt="WellFit Logo"
            width={collapsed ? 52 : 150}
            height={collapsed ? 52 : 150}
            priority
            className={collapsed ? "h-[52px] w-[52px] object-contain" : "h-auto w-[150px] object-contain"}
          />
        </div>

        <nav className={`shrink-0 text-[14px] ${collapsed ? "flex w-full flex-col items-center gap-2" : "w-full space-y-2"}`}>
          {mainNavItems.map((item) => {
            const active = item.active(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={item.location ? () => void updateCurrentDeviceLocation() : undefined}
                className={collapsed ? collapsedClass(active) : expandedClass(active)}
                title={collapsed ? item.label : undefined}
              >
                {collapsed ? <SidebarIcon name={item.icon} /> : item.label}
              </Link>
            );
          })}
        </nav>

        {!collapsed && (
          <div className="mt-5 w-full shrink-0 border-t border-cyan-400/10 pt-4">
            <AppInstallPrompt />
            <label className="mb-1 block text-lg">Helligkeit</label>
            <input
              type="range"
              min="5"
              max="100"
              value={brightness}
              onChange={(event) => onBrightnessChange(Number(event.target.value))}
              className="w-full"
            />
            <div className="mt-1 text-right text-sm text-white/70">{brightness}%</div>
          </div>
        )}

        <nav className={`mt-auto shrink-0 ${collapsed ? "flex w-full flex-col items-center gap-1.5 border-t border-cyan-400/10 pt-4" : "w-full space-y-2 pt-4 text-[14px]"}`}>
          {utilityNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={collapsed ? collapsedClass(active) : expandedClass(active)}
                title={collapsed ? item.label : undefined}
              >
                {collapsed ? <SidebarIcon name={item.icon} /> : item.label}
              </Link>
            );
          })}

          <div className={collapsed ? "w-full border-t border-cyan-400/10 pt-3" : "mt-4 w-full border-t border-cyan-400/10 pt-3"}>
            <button
              type="button"
              onClick={onLogout}
              className={collapsed ? "mx-auto flex h-10 w-10 items-center justify-center rounded-xl text-red-400 hover:bg-red-400/10 hover:text-red-300" : "block w-full text-left text-[14px] font-bold text-red-400 hover:text-red-300"}
              title={collapsed ? "Abmelden" : undefined}
            >
              {collapsed ? "X" : "Abmelden"}
            </button>
          </div>
        </nav>
      </div>
    </aside>
  );
}
