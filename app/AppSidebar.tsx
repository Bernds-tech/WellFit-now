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

const activeClass = "rounded-lg font-bold text-orange-400";
const inactiveClass = "rounded-lg text-white/80 hover:bg-white/5 hover:text-cyan-100";

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

  const widthClass = collapsed ? "w-[76px]" : "w-[clamp(180px,18vw,250px)]";
  const navLinkClass = (active: boolean) =>
    `${active ? activeClass : inactiveClass} ${collapsed ? "flex h-11 items-center justify-center px-0 py-0 text-xl" : "block px-2 py-1.5 text-[13px] leading-tight sm:text-[14px]"}`;

  return (
    <aside className={`h-full ${widthClass} shrink-0 overflow-hidden border-r border-cyan-400/10 bg-[#042f35]/95 transition-[width] duration-200 ease-out`}>
      <div className="flex h-full min-h-0 flex-col px-3 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6">
        <div className={`mb-4 flex shrink-0 items-center ${collapsed ? "justify-center" : "justify-between"}`}>
          {!collapsed && (
            <Image
              src="/logo.png"
              alt="WellFit Logo"
              width={150}
              height={150}
              priority
              className="h-auto w-[clamp(78px,8vw,132px)]"
            />
          )}

          {collapsed && (
            <Image
              src="/logo.png"
              alt="WellFit Logo"
              width={44}
              height={44}
              priority
              className="h-11 w-11 object-contain"
            />
          )}
        </div>

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
          className={`mb-4 shrink-0 rounded-xl border border-cyan-300/20 bg-[#063b43] px-3 py-2 text-sm font-bold text-cyan-100 transition hover:bg-[#0a4c55] ${collapsed ? "mx-auto w-11 px-0" : "w-full"}`}
          title={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"}
        >
          {collapsed ? "☰" : "☰ Sidebar einklappen"}
        </button>

        <nav className="shrink-0 space-y-1.5">
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
          <div className="mt-5 shrink-0 border-t border-cyan-400/10 pt-4">
            <AppInstallPrompt />
            <label className="mb-1 block text-sm font-semibold sm:text-base lg:text-lg">Helligkeit</label>
            <input
              type="range"
              min="5"
              max="100"
              value={brightness}
              onChange={(event) => onBrightnessChange(Number(event.target.value))}
              className="w-full"
            />
            <div className="mt-1 text-right text-xs text-white/70 sm:text-sm">{brightness}%</div>
          </div>
        )}

        <nav className={`mt-auto shrink-0 space-y-1.5 border-t border-cyan-400/10 pt-4 ${collapsed ? "text-center" : "text-[13px] leading-tight sm:text-[14px]"}`}>
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
            className={`${collapsed ? "flex h-11 w-full items-center justify-center px-0 py-0 text-xl" : "block w-full px-2 py-1.5 text-left text-[13px] sm:text-[14px]"} rounded-lg font-bold text-red-400 hover:bg-red-400/10 hover:text-red-300`}
            title={collapsed ? "Abmelden" : undefined}
          >
            {collapsed ? "⏻" : "Abmelden"}
          </button>
        </nav>
      </div>
    </aside>
  );
}
