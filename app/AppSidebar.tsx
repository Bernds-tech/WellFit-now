"use client";

import Image from "next/image";
import Link from "next/link";

type AppSidebarProps = {
  brightness: number;
  onBrightnessChange: (value: number) => void;
};

export default function AppSidebar({ brightness, onBrightnessChange }: AppSidebarProps) {
  return (
    <aside className="flex h-full w-[250px] flex-col border-r border-cyan-400/10 bg-[#042f35]/95 px-5 py-6">
      <div className="mb-8 flex justify-center">
        <Image src="/logo.png" alt="WellFit Logo" width={150} height={150} priority />
      </div>

      <nav className="space-y-2 text-[14px]">
        <Link href="/dashboard" className="block text-white/80">Dashboard</Link>
        <div className="font-bold text-orange-400">Missionen</div>
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
        <Link href="/einstellungen" className="block text-white/80">Einstellungen</Link>
        <Link href="/datenschutz" className="block text-white/80">Datenschutz</Link>
        <Link href="/agb" className="block text-white/80">AGB</Link>
        <Link href="/impressum" className="block text-white/80">Impressum</Link>
        <Link href="/faq" className="block text-white/80">FAQ</Link>
        <Link href="/hilfe" className="block text-white/80">Hilfe</Link>
        <button className="pt-3 text-[14px] font-bold text-red-400">Abmelden</button>
      </div>
    </aside>
  );
}
