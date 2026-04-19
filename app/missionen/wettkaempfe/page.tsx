"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@/types/user";

type ArenaTab = "Checkpoint-Duelle" | "Wochen-Challenges" | "Avatar-Arena";
type Competition = { id: number; title: string; type: string; description: string; entryFee: number; reward: number; playersOnline: number; duration: string; difficulty: "Leicht" | "Mittel" | "Schwer"; icon: string; checkpoint?: string; };

type AvatarBattle = { id: number; title: string; arena: string; description: string; entryFee: number; reward: number; fighterA: string; fighterB: string; status: string; icon: string; };

const checkpointDuels: Competition[] = [
  { id: 1, title: "Mathe-Checkpoint", type: "1 vs 1", description: "Zwei Nutzer erreichen denselben Checkpoint. Wer mehrere Matheaufgaben schneller löst, gewinnt den Pot.", entryFee: 10, reward: 36, playersOnline: 18, duration: "60 Sek.", difficulty: "Mittel", icon: "🧠", checkpoint: "AR-Checkpoint" },
  { id: 2, title: "Buchstabier-Duell", type: "1 vs 1", description: "Am Checkpoint erscheint ein Wort. Wer es schneller und richtig buchstabiert, gewinnt.", entryFee: 8, reward: 28, playersOnline: 12, duration: "45 Sek.", difficulty: "Leicht", icon: "🔤", checkpoint: "Lern-Checkpoint" },
  { id: 3, title: "Rätsel-Sprint", type: "1 vs 1 / Gruppe", description: "Mehrere Mini-Rätsel hintereinander. Geschwindigkeit und richtige Antworten zählen.", entryFee: 12, reward: 44, playersOnline: 24, duration: "90 Sek.", difficulty: "Schwer", icon: "🧩", checkpoint: "Quest-Checkpoint" },
];

const weeklyDuels: Competition[] = [
  { id: 11, title: "Wer schafft die Wochenaufgabe zuerst?", type: "Wochenrennen", description: "Zwei oder mehr Nutzer treten an: Wer die Wochenmission schneller erfüllt, gewinnt den Pot.", entryFee: 20, reward: 72, playersOnline: 31, duration: "7 Tage", difficulty: "Mittel", icon: "🏁" },
  { id: 12, title: "Schritte-König der Woche", type: "Leaderboard-Duell", description: "Wer in einer Woche mehr gültige Schritte sammelt, gewinnt. Später mit Anti-Cheat und Health-Daten.", entryFee: 15, reward: 54, playersOnline: 46, duration: "7 Tage", difficulty: "Mittel", icon: "👟" },
];

const avatarBattles: AvatarBattle[] = [
  { id: 21, title: "Schwertkampf der Ritter", arena: "Burg-Arena", description: "Zwei Avatare treten mit Level, Energie, Ausrüstung und Fähigkeiten gegeneinander an.", entryFee: 18, reward: 64, fighterA: "Flammi", fighterB: "Drako", status: "Bereit", icon: "⚔️" },
  { id: 22, title: "Drachenjagd Duell", arena: "Feuergrube", description: "Avatar-Fähigkeiten, Timing und Ausdauer entscheiden über den Sieg.", entryFee: 20, reward: 72, fighterA: "Auron", fighterB: "Mystra", status: "Live", icon: "🐉" },
  { id: 23, title: "Zauberduell", arena: "Kristallhalle", description: "Magische Spezialangriffe, Verteidigung und Buddy-Level bestimmen den Kampfverlauf.", entryFee: 14, reward: 50, fighterA: "Lunara", fighterB: "Nox", status: "Bereit", icon: "✨" },
];

const calculateEconomy = (entryFee: number) => { const jackpotShare = Math.round(entryFee * 0.1); const burnShare = Math.max(1, Math.round(entryFee * 0.05)); const potShare = entryFee - jackpotShare - burnShare; return { jackpotShare, burnShare, potShare }; };

