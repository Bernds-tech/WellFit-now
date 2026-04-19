"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type MissionTab = "Tagesmissionen" | "Wochenmissionen" | "Abenteuer" | "Challenge" | "Wettkämpfe" | "Favoriten" | "History";
type MissionType = "Bewegung" | "Ernährung" | "Workout" | "Community" | "Abenteuer";
type Mission = {
  id: string;
  title: string;
  reward: number;
  difficulty: "Leicht" | "Mittel" | "Schwer";
  description: string;
  duration: string;
  type: MissionType;
};

const tabs: MissionTab[] = ["Tagesmissionen", "Wochenmissionen", "Abenteuer", "Challenge", "Wettkämpfe", "Favoriten", "History"];
const tabHref = (tab: MissionTab) =>
  tab === "Tagesmissionen" ? "/missionen/tagesmissionen" :
  tab === "Wochenmissionen" ? "/missionen/wochenmissionen" :
  tab === "Abenteuer" ? "/missionen/abenteuer" :
  tab === "Challenge" ? "/missionen/challenge" :
  tab === "Wettkämpfe" ? "/missionen/wettkaempfe" :
  tab === "Favoriten" ? "/missionen/favoriten" : "/missionen/history";

const missionIcon = (type: MissionType) =>
  type === "Bewegung" ? "🏃" : type === "Ernährung" ? "🥗" : type === "Workout" ? "💪" : type === "Community" ? "🧘" : "🧠";

const missions: Mission[] = [
  { id: "daily-8000-steps", title: "8.000 Schritte", reward: 8, difficulty: "Mittel", description: "Erreiche heute 8.000 Schritte. Eine starke Alltagsmission für Kreislauf, Ausdauer und Grundaktivität.", duration: "1 Tag", type: "Bewegung" },
  { id: "daily-sprint-20", title: "20 Sek. Sprint", reward: 10, difficulty: "Schwer", description: "Führe 20 Sekunden intensive Bewegung aus: Sprint, Hampelmänner oder schnelles Treppensteigen.", duration: "20 Sekunden", type: "Bewegung" },
  { id: "daily-squats-15", title: "15 saubere Kniebeugen", reward: 9, difficulty: "Mittel", description: "Mache 15 kontrollierte Kniebeugen. Saubere Ausführung zählt mehr als Geschwindigkeit.", duration: "3 Minuten", type: "Workout" },
  { id: "daily-plank-60", title: "1 Min. Plank", reward: 12, difficulty: "Schwer", description: "Halte eine saubere Plank für 60 Sekunden. Stabilität, Core und Willenskraft werden belohnt.", duration: "1 Minute", type: "Workout" },
  { id: "daily-pushups-10", title: "10 Liegestütze", reward: 11, difficulty: "Schwer", description: "Mache 10 saubere Liegestütze. Wenn nötig auf Knien, aber mit kontrollierter Bewegung.", duration: "4 Minuten", type: "Workout" },
  { id: "daily-memory-3", title: "3 Begriffe merken", reward: 7, difficulty: "Mittel", description: "Merke dir drei Begriffe, warte kurz und rufe sie wieder ab. Trainiert Gedächtnis und Fokus.", duration: "5 Minuten", type: "Abenteuer" },
  { id: "daily-healthy-meal", title: "Bewusste Mahlzeit", reward: 6, difficulty: "Leicht", description: "Iss eine bewusste Mahlzeit mit Gemüse, Eiweiß oder wenig Zucker. Ziel ist bessere Entscheidung, nicht Perfektion.", duration: "1 Mahlzeit", type: "Ernährung" },
  { id: "daily-water-1500", title: "1,5L Wasser", reward: 6, difficulty: "Leicht", description: "Trinke über den Tag verteilt mindestens 1,5 Liter Wasser. Unterstützt Energie, Konzentration und Regeneration.", duration: "1 Tag", type: "Ernährung" },
  { id: "daily-breathing-3", title: "3 Min. Atemruhe", reward: 5, difficulty: "Leicht", description: "Atme 3 Minuten ruhig und bewusst. Senkt Stress und stärkt Selbstkontrolle.", duration: "3 Minuten", type: "Community" },
  { id: "daily-screen-break", title: "10 Min. Bildschirmpause", reward: 5, difficulty: "Leicht", description: "Lege das Handy weg und gönne Augen und Kopf 10 Minuten Pause. Ein kleiner Reset mit großer Wirkung.", duration: "10 Minuten", type: "Community" },
];

