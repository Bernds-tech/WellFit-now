"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useWellFitBrightness } from "@/app/hooks/useWellFitBrightness";
import GoogleCompetitionMap from "./GoogleCompetitionMap";

type CheckpointType = "Mathe" | "Fitness" | "Avatar" | "Rätsel" | "Sprint";
type DuelType = "Nutzer gegen Nutzer" | "Avatar gegen Avatar" | "Gruppen-Duell" | "Zeitrennen";
type SpectatorStatus = "Zuschauen offen" | "Live bald" | "Nur Freunde";

type Checkpoint = {
  id: number;
  title: string;
  type: CheckpointType;
  duelType: DuelType;
  mayor: string;
  mayorScore: string;
  challengers: number;
  entryPreview: string;
  spectatorStatus: SpectatorStatus;
  status: "Offen" | "Umkämpft" | "Geschützt";
  lat: number;
  lng: number;
  icon: string;
  description: string;
  nextWindow: string;
  serverPath: string;
  evidenceNeeded: string[];
};

const checkpoints: Checkpoint[] = [
  { id: 1, title: "Rathaus-Checkpoint", type: "Mathe", duelType: "Nutzer gegen Nutzer", mayor: "FlammiMax", mayorScore: "934 Punkte", challengers: 18, entryPreview: "10 interne Punkte", spectatorStatus: "Zuschauen offen", status: "Umkämpft", lat: 48.210033, lng: 16.363449, icon: "🧠", description: "Mathe-Duell am sicheren Checkpoint. Wer schneller richtig löst, kann später Bürgermeister werden.", nextWindow: "Heute · 18:00–20:00", serverPath: "Matchmaking -> Evidence -> Server-Sieger -> Ledger später", evidenceNeeded: ["Checkpoint-Nähe", "Antwortzeit", "Richtige Antworten", "Cooldown-Prüfung"] },
  { id: 2, title: "Park-Sprint Gate", type: "Sprint", duelType: "Zeitrennen", mayor: "LunaRun", mayorScore: "00:42", challengers: 11, entryPreview: "Proof nötig", spectatorStatus: "Live bald", status: "Offen", lat: 48.204994, lng: 16.386607, icon: "🏃", description: "Kurzer Sprint-Checkpoint mit späterer GPS-/Evidence-Prüfung an einem sicheren Bewegungsort.", nextWindow: "Morgen · 07:00–09:00", serverPath: "GPS/Time Proof -> Plausibilität -> Server-Ranking", evidenceNeeded: ["GPS-Route", "Zeitfenster", "Bewegungsdaten", "Anti-Cheat-Prüfung"] },
  { id: 3, title: "Burg-Arena", type: "Avatar", duelType: "Avatar gegen Avatar", mayor: "Drako", mayorScore: "Level 12", challengers: 7, entryPreview: "Arena-Punkte später", spectatorStatus: "Nur Freunde", status: "Geschützt", lat: 48.205914, lng: 16.357956, icon: "⚔️", description: "Avatar-gegen-Avatar-Arena. Sieger und interne Punkte dürfen später nur serverseitig entschieden werden.", nextWindow: "Heute · 21:00", serverPath: "Avatar-State -> Fairness -> Server-Kampfentscheidung", evidenceNeeded: ["Avatar-Level", "Ausrüstung", "Energie", "Fairness-Matchmaking"] },
  { id: 4, title: "Wissensbrücke", type: "Rätsel", duelType: "Gruppen-Duell", mayor: "QuizMira", mayorScore: "12 Siege", challengers: 21, entryPreview: "ohne Auszahlung", spectatorStatus: "Zuschauen offen", status: "Umkämpft", lat: 48.215115, lng: 16.396277, icon: "🧩", description: "Rätsel-Checkpoint für Nutzerduelle und Zuschauer-Modus.", nextWindow: "Samstag · Community-Runde", serverPath: "Team-Join -> Rätsel-Evidence -> Server-Auswertung", evidenceNeeded: ["Team-Zuordnung", "Antworten", "Zeit", "Mehrfachversuch-Sperre"] },
  { id: 5, title: "Fitness-Hof", type: "Fitness", duelType: "Nutzer gegen Nutzer", mayor: "PushUpBen", mayorScore: "41 Reps", challengers: 14, entryPreview: "Kamera-Proof später", spectatorStatus: "Live bald", status: "Offen", lat: 48.198123, lng: 16.371512, icon: "💪", description: "Fitness-Duell mit späterer KI-/Kamera-Validierung.", nextWindow: "Heute · flexibel", serverPath: "Kamera-Proof -> Pose-Validation -> Server-Review", evidenceNeeded: ["Pose-Proof", "Wiederholungen", "Qualität", "Cooldown"] },
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

const statusClass: Record<Checkpoint["status"], string> = { Offen: "border-cyan-300/30 bg-cyan-400/15 text-cyan-100", Umkämpft: "border-orange-300/40 bg-orange-400/15 text-orange-100", Geschützt: "border-yellow-300/40 bg-yellow-400/15 text-yellow-100" };

export default function WettkaempfePage() {
  const [brightness, setBrightness] = useWellFitBrightness(100);
  const [selectedCheckpointId, setSelectedCheckpointId] = useState(1);
  const [message, setMessage] = useState("Wähle einen sicheren Checkpoint auf der Karte.");
  const selectedCheckpoint = useMemo(() => checkpoints.find((checkpoint) => checkpoint.id === selectedCheckpointId) ?? checkpoints[0], [selectedCheckpointId]);
  const selectCheckpoint = (checkpointId: number) => { const checkpoint = checkpoints.find((item) => item.id === checkpointId); setSelectedCheckpointId(checkpointId); if (checkpoint) setMessage(`${checkpoint.title} ausgewählt. Bürgermeister: ${checkpoint.mayor}.`); };
  const handlePreviewAction = (action: string) => { setMessage(`${action}: später über Serverpfad. Aktuell nur sichere UI-Vorschau für ${selectedCheckpoint.title}.`); };

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
          <div className="mb-4 flex items-start justify-between gap-4"><div><h1 className="text-5xl font-extrabold leading-none">Wettkämpfe</h1><p className="mt-1 text-lg text-cyan-100/90">Google Maps mit sicheren Checkpoints, Bürgermeister und späteren PvP-/Avatar-Duellen.</p><p className="mt-2 text-sm font-semibold text-cyan-100/75">{message}</p></div><div className="rounded-[18px] border border-yellow-300/40 bg-gradient-to-r from-[#052f36] via-[#0d6872] to-[#ff8a00] px-7 py-4 text-center shadow-[0_10px_28px_rgba(0,0,0,0.24)]"><p className="text-[10px] font-semibold tracking-[0.3em] text-yellow-200">CHECKPOINT-MACHT</p><p className="mt-1 text-2xl font-extrabold text-white">Bürgermeister-System</p></div></div>
          <div className="mb-4 flex justify-center"><div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">{tabs.map((tab) => tab.label === "Wettkämpfe" ? <div key={tab.label} className="relative pb-1 text-base font-semibold text-orange-400">{tab.label}<span className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full bg-orange-400" /></div> : <Link key={tab.label} href={tab.href} className="pb-1 text-base text-white/85 hover:text-white">{tab.label}</Link>)}</div></div>
          <div className="grid min-h-0 flex-1 grid-cols-[2fr_0.95fr] gap-4 overflow-hidden pb-20">
            <GoogleCompetitionMap checkpoints={checkpoints} selectedCheckpointId={selectedCheckpointId} onSelectCheckpoint={selectCheckpoint} />
            <div className="min-h-0 overflow-y-auto rounded-[22px] border border-cyan-300/10 bg-[#053841]/95 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
              <div className="mb-4 flex items-start justify-between gap-3"><div className="rounded-lg bg-cyan-500/20 px-3 py-2 text-sm font-bold text-cyan-300">{selectedCheckpoint.type}</div><div className={`rounded-lg border px-3 py-2 text-sm font-bold ${statusClass[selectedCheckpoint.status]}`}>{selectedCheckpoint.status}</div></div>
              <div className="mb-4 flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/20 text-3xl">{selectedCheckpoint.icon}</div><h2 className="text-2xl font-bold text-white">{selectedCheckpoint.title}</h2></div>
              <p className="mb-4 text-sm leading-relaxed text-white/85">{selectedCheckpoint.description}</p>
              <div className="mb-4 rounded-[18px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-3"><p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Checkpoint-Sicherheit</p><p className="mt-2 text-xs leading-relaxed text-white/65">Wettkampf-Checkpoints sollen später nur an sicheren realen Orten liegen. Zielradius: ca. 20 Meter. Keine Straßen, Autobahnen, Gleise, Wasserflächen oder private Orte ohne Freigabe.</p></div>
              <div className="space-y-3 rounded-[18px] border border-yellow-500/30 bg-yellow-500/10 px-4 py-4 text-sm text-white/85"><p>👑 Bürgermeister: <span className="font-bold text-yellow-300">{selectedCheckpoint.mayor}</span></p><p>🏆 Bestwert: {selectedCheckpoint.mayorScore}</p><p>⚔ Duelltyp: {selectedCheckpoint.duelType}</p><p>👀 Zuschauerstatus: {selectedCheckpoint.spectatorStatus}</p><p>📅 Zeitfenster: {selectedCheckpoint.nextWindow}</p><p>🪙 Teilnahme-Vorschau: {selectedCheckpoint.entryPreview}</p><p>👥 Herausforderer heute: {selectedCheckpoint.challengers}</p></div>
              <div className="mt-4 rounded-[18px] border border-cyan-300/20 bg-cyan-300/10 px-4 py-4"><p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">Evidence</p><div className="mt-3 flex flex-wrap gap-2">{selectedCheckpoint.evidenceNeeded.map((item) => <span key={item} className="rounded-full border border-white/10 bg-[#082c39] px-3 py-1 text-xs font-semibold text-white/80">{item}</span>)}</div></div>
              <div className="mt-4 rounded-[18px] border border-white/10 bg-[#082c39] px-4 py-3"><p className="text-xs font-black uppercase tracking-[0.25em] text-white/45">Serverpfad später</p><p className="mt-2 text-sm text-white/80">{selectedCheckpoint.serverPath}</p></div>
              <div className="mt-5 grid grid-cols-2 gap-3"><button onClick={() => handlePreviewAction("Herausfordern")} className="rounded-xl bg-cyan-500 px-4 py-3 text-sm font-bold text-black transition hover:bg-cyan-400">Herausfordern</button><button onClick={() => handlePreviewAction("Zuschauen")} className="rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-sm font-bold text-cyan-100 transition hover:bg-cyan-300/15">Zuschauen</button></div>
              <p className="mt-3 text-xs leading-relaxed text-white/55">Hinweis: Bürgermeister, Sieger, Teilnahme-Punkte und Reward-Ledger werden später serverseitig autorisiert. Keine echten Wetten, keine Token, keine NFTs, keine Auszahlungen.</p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3"><div className="flex items-center gap-3"><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Checkpoints</p><p className="mt-1 text-sm font-semibold text-white">{checkpoints.length} sichtbar</p></div><div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Umkämpft</p><p className="mt-1 text-lg font-bold text-white">{checkpoints.filter((checkpoint) => checkpoint.status === "Umkämpft").length}</p></div><div className="min-w-[170px] rounded-xl border border-yellow-500/40 bg-[#0a3d46] px-3 py-2 text-center"><p className="text-sm font-semibold text-yellow-400">⚠ Server-Entscheidung später</p></div></div><div className="flex items-center gap-3 text-xl text-white/80"><span>f</span><span>𝕏</span><span>in</span></div></div>
        </section>
      </div>
    </main>
  );
}