export default function WettkaempfePage() {
  const [brightness, setBrightness] = useState(100);
  const [activeArenaTab, setActiveArenaTab] = useState<ArenaTab>("Checkpoint-Duelle");
  const [selectedId, setSelectedId] = useState<number>(1);
  const [jackpot, setJackpot] = useState(2480);
  const [message, setMessage] = useState("Bereit für den nächsten Wettkampf?");
  const [user, setUser] = useState<User | null>(null);
  const [buddyLevel] = useState(1);

  useEffect(() => { const savedUser = localStorage.getItem("wellfit-user"); const savedJackpot = localStorage.getItem("wellfit-jackpot"); if (savedUser) { try { setUser(JSON.parse(savedUser)); } catch (error) { console.error("Fehler beim Laden des Users", error); } } if (savedJackpot) { try { setJackpot(JSON.parse(savedJackpot)); } catch (error) { console.error("Fehler beim Laden des Jackpots", error); } } }, []);
  useEffect(() => { setSelectedId(activeArenaTab === "Checkpoint-Duelle" ? 1 : activeArenaTab === "Wochen-Challenges" ? 11 : 21); }, [activeArenaTab]);

  const activeList = useMemo(() => activeArenaTab === "Checkpoint-Duelle" ? checkpointDuels : activeArenaTab === "Wochen-Challenges" ? weeklyDuels : avatarBattles, [activeArenaTab]);
  const selectedItem = useMemo(() => activeList.find((item) => item.id === selectedId) ?? activeList[0], [activeList, selectedId]);

  const commitEntry = (entryFee: number, label: string) => {
    if (!user) { setMessage("Bitte zuerst registrieren oder einloggen."); return; }
    const currentPoints = user.points ?? 0;
    if (currentPoints < entryFee) { setMessage(`Nicht genug Punkte. Einsatz: ${entryFee} WFT.`); return; }
    const economy = calculateEconomy(entryFee);
    const updatedUser: User = { ...user, points: currentPoints - entryFee };
    const newJackpot = jackpot + economy.jackpotShare;
    setUser(updatedUser); setJackpot(newJackpot);
    setMessage(`${label} gestartet. Einsatz ${entryFee} WFT · Jackpot +${economy.jackpotShare} · Light Burn ${economy.burnShare}`);
    localStorage.setItem("wellfit-user", JSON.stringify(updatedUser));
    localStorage.setItem("wellfit-jackpot", JSON.stringify(newJackpot));
  };

  const entryFee = "entryFee" in selectedItem ? selectedItem.entryFee : 0;
  const economy = calculateEconomy(entryFee);

  return (
    <main className="h-screen w-screen overflow-hidden text-white" style={{ background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))` }}>
      <div className="flex h-full">
        <aside className="flex h-full w-[250px] flex-col border-r border-cyan-400/10 bg-[#042f35]/95 px-5 py-6">
          <div className="mb-8 flex justify-center"><Image src="/logo.png" alt="WellFit Logo" width={150} height={150} className="h-auto w-[150px] object-contain" priority /></div>
          <nav className="space-y-2 text-[14px]"><Link href="/dashboard" className="block text-white/80">Dashboard</Link><div className="font-bold text-orange-400">Missionen</div><div className="text-white/80">Mein KI-Buddy</div><div className="text-white/80">Marktplatz</div><div className="text-white/80">Leaderboard</div><div className="text-white/80">Punkte-Shop</div><div className="text-white/80">Analytics & Stats</div></nav>
          <div className="mt-5 border-t border-cyan-400/10 pt-4"><div className="mb-2 whitespace-nowrap text-base font-bold text-green-400">App aufs Handy laden</div><label className="mb-1 block text-lg">Helligkeit</label><input type="range" min="5" max="100" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} className="w-full" /><div className="mt-1 text-right text-sm text-white/70">{brightness}%</div></div>
          <div className="mt-auto pt-4"><div className="space-y-2 text-[14px]"><Link href="/einstellungen" className="block text-white/80">Einstellungen</Link><Link href="/datenschutz" className="block text-white/80">Datenschutz</Link><Link href="/agb" className="block text-white/80">AGB</Link><Link href="/impressum" className="block text-white/80">Impressum</Link><Link href="/faq" className="block text-white/80">FAQ</Link><Link href="/hilfe" className="block text-white/80">Hilfe</Link></div><div className="mt-4 border-t border-cyan-400/10 pt-3"><button className="text-[14px] font-bold text-red-400 hover:text-red-300">Abmelden</button></div></div>
        </aside>

        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <div className="mb-4 flex items-start justify-between gap-4"><div><h1 className="text-5xl font-extrabold leading-none">Wettkämpfe</h1><p className="mt-1 text-lg text-cyan-100/90">{message}</p></div><div className="relative h-[80px] w-[360px] overflow-hidden rounded-[18px]"><Image src="/jackpot.png" alt="Jackpot Banner" fill className="object-cover" priority /><div className="absolute inset-0 flex items-center justify-center"><div className="text-center"><p className="text-[10px] font-semibold tracking-[0.3em] text-yellow-300/90">JACKPOT</p><p className="mt-1 text-3xl font-extrabold text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.45)]">{jackpot.toLocaleString("de-DE")} WFT</p></div></div></div><div className="flex items-center gap-2"><button className="rounded-full border border-cyan-300/20 bg-[#0a6b78]/20 px-4 py-2 text-sm text-white/90">Synchron</button><button className="rounded-[16px] bg-orange-500 px-5 py-3 text-sm font-bold">Tracker starten</button><div className="rounded-full bg-[#073b44] px-4 py-2 text-sm">Flammi LVL {buddyLevel}</div></div></div>
          <div className="mb-4 flex justify-center"><div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm"><Link href="/missionen/tagesmissionen" className="pb-1 text-base text-white/85 hover:text-white">Tagesmissionen</Link><Link href="/missionen/wochenmissionen" className="pb-1 text-base text-white/85 hover:text-white">Wochenmissionen</Link><Link href="/missionen/abenteuer" className="pb-1 text-base text-white/85 hover:text-white">Abenteuer</Link><Link href="/missionen/challenge" className="pb-1 text-base text-white/85 hover:text-white">Challenge</Link><div className="relative pb-1 text-base font-semibold text-orange-400">Wettkämpfe<span className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full bg-orange-400" /></div><Link href="/missionen/favoriten" className="pb-1 text-base text-white/85 hover:text-white">Favoriten</Link><Link href="/missionen/history" className="pb-1 text-base text-white/85 hover:text-white">History</Link></div></div>
          <div className="mb-4 flex gap-2">{(["Checkpoint-Duelle", "Wochen-Challenges", "Avatar-Arena"] as ArenaTab[]).map((tab) => (<button key={tab} onClick={() => setActiveArenaTab(tab)} className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${activeArenaTab === tab ? "border-cyan-300 bg-cyan-300 text-black" : "border-white/15 bg-[#053841]/85 text-white/80 hover:bg-[#07505c]"}`}>{tab}</button>))}</div>
          <div className="grid min-h-0 flex-1 grid-cols-[1.55fr_1fr] gap-4 overflow-hidden pb-20">
            <div className="min-h-0 space-y-4 overflow-y-auto pr-3 pb-5"><div className="rounded-[20px] border border-yellow-400/25 bg-[#053841]/90 p-4"><div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.25em] text-yellow-400/80">Arena Modus</p><h2 className="mt-1 text-2xl font-bold text-white">{activeArenaTab}</h2><p className="mt-1 text-sm text-white/75">Nutzer treten bei Checkpoints, Wochenaufgaben oder mit Avataren gegeneinander an.</p></div><div className="rounded-2xl border border-yellow-400/30 bg-yellow-500/10 px-4 py-3 text-center"><p className="text-xs uppercase text-yellow-300/80">Jackpot</p><p className="mt-1 text-2xl font-extrabold text-yellow-400">{jackpot.toLocaleString("de-DE")}</p><p className="text-sm font-semibold text-yellow-300">WFT</p></div></div></div><div className="grid grid-cols-1 gap-3 xl:grid-cols-2">{activeList.map((item) => (<div key={item.id} onClick={() => setSelectedId(item.id)} className={`cursor-pointer rounded-[20px] border p-4 transition ${selectedId === item.id ? "border-yellow-400 bg-[#07505c]" : "border-cyan-300/10 bg-[#053841]/90 hover:bg-[#07505c]"}`}><div className="mb-3 flex items-start justify-between"><div className="text-3xl">{item.icon}</div><span className="rounded-lg bg-cyan-400/15 px-3 py-1 text-xs text-cyan-300">{"type" in item ? item.type : item.status}</span></div><p className="text-lg font-bold">{item.title}</p><p className="mt-2 text-sm text-white/70">{item.description}</p><div className="mt-3 grid grid-cols-2 gap-2 text-xs text-white/70"><p>🪙 Einsatz: {item.entryFee} WFT</p><p>🎁 Pot: {item.reward} WFT</p>{"playersOnline" in item && <p>👥 Online: {item.playersOnline}</p>}{"duration" in item && <p>⏱ {item.duration}</p>}{"arena" in item && <p>🏟 {item.arena}</p>}{"fighterA" in item && <p>⚔ {item.fighterA} vs {item.fighterB}</p>}</div></div>))}</div></div>
            <div className="min-h-0 overflow-y-auto rounded-[24px] bg-[#053841]/90 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]"><p className="text-xs uppercase tracking-[0.25em] text-cyan-300/80">{activeArenaTab}</p><h2 className="mt-2 text-2xl font-bold text-white">{selectedItem.title}</h2><div className="mt-4 flex justify-center text-4xl">{selectedItem.icon}</div><div className="mt-4 rounded-lg border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-2 text-center text-sm font-semibold text-fuchsia-300">{"type" in selectedItem ? selectedItem.type : `${selectedItem.fighterA} vs ${selectedItem.fighterB}`}</div><p className="mt-4 text-sm leading-relaxed text-white/80">{selectedItem.description}</p><div className="mt-4 space-y-2 text-sm text-white/80"><p>🪙 Einsatz: {selectedItem.entryFee} WFT</p><p>🏆 Gewinn-Pot: {selectedItem.reward} WFT</p><p>💰 Jackpot-Anteil: {economy.jackpotShare} WFT (10%)</p><p>🔥 Light Burn: {economy.burnShare} WFT (1–10%)</p><p>🎮 Kampf-/Duel-Pot: {economy.potShare} WFT</p></div><div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3"><div className="flex items-center justify-between text-base"><span className="font-semibold text-white/90">Jackpot aktuell</span><span className="font-bold text-yellow-400">{jackpot.toLocaleString("de-DE")} WFT</span></div></div><button onClick={() => commitEntry(selectedItem.entryFee, selectedItem.title)} className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3 text-base font-bold text-white transition hover:bg-orange-600">Einsatz tätigen & starten</button><p className="mt-3 text-xs text-white/55">Hinweis: Token-/Burn-Logik ist aktuell MVP-Simulation und muss später serverseitig, rechtlich und technisch abgesichert werden.</p></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3"><div className="flex items-center gap-3"><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Letzter Login: Heute 9:43</p><p className="mt-1 text-sm font-semibold text-white">3 WFT erhalten</p></div><div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">WFT-Punkte</p><p className="mt-1 text-lg font-bold text-white">{user?.points ?? 0}</p></div><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Gehortet: 0.00 WFT</p><button className="mt-1 w-full rounded-md bg-blue-700/80 px-3 py-1 text-xs font-semibold text-white/70">Abholen</button></div><div className="min-w-[170px] rounded-xl border border-yellow-500/40 bg-[#0a3d46] px-3 py-2 text-center"><p className="text-sm font-semibold text-yellow-400">⚠ Server-Event starten</p></div></div><div className="flex items-center gap-3 text-xl text-white/80"><span>f</span><span>𝕏</span><span>in</span></div></div>
        </section>
      </div>
    </main>
  );
}
