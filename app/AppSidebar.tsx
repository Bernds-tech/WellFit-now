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

const activeClass = "block rounded-lg px-2 py-1.5 font-bold text-orange-400";
const inactiveClass = "block rounded-lg px-2 py-1.5 text-white/80 hover:bg-white/5 hover:text-cyan-100";

export default function AppSidebar({ brightness, onBrightnessChange, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const isMissionen = pathname.startsWith("/missionen");
  const isBuddy = pathname.startsWith("/buddy");
  const isMarketplace = pathname.startsWith("/marktplatz");
  const isLeaderboard = pathname.startsWith("/leaderboard");
  const isPointsShop = pathname.startsWith("/punkte-shop");
  const isAnalytics = pathname.startsWith("/analytics");

  const updateLocationBeforeMissionNavigation = () => {
    void updateCurrentDeviceLocation();
  };

  return (
    <aside className="h-full w-[clamp(180px,18vw,250px)] shrink-0 border-r border-cyan-400/10 bg-[#042f35]/95">
      <div className="flex h-full flex-col overflow-y-auto px-3 py-4 sm:px-4 sm:py-5 lg:px-5 lg:py-6">
        <div className="mb-5 flex shrink-0 justify-center sm:mb-6 lg:mb-8">
          <Image
            src="/logo.png"
            alt="WellFit Logo"
            width={150}
            height={150}
            priority
            className="h-auto w-[clamp(86px,9vw,150px)]"
          />
        </div>

        <nav className="shrink-0 space-y-1.5 text-[13px] leading-tight sm:text-[14px]">
          <Link href="/dashboard" className={isDashboard ? activeClass : inactiveClass}>Dashboard</Link>
          <Link href="/missionen/tagesmissionen" onClick={updateLocationBeforeMissionNavigation} className={isMissionen ? activeClass : inactiveClass}>Missionen</Link>
          <Link href="/buddy" className={isBuddy ? activeClass : inactiveClass}>Mein KI-Buddy</Link>
          <Link href="/marktplatz" className={isMarketplace ? activeClass : inactiveClass}>Marktplatz</Link>
          <Link href="/leaderboard" className={isLeaderboard ? activeClass : inactiveClass}>Leaderboard</Link>
          <Link href="/punkte-shop" className={isPointsShop ? activeClass : inactiveClass}>Punkte-Shop</Link>
          <Link href="/analytics" className={isAnalytics ? activeClass : inactiveClass}>Analytics & Stats</Link>
        </nav>

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

        <nav className="mt-5 shrink-0 space-y-1.5 border-t border-cyan-400/10 pt-4 text-[13px] leading-tight sm:text-[14px]">
          <Link href="/einstellungen" className={pathname === "/einstellungen" ? activeClass : inactiveClass}>Einstellungen</Link>
          <Link href="/datenschutz" className={pathname === "/datenschutz" ? activeClass : inactiveClass}>Datenschutz</Link>
          <Link href="/agb" className={pathname === "/agb" ? activeClass : inactiveClass}>AGB</Link>
          <Link href="/impressum" className={pathname === "/impressum" ? activeClass : inactiveClass}>Impressum</Link>
          <Link href="/faq" className={pathname === "/faq" ? activeClass : inactiveClass}>FAQ</Link>
          <Link href="/hilfe" className={pathname === "/hilfe" ? activeClass : inactiveClass}>Hilfe</Link>
          <button
            type="button"
            onClick={onLogout}
            className="block w-full rounded-lg px-2 py-1.5 text-left text-[13px] font-bold text-red-400 hover:bg-red-400/10 hover:text-red-300 sm:text-[14px]"
          >
            Abmelden
          </button>
        </nav>
      </div>
    </aside>
  );
}
