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
  { href: "/dashboard", label: "Dashboard", icon: "D", activePrefix: "/dashboard" },
  { href: "/missionen/tagesmissionen", label: "Missionen", icon: "M", activePrefix: "/missionen", location: true },
  { href: "/buddy", label: "Mein KI-Buddy", icon: "B", activePrefix: "/buddy" },
  { href: "/marktplatz", label: "Marktplatz", icon: "K", activePrefix: "/marktplatz" },
  { href: "/leaderboard", label: "Leaderboard", icon: "L", activePrefix: "/leaderboard" },
  { href: "/punkte-shop", label: "Punkte-Shop", icon: "P", activePrefix: "/punkte-shop" },
  { href: "/analytics", label: "Analytics & Stats", icon: "A", activePrefix: "/analytics" },
];

const utilityNavItems = [
  { href: "/einstellungen", label: "Einstellungen", icon: "E" },
  { href: "/datenschutz", label: "Datenschutz", icon: "S" },
  { href: "/agb", label: "AGB", icon: "G" },
  { href: "/impressum", label: "Impressum", icon: "I" },
  { href: "/faq", label: "FAQ", icon: "F" },
  { href: "/hilfe", label: "Hilfe", icon: "H" },
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

  const isActive = (href: string, prefix: string) => href === "/dashboard" ? pathname === href : pathname.startsWith(prefix);
  const linkClass = (active: boolean) => collapsed
    ? `flex h-10 items-center justify-center rounded-lg text-base font-bold ${active ? "text-orange-400" : "text-white/80 hover:bg-white/5 hover:text-cyan-100"}`
    : `block rounded-lg py-1.5 text-[14px] ${active ? "font-bold text-orange-400" : "text-white/80 hover:text-cyan-100"}`;

  return (
    <aside className={`relative flex h-full shrink-0 flex-col border-r border-cyan-400/10 bg-[#042f35]/95 transition-[width] duration-200 ease-out ${collapsed ? "w-[74px]" : "w-[250px]"}`}>
      <button type="button" onClick={toggleCollapsed} aria-label={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"} title={collapsed ? "Sidebar ausklappen" : "Sidebar einklappen"} className="absolute right-[-13px] top-7 z-30 flex h-7 w-7 items-center justify-center rounded-full border border-cyan-300/30 bg-[#063b43] text-sm font-black text-cyan-100 shadow-[0_6px_18px_rgba(0,0,0,0.25)] hover:bg-[#0a4c55]">
        {collapsed ? "+" : "-"}
      </button>

      <div className={`flex h-full min-h-0 flex-col ${collapsed ? "items-center px-2 py-6" : "px-5 py-6"}`}>
        <div className="mb-8 flex shrink-0 justify-center">
          <Image src="/logo.png" alt="WellFit Logo" width={collapsed ? 52 : 150} height={collapsed ? 52 : 150} priority className={collapsed ? "h-[52px] w-[52px] object-contain" : "h-auto w-[150px] object-contain"} />
        </div>

        <nav className="w-full shrink-0 space-y-2 text-[14px]">
          {mainNavItems.map((item) => (
            <Link key={item.href} href={item.href} onClick={item.location ? () => void updateCurrentDeviceLocation() : undefined} className={linkClass(isActive(item.href, item.activePrefix))} title={collapsed ? item.label : undefined}>
              {collapsed ? item.icon : item.label}
            </Link>
          ))}
        </nav>

        {!collapsed && (
          <div className="mt-5 w-full shrink-0 border-t border-cyan-400/10 pt-4">
            <AppInstallPrompt />
            <label className="mb-1 block text-lg">Helligkeit</label>
            <input type="range" min="5" max="100" value={brightness} onChange={(event) => onBrightnessChange(Number(event.target.value))} className="w-full" />
            <div className="mt-1 text-right text-sm text-white/70">{brightness}%</div>
          </div>
        )}

        <nav className={`${collapsed ? "mt-auto w-full space-y-1.5 border-t border-cyan-400/10 pt-4" : "mt-auto w-full space-y-2 border-t border-cyan-400/10 pt-4 text-[14px]"}`}>
          {utilityNavItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={linkClass(active)} title={collapsed ? item.label : undefined}>
                {collapsed ? item.icon : item.label}
              </Link>
            );
          })}

          <button type="button" onClick={onLogout} className={`${collapsed ? "flex h-10 w-full items-center justify-center rounded-lg text-base" : "block w-full rounded-lg py-1.5 text-left text-[14px]"} font-bold text-red-400 hover:bg-red-400/10 hover:text-red-300`} title={collapsed ? "Abmelden" : undefined}>
            {collapsed ? "X" : "Abmelden"}
          </button>
        </nav>
      </div>
    </aside>
  );
}
