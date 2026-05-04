"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppInstallPrompt from "@/app/components/AppInstallPrompt";
import { updateCurrentDeviceLocation } from "@/app/lib/deviceLocation";

type AppSidebarProps = {
  brightness: number;
  onBrightnessChange: (value: number) => void;
  onLogout?: () => void;
};

const activeClass = "block break-words font-bold text-orange-400";
const inactiveClass = "block break-words text-white/80 hover:text-cyan-100";

export default function AppSidebar({ brightness, onBrightnessChange, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const isMissionen = pathname.startsWith("/missionen");
  const isBuddy = pathname.startsWith("/buddy");

  const updateLocationBeforeMissionNavigation = () => {
    void updateCurrentDeviceLocation();
  };

  return (
    <aside className="flex h-full w-[88px] shrink-0 flex-col overflow-y-auto border-r border-cyan-400/10 bg-[#042f35]/95 px-3 py-4 sm:w-[190px] sm:px-4 sm:py-5 lg:w-[250px] lg:px-5 lg:py-6">
      <div className="mb-5 flex justify-center sm:mb-7 lg:mb-8">
        <Image
          src="/logo.png"
          alt="WellFit Logo"
          width={150}
          height={150}
          priority
          className="h-auto w-16 sm:w-28 lg:w-[150px]"
        />
      </div>

      <nav className="space-y-2 text-[11px] leading-tight sm:text-[13px] lg:text-[14px]">
        <Link href="/dashboard" className={isDashboard ? activeClass : inactiveClass}>Dashboard</Link>
        <Link href="/missionen/tagesmissionen" onClick={updateLocationBeforeMissionNavigation} className={isMissionen ? activeClass : inactiveClass}>Missionen</Link>
        <Link href="/buddy" className={isBuddy ? activeClass : inactiveClass}>Mein KI-Buddy</Link>
        <div className="break-words text-white/80">Marktplatz</div>
        <div className="break-words text-white/80">Leaderboard</div>
        <div className="break-words text-white/80">Punkte-Shop</div>
        <div className="break-words text-white/80">Analytics & Stats</div>
      </nav>

      <div className="mt-4 border-t border-cyan-400/10 pt-4 sm:mt-5">
        <AppInstallPrompt />
        <label className="mb-1 block break-words text-xs sm:text-base lg:text-lg">Helligkeit</label>
        <input type="range" min="5" max="100" value={brightness} onChange={(event) => onBrightnessChange(Number(event.target.value))} className="w-full" />
        <div className="mt-1 text-right text-[11px] text-white/70 sm:text-sm">{brightness}%</div>
      </div>

      <div className="mt-auto space-y-2 pt-4 text-[11px] leading-tight sm:text-[13px] lg:text-[14px]">
        <Link href="/einstellungen" className={pathname === "/einstellungen" ? activeClass : inactiveClass}>Einstellungen</Link>
        <Link href="/datenschutz" className={pathname === "/datenschutz" ? activeClass : inactiveClass}>Datenschutz</Link>
        <Link href="/agb" className={pathname === "/agb" ? activeClass : inactiveClass}>AGB</Link>
        <Link href="/impressum" className={pathname === "/impressum" ? activeClass : inactiveClass}>Impressum</Link>
        <Link href="/faq" className={pathname === "/faq" ? activeClass : inactiveClass}>FAQ</Link>
        <Link href="/hilfe" className={pathname === "/hilfe" ? activeClass : inactiveClass}>Hilfe</Link>
        <button type="button" onClick={onLogout} className="break-words pt-3 text-[11px] font-bold text-red-400 hover:text-red-300 sm:text-[13px] lg:text-[14px]">Abmelden</button>
      </div>
    </aside>
  );
}
