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
  { href: "/dashboard", label: "Dashboard", short: "D", active: (path: string) => path === "/dashboard" },
  { href: "/missionen/tagesmissionen", label: "Missionen", short: "M", active: (path: string) => path.startsWith("/missionen"), location: true },
  { href: "/buddy", label: "Mein KI-Buddy", short: "B", active: (path: string) => path.startsWith("/buddy") },
  { href: "/marktplatz", label: "Marktplatz", short: "K", active: (path: string) => path.startsWith("/marktplatz") },
  { href: "/leaderboard", label: "Leaderboard", short: "L", active: (path: string) => path.startsWith("/leaderboard") },
  { href: "/punkte-shop", label: "Punkte-Shop", short: "P", active: (path: string) => path.startsWith("/punkte-shop") },
  { href: "/analytics", label: "Analytics & Stats", short: "A", active: (path: string) => path.startsWith("/analytics") },
];

const utilityNavItems = [
  { href: "/einstellungen", label: "Einstellungen", short: "E" },
  { href: "/datenschutz", label: "Datenschutz", short: "S" },
  { href: "/agb", label: "AGB", short: "G" },
  { href: "/impressum", label: "Impressum", short: "I" },
  { href: "/faq", label: "FAQ", short: "F" },
  { href: "/hilfe", label: "Hilfe", short: "H" },
];

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
    ? "flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-sm font-black text-orange-400"
    : "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white/80 hover:bg-white/5 hover:text-cyan-100";

  return (
    <aside className={`relative flex h-full shrink-0 flex-col border-r border-cyan-400/10 bg-[#042f35]/95 transition-[width] duration-200 ease-out ${collapsed ? "w-[74px]" : "w-[250px]"}`}>
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
                {collapsed ? item.short : item.label}
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

        <nav className={`mt-auto shrink-0 border-t border-cyan-400/10 pt-4 ${collapsed ? "flex w-full flex-col items-center gap-1.5" : "w-full space-y-2 text-[14px]"}`}>
          {utilityNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={collapsed ? collapsedClass(active) : expandedClass(active)}
                title={collapsed ? item.label : undefined}
              >
                {collapsed ? item.short : item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={onLogout}
            className={collapsed ? "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-red-400 hover:bg-red-400/10 hover:text-red-300" : "block w-full text-left text-[14px] font-bold text-red-400 hover:text-red-300"}
            title={collapsed ? "Abmelden" : undefined}
          >
            {collapsed ? "X" : "Abmelden"}
          </button>
        </nav>
      </div>
    </aside>
  );
}
