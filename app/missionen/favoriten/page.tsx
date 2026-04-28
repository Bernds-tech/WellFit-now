"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type FavoriteItem = {
  id: string;
  title: string;
  description: string;
  label: string;
  icon: string;
  href: string;
  group: "Tagesmissionen" | "Wochenmissionen" | "Abenteuer" | "Challenge" | "Wettkämpfe" | "KI-Buddy";
};

const favoriteCatalog: FavoriteItem[] = [
  { id: "daily-1", title: "Tägliche Schritte", description: "Dein bevorzugtes Tagesziel.", label: "+25", icon: "👟", href: "/missionen/tagesmissionen", group: "Tagesmissionen" },
  { id: "daily-2", title: "Hampelmänner", description: "Kurze Fitness-Mission mit Kamera-Tracking.", label: "+15 WFT", icon: "🕺", href: "/missionen/tagesmissionen", group: "Tagesmissionen" },
  { id: "weekly-1", title: "Wöchentliche Bewegungsmission", description: "Sammle 50.000 Schritte.", label: "+25 WFT", icon: "👟", href: "/missionen/wochenmissionen", group: "Wochenmissionen" },
  { id: "weekly-2", title: "Wöchentliche Fitnessmission", description: "3× Ganzkörper-Training pro Woche.", label: "+1 Wochen-NFT", icon: "🏃", href: "/missionen/wochenmissionen", group: "Wochenmissionen" },
  { id: "adventure-1", title: "Castle", description: "Ritterburg-Abenteuer mit Rätseln.", label: "+300 WFT", icon: "🏰", href: "/missionen/abenteuer", group: "Abenteuer" },
  { id: "adventure-2", title: "Zoo Quest", description: "Tierpark-Abenteuer mit Wissenspunkten.", label: "+180 WFT", icon: "🦁", href: "/missionen/abenteuer", group: "Abenteuer" },
  { id: "challenge-3", title: "Mathe-Speed", description: "Rechenaufgaben in 45 Sekunden.", label: "Wissen", icon: "✅", href: "/missionen/challenge", group: "Challenge" },
  { id: "competition-1", title: "Rathaus-Checkpoint", description: "Checkpoint mit Bürgermeister-System.", label: "👑 Bürgermeister", icon: "🧠", href: "/missionen/wettkaempfe", group: "Wettkämpfe" },
];

const groups: FavoriteItem["group"][] = ["Tagesmissionen", "Wochenmissionen", "Abenteuer", "Challenge", "Wettkämpfe", "KI-Buddy"];

