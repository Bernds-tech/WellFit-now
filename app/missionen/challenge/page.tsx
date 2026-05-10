"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@/types/user";
import GoogleMissionMap from "../components/GoogleMissionMap";

type ChallengeCategory = "Sport & Bewegung" | "Fitness & Klarheit" | "Wissen & Klarheit" | "Geschicklichkeit" | "AR & Erlebnis" | "Wellness & Mindset";
type Challenge = { id: number; title: string; category: ChallengeCategory; description: string; playersActive: number; localPoints: string; level: string; reward: string; icon: string; lat: number; lng: number; };

const categories: ChallengeCategory[] = ["Sport & Bewegung", "Fitness & Klarheit", "Wissen & Klarheit", "Geschicklichkeit", "AR & Erlebnis", "Wellness & Mindset"];
const challenges: Challenge[] = [
  { id: 1, title: "Balance-Park Challenge", category: "Sport & Bewegung", description: "Balanciere über Hindernisse und halte deine Kontrolle bis zum Ziel.", playersActive: 8, localPoints: "38,50", level: "2+", reward: "1,2 km", icon: "🏃", lat: 48.204994, lng: 16.386607 },
  { id: 2, title: "Fitness-Duelle", category: "Fitness & Klarheit", description: "Miss dich im lokalen Fitness-Quiz und sammle interne Bonuspunkte vor Ort.", playersActive: 6, localPoints: "41,00", level: "3+", reward: "2,1 km", icon: "🏋️", lat: 48.198123, lng: 16.371512 },
  { id: 3, title: "Mathe-Speed", category: "Wissen & Klarheit", description: "Löse so viele Rechenaufgaben wie möglich in 45 Sekunden.", playersActive: 14, localPoints: "72,80", level: "4+", reward: "2,6 km", icon: "✅", lat: 48.210033, lng: 16.363449 },
  { id: 4, title: "Reaktions-Test", category: "Geschicklichkeit", description: "Tippe präzise, reagiere schnell und knacke die Zielzeit.", playersActive: 5, localPoints: "29,40", level: "2+", reward: "1,4 km", icon: "⚡", lat: 48.215115, lng: 16.396277 },
  { id: 5, title: "AR-Fundstück", category: "AR & Erlebnis", description: "Entdecke versteckte Marker in deiner Umgebung und sichere Spezialpunkte.", playersActive: 9, localPoints: "64,20", level: "5+", reward: "3,0 km", icon: "📍", lat: 48.205914, lng: 16.357956 },
  { id: 6, title: "Mindset-Flow", category: "Wellness & Mindset", description: "Atme bewusst, bleibe fokussiert und schließe den Ruhe-Parcours ab.", playersActive: 4, localPoints: "21,70", level: "1+", reward: "0,8 km", icon: "🧘", lat: 48.20849, lng: 16.37208 },
];

