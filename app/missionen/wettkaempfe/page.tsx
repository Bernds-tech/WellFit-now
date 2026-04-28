"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type CheckpointType = "Mathe" | "Fitness" | "Avatar" | "Rätsel" | "Sprint";

type Checkpoint = {
  id: number;
  title: string;
  type: CheckpointType;
  mayor: string;
  mayorScore: string;
  challengers: number;
  entryPreview: string;
  status: "Offen" | "Umkämpft" | "Geschützt";
  position: { top: string; left: string };
  icon: string;
  description: string;
};

const checkpoints: Checkpoint[] = [
  { id: 1, title: "Rathaus-Checkpoint", type: "Mathe", mayor: "FlammiMax", mayorScore: "934 Punkte", challengers: 18, entryPreview: "10 interne Punkte", status: "Umkämpft", position: { top: "27%", left: "24%" }, icon: "🧠", description: "Mathe-Duell am Checkpoint. Wer schneller richtig löst, kann Bürgermeister werden." },
  { id: 2, title: "Park-Sprint Gate", type: "Sprint", mayor: "LunaRun", mayorScore: "00:42", challengers: 11, entryPreview: "Proof nötig", status: "Offen", position: { top: "58%", left: "34%" }, icon: "🏃", description: "Kurzer Sprint-Checkpoint mit späterer GPS-/Evidence-Prüfung." },
  { id: 3, title: "Burg-Arena", type: "Avatar", mayor: "Drako", mayorScore: "Level 12", challengers: 7, entryPreview: "Arena-Pot später", status: "Geschützt", position: { top: "36%", left: "62%" }, icon: "⚔️", description: "Avatar-gegen-Avatar-Arena. Sieger und Pot dürfen später nur serverseitig entschieden werden." },
  { id: 4, title: "Wissensbrücke", type: "Rätsel", mayor: "QuizMira", mayorScore: "12 Siege", challengers: 21, entryPreview: "ohne Auszahlung", status: "Umkämpft", position: { top: "66%", left: "72%" }, icon: "🧩", description: "Rätsel-Checkpoint für Nutzerduelle und Zuschauer-Modus." },
  { id: 5, title: "Fitness-Hof", type: "Fitness", mayor: "PushUpBen", mayorScore: "41 Reps", challengers: 14, entryPreview: "Kamera-Proof später", status: "Offen", position: { top: "18%", left: "78%" }, icon: "💪", description: "Fitness-Duell mit späterer KI-/Kamera-Validierung." },
];

const tabs = [
  { label: "Tagesmissionen", href: "/missionen/tagesmissionen" },
  { label: "Wochenmissionen", href: "/missionen/wochenmissionen" },
  { label: "Abenteuer", href: "/missionen/abenteuer" },
  { label: "Challenge", href: "/missionen/challenge" },
  { label: "Wettkämpfe", href: "/missionen/wettkaempfe" },
  { label: "Favoriten", href: "/missionen/favoriten" },
  { label: "History", href: "/missionen/history" },
];

