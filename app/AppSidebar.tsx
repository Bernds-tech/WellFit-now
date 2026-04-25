"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AppSidebarProps = {
  brightness: number;
  onBrightnessChange: (value: number) => void;
  onLogout?: () => void;
};

const activeClass = "block font-bold text-orange-400";
const inactiveClass = "block text-white/80 hover:text-cyan-100";

export default function AppSidebar({ brightness, onBrightnessChange, onLogout }: AppSidebarProps) {
  const pathname = usePathname();
  const isDashboard = pathname === "/dashboard";
  const isMissionen = pathname.startsWith("/missionen");

  return (
    <aside className="flex h-full w-[250px] flex-col border-r border-cyan-400/10 bg-[#042f35]/95 px-5 py-6">
      <div className="mb-8 flex justify-center">
        <Image src="/logo.png" alt="WellFit Logo" width={150} height={150} priority />
      </div>

      <nav className="space-y-2 text-[14px]">
        <Link href="/dashboard" className={isDashboard ? activeClass : inactiveClass}>Dashboard</Link>
        <Link href="/missionen/tagesmissionen" className={isMissionen ? activeClass : inactiveClass}>Missionen</Link>
        <div className="text-white/80">Mein KI-Buddy</div>
        <div className="text-white/80">Marktplatz</div>
        <div className="text-white/80">Leaderboard</div>
        <div className="text-white/80">Punkte-Shop</div>
        <div className="text-white/80">Analytics & Stats</div>
      </nav>

      <div className="mt-5 border-t border-cyan-400/10 pt-4">
        <div className="mb-2 whitespace-nowrap text-base font-bold text-green-400">App aufs Handy laden</div>
        <label className="mb-1 block text-lg">Helligkeit</label>
        <input type="range" min="5" max="100" value={brightness} onChange={(event) => onBrightnessChange(Number(event.target.value))} className="w-full" />
        <div className="mt-1 text-right text-sm text-white/70">{brightness}%</div>
      </div>

      <div className="mt-auto space-y-2 pt-4 text-[14px]">
        <Link href="/einstellungen" className={pathname === "/einstellungen" ? activeClass : inactiveClass}>Einstellungen</Link>
        <Link href="/datenschutz" className={pathname === "/datenschutz" ? activeClass : inactiveClass}>Datenschutz</Link>
        <Link href="/agb" className={pathname === "/agb" ? activeClass : inactiveClass}>AGB</Link>
        <Link href="/impressum" className={pathname === "/impressum" ? activeClass : inactiveClass}>Impressum</Link>
        <Link href="/faq" className={pathname === "/faq" ? activeClass : inactiveClass}>FAQ</Link>
        <Link href="/hilfe" className={pathname === "/hilfe" ? activeClass : inactiveClass}>Hilfe</Link>
        <button type="button" onClick={onLogout} className="pt-3 text-[14px] font-bold text-red-400 hover:text-red-300">Abmelden</button>
      </div>
    </aside>
  );
}