export default function ChallengePage() {
  const [brightness, setBrightness] = useState(100);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("Bereit für neue Challenges?");
  const [selectedCategory, setSelectedCategory] = useState<ChallengeCategory>("Wissen & Klarheit");
  const [selectedChallengeId, setSelectedChallengeId] = useState<number>(3);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem("wellfit-user");
    const savedFavorites = localStorage.getItem("wellfit-favorite-challenges");
    if (savedUser) { try { setUser(JSON.parse(savedUser)); } catch (error) { console.error("Fehler beim Laden des Users", error); } }
    if (savedFavorites) { try { setFavoriteIds(JSON.parse(savedFavorites)); } catch (error) { console.error("Fehler beim Laden der Challenge-Favoriten", error); } }
  }, []);

  const filteredChallenges = useMemo(() => challenges.filter((challenge) => challenge.category === selectedCategory), [selectedCategory]);
  useEffect(() => { const stillVisible = filteredChallenges.some((challenge) => challenge.id === selectedChallengeId); if (!stillVisible && filteredChallenges.length > 0) setSelectedChallengeId(filteredChallenges[0].id); }, [filteredChallenges, selectedChallengeId]);
  const selectedChallenge = challenges.find((challenge) => challenge.id === selectedChallengeId) ?? challenges[0];
  const challengeMarkers = useMemo(() => filteredChallenges.map((challenge) => ({ id: challenge.id, title: challenge.title, subtitle: challenge.category, icon: challenge.icon, lat: challenge.lat, lng: challenge.lng, status: challenge.playersActive > 10 ? "aktiv" : "live" })), [filteredChallenges]);
  const toggleFavorite = (challengeId: number) => { const updated = favoriteIds.includes(challengeId) ? favoriteIds.filter((id) => id !== challengeId) : [...favoriteIds, challengeId]; setFavoriteIds(updated); localStorage.setItem("wellfit-favorite-challenges", JSON.stringify(updated)); };
  const startRoute = () => { setMessage(`Route gestartet: ${selectedChallenge.title}. Interne Beta-Anzeige, keine Token/NFTs.`); localStorage.setItem("wellfit-active-challenge", JSON.stringify(selectedChallenge.id)); };

  return (
    <main className="h-screen w-screen overflow-hidden text-white" style={{ background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))` }}>
      <div className="flex h-full">
        <aside className="flex h-full w-[250px] flex-col border-r border-cyan-400/10 bg-[#042f35]/95 px-5 py-6">
          <div className="mb-8 flex justify-center"><Image src="/logo.png" alt="WellFit Logo" width={150} height={150} className="object-contain" priority /></div>
          <nav className="space-y-2 text-[14px]"><Link href="/dashboard" className="block text-white/80">Dashboard</Link><div className="font-bold text-orange-400">Missionen</div><div className="text-white/80">Mein KI-Buddy</div><div className="text-white/80">Marktplatz</div><div className="text-white/80">Leaderboard</div><div className="text-white/80">Punkte-Shop</div><div className="text-white/80">Analytics & Stats</div></nav>
          <div className="mt-5 border-t border-cyan-400/10 pt-4"><div className="mb-2 whitespace-nowrap text-base font-bold text-green-400">App aufs Handy laden</div><label className="mb-1 block text-lg">Helligkeit</label><input type="range" min="5" max="100" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full" /><div className="mt-1 text-right text-sm text-white/70">{brightness}%</div></div>
          <div className="mt-auto pt-4"><div className="space-y-2 text-[14px]"><Link href="/einstellungen" className="block text-white/80">Einstellungen</Link><Link href="/datenschutz" className="block text-white/80">Datenschutz</Link><Link href="/agb" className="block text-white/80">AGB</Link><Link href="/impressum" className="block text-white/80">Impressum</Link><Link href="/faq" className="block text-white/80">FAQ</Link><Link href="/hilfe" className="block text-white/80">Hilfe</Link></div><div className="mt-4 border-t border-cyan-400/10 pt-3"><button className="text-[14px] font-bold text-red-400 hover:text-red-300">Abmelden</button></div></div>
        </aside>
        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <div className="mb-4 flex justify-between"><div><h1 className="text-5xl font-extrabold leading-none">Challenge</h1><p className="mt-1 text-lg text-cyan-100/90">{message}</p></div><div className="flex items-center gap-2"><button className="rounded-full border border-cyan-300/20 bg-[#0a6b78]/20 px-4 py-2 text-sm text-white/90">Synchron</button><button className="rounded-[16px] bg-orange-500 px-5 py-3 text-sm font-bold">Tracker starten</button><div className="rounded-full bg-[#073b44] px-4 py-2 text-sm">Flammi LVL 1</div></div></div>
          <div className="mb-4 flex justify-center"><div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm"><Link href="/missionen/tagesmissionen" className="pb-1 text-base text-white/85 hover:text-white">Tagesmissionen</Link><Link href="/missionen/wochenmissionen" className="pb-1 text-base text-white/85 hover:text-white">Wochenmissionen</Link><Link href="/missionen/abenteuer" className="pb-1 text-base text-white/85 hover:text-white">Abenteuer</Link><div className="relative pb-1 text-base font-semibold text-orange-400">Challenge<span className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full bg-orange-400" /></div><Link href="/missionen/wettkaempfe" className="pb-1 text-base text-white/85 hover:text-white">Wettkämpfe</Link><Link href="/missionen/favoriten" className="pb-1 text-base text-white/85 hover:text-white">Favoriten</Link><Link href="/missionen/history" className="pb-1 text-base text-white/85 hover:text-white">History</Link></div></div>
          <div className="grid min-h-0 flex-1 grid-cols-[2fr_0.95fr] gap-4 overflow-hidden pb-20">
            <div className="min-h-0 overflow-hidden rounded-[22px] border border-cyan-300/10 bg-[#0a5564]/55"><div className="flex border-b border-white/10 bg-[#093f4a]/95">{categories.map((category) => (<button key={category} onClick={() => setSelectedCategory(category)} className={`flex-1 border-r border-white/10 px-2 py-3 text-center text-sm font-semibold transition last:border-r-0 ${selectedCategory === category ? "bg-[#0e6e7a] text-cyan-200" : "text-white/75 hover:bg-white/5 hover:text-white"}`}>{category}</button>))}</div><GoogleMissionMap title="Google Maps Challenge" subtitle="Zoomen · ziehen · lokale Challenges wählen" markers={challengeMarkers} selectedMarkerId={selectedChallengeId} onSelectMarker={setSelectedChallengeId} zoom={13} minHeightClassName="h-[calc(100%-45px)] min-h-[480px]" /></div>
            <div className="min-h-0 overflow-y-auto rounded-[22px] border border-cyan-300/10 bg-[#053841]/95 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.18)]"><div className="mb-4 flex items-start justify-between gap-3"><div className="rounded-lg bg-cyan-500/20 px-3 py-2 text-sm font-bold text-cyan-300">{selectedChallenge.category}</div><button onClick={() => toggleFavorite(selectedChallenge.id)} className={`text-2xl ${favoriteIds.includes(selectedChallenge.id) ? "text-yellow-400" : "text-white/30"}`}>★</button></div><div className="mb-4 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/20 text-3xl">{selectedChallenge.icon}</div><h2 className="text-2xl font-bold text-white">{selectedChallenge.title}</h2></div><p className="mb-4 text-sm leading-relaxed text-white/85">{selectedChallenge.description}</p><div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full bg-cyan-300" style={{ width: "32%" }} /></div><div className="space-y-2 text-sm text-white/80"><p>👥 Vor Ort aktiv: {selectedChallenge.playersActive}</p><p>🏅 Interne Punkte vor Ort: {selectedChallenge.localPoints}</p><p>📶 Level-Empfehlung: {selectedChallenge.level}</p><p>🎁 Bewegungsziel: {selectedChallenge.reward}</p></div><div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-3 text-xs text-white/65">Interne Beta-Challenge. Keine Token, keine NFTs, keine Auszahlung.</div><button onClick={startRoute} className="mt-5 w-full rounded-xl bg-cyan-500 px-4 py-3 text-base font-bold text-black transition hover:bg-cyan-400">Route</button></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3"><div className="flex items-center gap-3"><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Letzter Login: Heute 9:43</p><p className="mt-1 text-sm font-semibold text-white">Interne Beta aktiv</p></div><div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Interne Punkte</p><p className="mt-1 text-lg font-bold text-white">{user?.points ?? 0}</p></div><div className="min-w-[220px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Beta-Hinweis</p><p className="mt-1 text-xs font-semibold text-white/70">Keine Token · keine NFTs · keine Auszahlung</p></div><div className="min-w-[170px] rounded-xl border border-yellow-500/40 bg-[#0a3d46] px-3 py-2 text-center"><p className="text-sm font-semibold text-yellow-400">⚠ Server-Event vorbereitet</p></div></div><div className="flex items-center gap-3 text-xl text-white/80"><span>f</span><span>X</span><span>in</span></div></div>
        </section>
      </div>
    </main>
  );
}