export default function FavoritenPage() {
  const [brightness, setBrightness] = useState(100);
  const [manualFavorites, setManualFavorites] = useState<string[]>([]);

  useEffect(() => {
    const ids = new Set<string>();
    const readNumberIds = (key: string, prefix: string) => {
      const saved = localStorage.getItem(key);
      if (!saved) return;
      try {
        const parsed = JSON.parse(saved) as number[];
        parsed.forEach((id) => ids.add(`${prefix}-${id}`));
      } catch (error) {
        console.error(`Fehler beim Laden von ${key}`, error);
      }
    };

    readNumberIds("wellfit-favorite-daily-missions", "daily");
    readNumberIds("wellfit-favorite-weekly-missions", "weekly");
    readNumberIds("wellfit-favorite-adventures", "adventure");
    readNumberIds("wellfit-favorite-challenges", "challenge");

    setManualFavorites(Array.from(ids));
  }, []);

  const favorites = useMemo(() => {
    if (manualFavorites.length === 0) return favoriteCatalog.slice(0, 4);
    const selected = favoriteCatalog.filter((item) => manualFavorites.includes(item.id));
    return selected.length > 0 ? selected : favoriteCatalog.slice(0, 4);
  }, [manualFavorites]);

  return (
    <main className="h-screen w-screen overflow-hidden text-white" style={{ background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))` }}>
      <div className="flex h-full">
        <aside className="flex h-full w-[250px] flex-col border-r border-cyan-400/10 bg-[#042f35]/95 px-5 py-6">
          <div className="mb-8 flex justify-center"><Image src="/logo.png" alt="WellFit Logo" width={150} height={150} className="object-contain" priority /></div>
          <nav className="space-y-2 text-[14px]"><Link href="/dashboard" className="block text-white/80">Dashboard</Link><div className="font-bold text-orange-400">Missionen</div><div className="text-white/80">Mein KI-Buddy</div><div className="text-white/80">Marktplatz</div><div className="text-white/80">Leaderboard</div><div className="text-white/80">Punkte-Shop</div><div className="text-white/80">Analytics & Stats</div></nav>
          <div className="mt-5 border-t border-cyan-400/10 pt-4"><div className="mb-2 whitespace-nowrap text-base font-bold text-green-400">App aufs Handy laden</div><label className="mb-1 block text-lg">Helligkeit</label><input type="range" min="5" max="100" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} className="w-full" /><div className="mt-1 text-right text-sm text-white/70">{brightness}%</div></div>
          <div className="mt-auto pt-4"><div className="space-y-2 text-[14px]"><Link href="/einstellungen" className="block text-white/80">Einstellungen</Link><Link href="/datenschutz" className="block text-white/80">Datenschutz</Link><Link href="/agb" className="block text-white/80">AGB</Link><Link href="/impressum" className="block text-white/80">Impressum</Link><Link href="/faq" className="block text-white/80">FAQ</Link><Link href="/hilfe" className="block text-white/80">Hilfe</Link></div><div className="mt-4 border-t border-cyan-400/10 pt-3"><button className="text-[14px] font-bold text-red-400 hover:text-red-300">Abmelden</button></div></div>
        </aside>
        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <div className="mb-4 flex justify-between"><div><h1 className="text-5xl font-extrabold leading-none">Favoriten</h1><p className="mt-1 text-lg text-cyan-100/90">Hier werden alle gespeicherten Favoriten gesammelt: Missionen, Abenteuer, Challenges, Checkpoints und später Buddy-Hinweise.</p></div><div className="rounded-full bg-[#073b44] px-4 py-2 text-sm">{favorites.length} Favoriten</div></div>
          <div className="mb-4 flex justify-center"><div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm"><Link href="/missionen/tagesmissionen" className="pb-1 text-base text-white/85 hover:text-white">Tagesmissionen</Link><Link href="/missionen/wochenmissionen" className="pb-1 text-base text-white/85 hover:text-white">Wochenmissionen</Link><Link href="/missionen/abenteuer" className="pb-1 text-base text-white/85 hover:text-white">Abenteuer</Link><Link href="/missionen/challenge" className="pb-1 text-base text-white/85 hover:text-white">Challenge</Link><Link href="/missionen/wettkaempfe" className="pb-1 text-base text-white/85 hover:text-white">Wettkämpfe</Link><div className="relative pb-1 text-base font-semibold text-orange-400">Favoriten<span className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full bg-orange-400" /></div><Link href="/missionen/history" className="pb-1 text-base text-white/85 hover:text-white">History</Link></div></div>
          <div className="min-h-0 flex-1 overflow-y-auto pb-20 pr-2">
            {groups.map((group) => {
              const groupItems = favorites.filter((item) => item.group === group);
              if (groupItems.length === 0) return null;
              return (
                <div key={group} className="mb-6">
                  <h2 className="mb-3 text-2xl font-bold text-cyan-300">{group}</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {groupItems.map((item) => (
                      <div key={item.id} className="rounded-[20px] border border-cyan-300/10 bg-[#053841]/90 p-4 shadow-[0_8px_20px_rgba(0,0,0,0.14)]">
                        <div className="mb-3 flex items-start justify-between"><div className="text-3xl">{item.icon}</div><div className="text-xl text-yellow-400">★</div></div>
                        <h3 className="text-lg font-bold leading-tight text-white">{item.title}</h3>
                        <p className="mt-2 text-sm text-white/80">{item.description}</p>
                        <div className="mt-3 text-sm font-semibold text-yellow-400">{item.label}</div>
                        <Link href={item.href} className="mt-4 block w-full rounded-lg border border-yellow-400/40 bg-[#0a3d46] px-3 py-2 text-center text-sm font-bold text-white transition hover:bg-[#0e4c57]">Öffnen</Link>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3"><div className="flex items-center gap-3"><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Favoriten gesamt</p><p className="mt-1 text-sm font-semibold text-white">{favorites.length}</p></div><div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Quelle</p><p className="mt-1 text-sm font-bold text-white">Merkliste</p></div></div><div className="flex items-center gap-3 text-xl text-white/80"><span>f</span><span>𝕏</span><span>in</span></div></div>
        </section>
      </div>
    </main>
  );
}
