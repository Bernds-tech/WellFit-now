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

type MainNavItem = {
  href: string;
  label: string;
  icon: string;
  isActive: (pathname: string) => boolean;
  onClick?: () => void;
};

type UtilityNavItem = {
  href: string;
  label: string;
  icon: string;
};

const mainNavItems: MainNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠", isActive: (pathname) => pathname === "/dashboard" },
  {
    href: "/missionen/tagesmissionen",
    label: "Missionen",
    icon: "🎯",
    isActive: (pathname) => pathname.startsWith("/missionen"),
    onClick: () => void updateCurrentDeviceLocation(),
  },
  { href: "/buddy", label: "Mein KI-Buddy", icon: "🐉", isActive: (pathname) => pathname.startsWith("/buddy") },
  { href: "/marktplatz", label: "Marktplatz", icon: "🛍️", isActive: (pathname) => pathname.startsWith("/marktplatz") },
  { href: "/leaderboard", label: "Leaderboard", icon: "🏆", isActive: (pathname) => pathname.startsWith("/leaderboard") },
  { href: "/punkte-shop", label: "Punkte-Shop", icon: "🪙", isActive: (pathname) => pathname.startsWith("/punkte-shop") },
  { href: "/analytics", label: "Analytics & Stats", icon: "📊", isActive: (pathname) => pathname.startsWith("/analytics") },
];

const utilityNavItems: UtilityNavItem[] = [
  { href: "/einstellungen", label: "Einstellungen", icon: "⚙️" },
  { href: "/datenschutz", label: "Datenschutz", icon: "🔒" },
  { href: "/agb", label: "AGB", icon: "📄" },
  { href: "/impressum", label: "Impressum", icon: "🏢" },
  { href: "/faq", label: "FAQ", icon: "❓" },
  { href: "/hilfe", label: "Hilfe", icon: "🛟" },
];

export default function AppSidebar({ brightness, onBrightnessChange, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("wellfit-sidebar-collapsed");
    setCollapsed(saved === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem("wellfit-sidebar-collapsed", String(next));
      return next;
    });
  };

  const widthClass = collapsed ? "w-[74px]" : "w-[250px]";
  const navLinkClass = (active: boolean) =>
    collapsed
      ? `flex h-11 items-center justify-center rounded-lg text-xl ${active ? "text-orange-400" : "text-white/80 hover:bg-white/5 hover:text-cyan-100"}`
      : `block rounded-lg px-2 py-1.5 text-[14px] ${active ? "font-bold text-orange-400" : "text-white/80 hover:bg-white/5 hover:text-cyan-100"}`;

  return (
    <aside className={`relative h-full ${widthClass} shrink-0 overflow-hidden border-r border-cyan-400/10 bg-[#042f35]/95 transition-[width] duration-200 ease-out`}>
      <button
        type="button"
        onClick={toggleCollapsed}
        aria-label={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
        title={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
        className="absolute right-[-13px] top-5 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/30 bg-[#063b43] text-sm font-black text-cyan-100 shadow-[0_6px_18px_rgba(0,0,0,0.25)] hover:bg-[#0a4c55]"
      >
        {collapsed ? "›" : "‹"}
      </button>

      <div className={`flex h-full min-h-0 flex-col ${collapsed ? "items-center px-2 py-5" : "px-5 py-6"}`}>
        <div className={`mb-8 flex shrink-0 ${collapsed ? "justify-center" : "justify-center"}`}>
          <Image
            src="/logo.png"
            alt="WellFit Logo"
            width={collapsed ? 54 : 150}
            height={collapsed ? 54 : 150}
            priority
            className={collapsed ? "h-[54px] w-[54px] object-contain" : "h-auto w-[150px] object-contain"}
          />
        </div>

        <nav className={`shrink-0 space-y-2 ${collapsed ? "w-full" : "w-full"}`}>
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={item.onClick}
              className={navLinkClass(item.isActive(pathname))}
              title={collapsed ? item.label : undefined}
            >
              {collapsed ? <span aria-hidden="true">{item.icon}</span> : item.label}
            </Link>
          ))}
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

        <nav className={`${collapsed ? "mt-auto w-full space-y-1.5 border-t border-cyan-400/10 pt-4" : "mt-auto w-full space-y-2 border-t border-cyan-400/10 pt-4 text-[14px]"}`}>
          {utilityNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={navLinkClass(active)}
                title={collapsed ? item.label : undefined}
              >
                {collapsed ? <span aria-hidden="true">{item.icon}</span> : item.label}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={onLogout}
            className={`${collapsed ? "flex h-11 w-full items-center justify-center rounded-lg text-xl" : "block w-full rounded-lg px-2 py-1.5 text-left text-[14px]"} font-bold text-red-400 hover:bg-red-400/10 hover:text-red-300`}
            title={collapsed ? "Abmelden" : undefined}
          >
            {collapsed ? "⏻" : "Abmelden"}
          </button>
        </nav>
      </div>
    </aside>
  );
}