export default function WettkaempfePage() {
  const [brightness, setBrightness] = useState(100);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState(1);
  const selectedCheckpoint = useMemo(() => checkpoints.find((checkpoint) => checkpoint.id === selectedCheckpointId) ?? checkpoints[0], [selectedCheckpointId]);

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
          <div className="mb-4 flex items-start justify-between gap-4"><div><h1 className="text-5xl font-extrabold leading-none">Wettkämpfe</h1><p className="mt-1 text-lg text-cyan-100/90">Weltkarte mit Checkpoints, Bürgermeister und späteren PvP-/Avatar-Duellen.</p></div><div className="rounded-[18px] border border-yellow-300/40 bg-gradient-to-r from-[#052f36] via-[#0d6872] to-[#ff8a00] px-7 py-4 text-center shadow-[0_10px_28px_rgba(0,0,0,0.24)]"><p className="text-[10px] font-semibold tracking-[0.3em] text-yellow-200">CHECKPOINT-MACHT</p><p className="mt-1 text-2xl font-extrabold text-white">Bürgermeister-System</p></div></div>
          <div className="mb-4 flex justify-center"><div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">{tabs.map((tab) => tab.label === "Wettkämpfe" ? <div key={tab.label} className="relative pb-1 text-base font-semibold text-orange-400">{tab.label}<span className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full bg-orange-400" /></div> : <Link key={tab.label} href={tab.href} className="pb-1 text-base text-white/85 hover:text-white">{tab.label}</Link>)}</div></div>

          <div className="grid min-h-0 flex-1 grid-cols-[2fr_0.95fr] gap-4 overflow-hidden pb-20">
            <div className="relative min-h-0 overflow-hidden rounded-[22px] border border-cyan-300/10 bg-[#0a5564]/55">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_35%,rgba(93,221,255,0.22),transparent_28%),linear-gradient(135deg,rgba(9,75,88,0.9),rgba(3,33,41,0.98))]" />
              <div className="absolute inset-0 opacity-45" style={{ backgroundImage: "linear-gradient(30deg, transparent 46%, rgba(255,255,255,0.22) 48%, rgba(255,255,255,0.22) 50%, transparent 52%), linear-gradient(120deg, transparent 44%, rgba(255,255,255,0.16) 46%, rgba(255,255,255,0.16) 48%, transparent 51%)", backgroundSize: "160px 120px" }} />
              <div className="absolute left-5 top-5 z-10 rounded-xl bg-[#042f35]/85 px-4 py-3 shadow-lg backdrop-blur-sm"><p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">Live-Map</p><p className="mt-1 text-sm text-white/80">Checkpoints · Bürgermeister · Herausforderer</p></div>
              {checkpoints.map((checkpoint) => (
                <button
                  key={checkpoint.id}
                  onClick={() => setSelectedCheckpointId(checkpoint.id)}
                  className={`absolute z-20 flex h-14 w-14 items-center justify-center rounded-full border-2 text-2xl shadow-[0_0_26px_rgba(255,255,255,0.35)] transition ${selectedCheckpoint.id === checkpoint.id ? "scale-110 border-yellow-300 bg-orange-500" : "border-cyan-200/70 bg-cyan-400/30 hover:scale-105"}`}
                  style={{ top: checkpoint.position.top, left: checkpoint.position.left }}
                  title={`${checkpoint.title} · Bürgermeister: ${checkpoint.mayor}`}
                >
                  {checkpoint.icon}
                </button>
              ))}
              {checkpoints.map((checkpoint) => (
                <div key={`label-${checkpoint.id}`} className="absolute z-10 rounded-lg bg-[#082f39]/90 px-3 py-2 text-xs font-semibold text-white/90 shadow-[0_0_14px_rgba(0,0,0,0.25)]" style={{ top: `calc(${checkpoint.position.top} + 54px)`, left: checkpoint.position.left }}>
                  {checkpoint.title}<br /><span className="text-yellow-300">👑 {checkpoint.mayor}</span>
                </div>
              ))}
            </div>

            <div className="min-h-0 overflow-y-auto rounded-[22px] border border-cyan-300/10 bg-[#053841]/95 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
              <div className="mb-4 flex items-start justify-between gap-3"><div className="rounded-lg bg-cyan-500/20 px-3 py-2 text-sm font-bold text-cyan-300">{selectedCheckpoint.type}</div><div className="rounded-lg bg-yellow-500/15 px-3 py-2 text-sm font-bold text-yellow-300">{selectedCheckpoint.status}</div></div>
              <div className="mb-4 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/20 text-3xl">{selectedCheckpoint.icon}</div><h2 className="text-2xl font-bold text-white">{selectedCheckpoint.title}</h2></div>
              <p className="mb-4 text-sm leading-relaxed text-white/85">{selectedCheckpoint.description}</p>
              <div className="space-y-3 rounded-[18px] border border-yellow-500/30 bg-yellow-500/10 px-4 py-4 text-sm text-white/85"><p>👑 Bürgermeister: <span className="font-bold text-yellow-300">{selectedCheckpoint.mayor}</span></p><p>🏆 Bestwert: {selectedCheckpoint.mayorScore}</p><p>⚔ Herausforderer heute: {selectedCheckpoint.challengers}</p><p>🪙 Einsatz-Vorschau: {selectedCheckpoint.entryPreview}</p></div>
              <button className="mt-5 w-full rounded-xl bg-cyan-500 px-4 py-3 text-base font-bold text-black transition hover:bg-cyan-400">Checkpoint ansehen</button>
              <p className="mt-3 text-xs leading-relaxed text-white/55">Hinweis: Bürgermeister, Sieger, Einsätze und Reward-Ledger werden später serverseitig autorisiert. Diese Karte ist UI-/Gameplay-Vorschau.</p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3"><div className="flex items-center gap-3"><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Checkpoints</p><p className="mt-1 text-sm font-semibold text-white">{checkpoints.length} sichtbar</p></div><div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Umkämpft</p><p className="mt-1 text-lg font-bold text-white">{checkpoints.filter((checkpoint) => checkpoint.status === "Umkämpft").length}</p></div><div className="min-w-[170px] rounded-xl border border-yellow-500/40 bg-[#0a3d46] px-3 py-2 text-center"><p className="text-sm font-semibold text-yellow-400">⚠ Server-Entscheidung später</p></div></div><div className="flex items-center gap-3 text-xl text-white/80"><span>f</span><span>𝕏</span><span>in</span></div></div>
        </section>
      </div>
    </main>
  );
}