export default function MissionenPage() {
  const [brightness, setBrightness] = useState(100);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(missions[0].id);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [dailySlotIds, setDailySlotIds] = useState<(string | null)[]>([null, null, null]);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [rewardDetailsOpen, setRewardDetailsOpen] = useState(false);

  const selectedMission = missions.find((mission) => mission.id === selectedMissionId) ?? missions[0];
  const favoriteMissions = missions.filter((mission) => favoriteIds.includes(mission.id));
  const recommendedIds = useMemo(() => ["daily-plank-60", "daily-8000-steps", "daily-healthy-meal"], []);
  const selectedTypes = dailySlotIds
    .map((id) => missions.find((mission) => mission.id === id)?.type)
    .filter(Boolean) as MissionType[];
  const diversityCount = new Set(selectedTypes).size;
  const diversityMultiplier = diversityCount >= 3 ? 1.2 : diversityCount === 2 ? 1.1 : 1;
  const antiFarmingMultiplier = selectedTypes.filter((type) => type === selectedMission.type).length >= 2 ? 0.8 : 1;
  const currentReward = Math.max(1, Math.round(selectedMission.reward * diversityMultiplier * antiFarmingMultiplier));

  const toggleFavorite = (missionId: string) => {
    setFavoriteIds((current) => current.includes(missionId) ? current.filter((id) => id !== missionId) : [...current, missionId]);
  };

  const assignSlot = (slotIndex: number, missionId: string) => {
    setDailySlotIds((current) => {
      const next = current.map((id) => id === missionId ? null : id);
      next[slotIndex] = missionId;
      return next;
    });
    setSelectedMissionId(missionId);
    setDragOverSlot(null);
  };

  const MissionTile = ({ mission }: { mission: Mission }) => {
    const isFavorite = favoriteIds.includes(mission.id);
    const isRecommended = recommendedIds.includes(mission.id);
    return (
      <button
        draggable
        onDragStart={(event) => event.dataTransfer.setData("text/plain", mission.id)}
        onClick={() => setSelectedMissionId(mission.id)}
        className={`group relative h-[118px] w-[130px] shrink-0 overflow-hidden rounded-[10px] border bg-[#044b54]/95 p-2 text-left shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-[#075d68] active:scale-95 ${isRecommended ? "border-yellow-400 ring-2 ring-yellow-300/70" : selectedMissionId === mission.id ? "border-yellow-400" : "border-cyan-300/25"}`}
      >
        {isRecommended && <div className="absolute left-1/2 top-1 z-10 -translate-x-1/2 rounded-full bg-yellow-400 px-2 py-[1px] text-[10px] font-extrabold text-[#053841]">KI</div>}
        <span
          onClick={(event) => { event.preventDefault(); event.stopPropagation(); toggleFavorite(mission.id); }}
          className={`absolute right-2 top-1 z-20 text-2xl transition hover:scale-150 ${isFavorite ? "text-yellow-400" : "text-white/25 hover:text-yellow-300"}`}
        >★</span>
        <div className="absolute left-2 top-2 text-xs text-cyan-100/50">↕</div>
        <div className="flex h-11 items-center justify-center text-3xl text-white/85 transition group-hover:scale-110">{missionIcon(mission.type)}</div>
        <p className="line-clamp-2 text-center text-sm font-bold leading-tight text-white">{mission.title}</p>
        <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 text-sm font-bold text-white">
          <Image src="/coin.png" alt="Punkte" width={25} height={25} className="rounded-full" />
          <span>+ {mission.reward} Pkt.</span>
        </div>
      </button>
    );
  };

  return (
    <main className="h-screen w-screen overflow-hidden text-white" style={{ background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))` }}>
      <div className="flex h-full">
        <aside className="flex h-full w-[250px] flex-col border-r border-cyan-400/10 bg-[#042f35]/95 px-5 py-6">
          <div className="mb-8 flex justify-center"><Image src="/logo.png" alt="WellFit Logo" width={150} height={150} priority /></div>
          <nav className="space-y-2 text-[14px]"><Link href="/dashboard" className="block text-white/80">Dashboard</Link><div className="font-bold text-orange-400">Missionen</div><div className="text-white/80">Mein KI-Buddy</div><div className="text-white/80">Marktplatz</div><div className="text-white/80">Leaderboard</div><div className="text-white/80">Punkte-Shop</div><div className="text-white/80">Analytics & Stats</div></nav>
          <div className="mt-5 border-t border-cyan-400/10 pt-4"><div className="mb-2 whitespace-nowrap text-base font-bold text-green-400">App aufs Handy laden</div><label className="mb-1 block text-lg">Helligkeit</label><input type="range" min="5" max="100" value={brightness} onChange={(event) => setBrightness(Number(event.target.value))} className="w-full" /><div className="mt-1 text-right text-sm text-white/70">{brightness}%</div></div>
          <div className="mt-auto space-y-2 pt-4 text-[14px]"><Link href="/einstellungen" className="block text-white/80">Einstellungen</Link><Link href="/datenschutz" className="block text-white/80">Datenschutz</Link><Link href="/agb" className="block text-white/80">AGB</Link><Link href="/impressum" className="block text-white/80">Impressum</Link><Link href="/faq" className="block text-white/80">FAQ</Link><Link href="/hilfe" className="block text-white/80">Hilfe</Link><button className="pt-3 text-[14px] font-bold text-red-400">Abmelden</button></div>
        </aside>

        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <div className="mb-4 flex justify-between gap-4">
            <div><h1 className="text-5xl font-extrabold leading-none">Tagesmissionen</h1><p className="mt-1 text-lg text-cyan-100/90">Ziehe Missionen in deine 3 Tagesfelder.</p><p className="mt-1 text-xs text-cyan-100/65">10 balancierte Tagesmissionen · Punkte-System aktiv</p></div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-yellow-400/40 bg-[#073b44] px-4 py-2"><p className="text-sm font-bold text-yellow-300">🔥 Streak 0</p><p className="text-[10px] text-white/55">Best 0</p></div>
              <div className="rounded-2xl border border-cyan-300/30 bg-[#073b44] px-4 py-2"><p className="text-sm font-bold text-cyan-100">🎯 Heute 0/3</p><p className="text-[10px] text-white/55">Noch 3 bis Bonus</p></div>
              <div className="rounded-2xl border border-green-300/30 bg-[#073b44] px-4 py-2"><p className="text-sm font-bold text-green-300">🌈 Vielfalt {diversityCount}/3</p><p className="text-[10px] text-white/55">3 Typen = Bonus</p></div>
            </div>
          </div>

          <div className="mb-4 flex justify-center"><div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">{tabs.map((tab) => tab === "Tagesmissionen" ? <div key={tab} className="relative pb-1 text-base font-semibold text-orange-400">{tab}<span className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full bg-orange-400" /></div> : <Link key={tab} href={tabHref(tab)} className="pb-1 text-base text-white/85 hover:text-white">{tab}</Link>)}</div></div>

          <div className="grid min-h-0 flex-1 grid-cols-[2.15fr_1fr] gap-5 overflow-hidden pb-20">
            <div className="flex min-h-0 flex-col overflow-hidden">
              <section className="shrink-0 rounded-[8px] bg-[#00606b]/75 px-4 py-3"><div className="mb-2 flex items-center justify-between"><h2 className="w-fit border-b border-white/70 text-2xl font-extrabold tracking-wide">Tagesauswahl</h2><span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">Daily 0%</span></div><div className="flex gap-3">{dailySlotIds.map((missionId, index) => { const mission = missions.find((item) => item.id === missionId); const isOver = dragOverSlot === index; return <div key={index} onDragOver={(event) => { event.preventDefault(); setDragOverSlot(index); }} onDragLeave={() => setDragOverSlot(null)} onDrop={(event) => { event.preventDefault(); const droppedId = event.dataTransfer.getData("text/plain"); if (droppedId) assignSlot(index, droppedId); }} className={`flex h-[118px] w-[130px] shrink-0 items-center justify-center rounded-[10px] border-2 border-dashed transition ${isOver ? "scale-105 border-yellow-300 bg-yellow-400/15" : "border-cyan-200/35 bg-[#043c44]/80"}`}>{mission ? <div className="relative"><MissionTile mission={mission} /><button onClick={() => setDailySlotIds((current) => current.map((id, i) => i === index ? null : id))} className="absolute -right-2 -top-2 z-30 rounded-full bg-red-600 px-2 py-1 text-xs font-bold">×</button></div> : <div className="text-center text-sm text-cyan-50/70"><div className="text-3xl">＋</div><p>Mission hier ablegen</p><p className="text-xs text-white/40">Slot {index + 1}</p></div>}</div>; })}</div></section>
              <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                <section className="rounded-[8px] bg-[#00606b]/75 px-4 py-3"><h2 className="mb-2 w-fit border-b border-white/70 text-2xl font-extrabold tracking-wide">Favoriten</h2><div className="flex gap-3 overflow-x-auto pb-2">{favoriteMissions.length ? favoriteMissions.map((mission) => <MissionTile key={`fav-${mission.id}`} mission={mission} />) : <div className="rounded-xl border border-dashed border-white/25 px-5 py-5 text-sm text-white/50">Noch keine Favoriten. Tippe auf einen Stern.</div>}</div></section>
                <section className="mt-4 rounded-[8px] bg-[#00606b]/75 px-4 py-3"><div className="mb-3 flex items-center justify-between"><h2 className="w-fit border-b border-white/70 text-3xl font-extrabold tracking-wide">Missionspool</h2><span className="rounded-full border border-yellow-400/50 bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-200">KI empfiehlt gelb</span></div><div className="grid grid-cols-[repeat(auto-fill,minmax(130px,1fr))] gap-3">{missions.map((mission) => <MissionTile key={mission.id} mission={mission} />)}</div></section>
              </div>
            </div>

            <aside className="h-full overflow-hidden rounded-[6px] bg-[#003d46]/95 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
              <div className="flex h-full flex-col overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <div className="mb-4 flex items-start justify-between"><h2 className="text-2xl font-extrabold tracking-wide">Missionsdetails</h2><button onClick={() => toggleFavorite(selectedMission.id)} className={`text-5xl leading-none transition hover:scale-125 ${favoriteIds.includes(selectedMission.id) ? "text-yellow-400" : "text-white/25 hover:text-yellow-300"}`}>★</button></div>
                <div className="flex justify-center text-6xl text-cyan-300">{missionIcon(selectedMission.type)}</div>
                <h3 className="mt-3 text-center text-3xl font-extrabold leading-tight">{selectedMission.title}</h3>
                <p className="mt-3 text-center text-base leading-tight text-white/90">{selectedMission.description}</p>
                <div className="mt-4"><div className="mb-1 flex justify-between text-sm text-white/75"><span>Fortschritt</span><span className="font-bold">0%</span></div><div className="h-5 overflow-hidden rounded bg-[#062e34]"><div className="h-full rounded bg-cyan-300 transition-all duration-700" style={{ width: "0%" }} /></div></div>
                <div className="mt-3 flex items-center justify-between text-base"><span>Schwierigkeit</span><span className="font-bold">{selectedMission.difficulty}</span></div>
                <div className="mt-2 flex items-center gap-3 text-lg font-bold"><Image src="/coin.png" alt="Punkte" width={34} height={34} className="rounded-full" /><span>+ {currentReward} Punkte</span></div>
                <div className="mt-3 overflow-hidden rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-xs text-white/80"><button onClick={() => setRewardDetailsOpen((open) => !open)} className="flex w-full items-center justify-between p-3 text-left font-bold text-yellow-300"><span>So entstehen die Punkte</span><span>{rewardDetailsOpen ? "−" : "+"}</span></button>{rewardDetailsOpen && <div className="border-t border-yellow-500/20 px-3 pb-3"><div className="mt-2 grid grid-cols-2 gap-1"><span>Basis</span><span className="text-right">{selectedMission.reward}</span><span>Vielfalt</span><span className="text-right">×{diversityMultiplier.toFixed(2)}</span><span>Anti-Farming</span><span className="text-right">×{antiFarmingMultiplier.toFixed(2)}</span></div><p className="mt-2 text-cyan-50/80">Abwechslung erhöht die Punkte. Wiederholung senkt sie.</p></div>}</div>
                <button className="mt-4 w-full rounded-[16px] bg-blue-600 px-4 py-3 text-lg font-extrabold transition hover:bg-blue-700 active:scale-95">Mission starten</button>
              </div>
            </aside>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3"><div className="flex items-center gap-3"><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Letzter Login</p><p className="mt-1 text-sm font-semibold text-white">Heute</p></div><div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Reward Score</p><p className="mt-1 text-lg font-bold text-white">{currentReward}</p></div><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Live Schritte</p><p className="mt-1 text-sm font-semibold text-white/70">0</p></div></div><div className="flex items-center gap-3 text-xl text-white/80"><span>f</span><span>𝕏</span><span>in</span></div></div>
        </section>
      </div>
    </main>
  );
}
