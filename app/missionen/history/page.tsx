"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";

type HistoryStatus = "geschafft" | "nicht geschafft" | "in Prüfung";
type HistoryEntry = { id: string; title: string; category: "Tagesmissionen" | "Wochenmissionen" | "Abenteuer" | "Challenge" | "Wettkämpfe" | string; rewardLabel: string; completedAt: string; icon: string; pointsDelta?: number; status?: HistoryStatus; };

const toDateString = (value: any) => {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  return new Date(value).toISOString();
};

export default function HistoryPage() {
  const [brightness, setBrightness] = useState(100);
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [historyMessage, setHistoryMessage] = useState("History wird live aus Firestore geladen...");
  const [storageMode, setStorageMode] = useState("Firestore Live");
  const [statusFilter, setStatusFilter] = useState<"Alle" | HistoryStatus>("Alle");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) { setHistoryEntries([]); setHistoryMessage("Bitte einloggen, um deine Mission-History zu sehen."); setStorageMode("Nicht eingeloggt"); return; }
      const historyQuery = query(collection(db, "history"), where("userId", "==", firebaseUser.uid), orderBy("createdAt", "desc"));
      const unsubscribeHistory = onSnapshot(historyQuery, (snapshot) => {
        const entries = snapshot.docs.map((docSnap) => { const data = docSnap.data(); return { id: docSnap.id, title: String(data.title ?? "Mission"), category: String(data.category ?? "Mission"), rewardLabel: String(data.rewardLabel ?? `+${data.pointsDelta ?? 0} Punkte`), completedAt: toDateString(data.createdAt), icon: String(data.icon ?? "✅"), pointsDelta: typeof data.pointsDelta === "number" ? data.pointsDelta : undefined, status: String(data.status ?? "geschafft") as HistoryStatus }; });
        setHistoryEntries(entries); setHistoryMessage(entries.length > 0 ? "Live synchronisierte Missions-History" : "Noch keine erledigten Missionen in Firestore."); setStorageMode("Firestore Live");
      }, (error) => { console.error("Firestore History konnte nicht geladen werden", error); setHistoryMessage("History konnte nicht live geladen werden."); setStorageMode("Firestore Fehler"); });
      return unsubscribeHistory;
    });
    return () => unsubscribeAuth();
  }, []);

  const sortedHistory = useMemo(() => [...historyEntries].sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()), [historyEntries]);
  const visibleHistory = useMemo(() => statusFilter === "Alle" ? sortedHistory : sortedHistory.filter((entry) => (entry.status ?? "geschafft") === statusFilter), [sortedHistory, statusFilter]);
  const clearHistory = () => { setHistoryMessage("Löschen ist später serverseitig geplant. Firestore-History bleibt vorerst unverändert."); };

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
          <div className="mb-4 flex justify-between"><div><h1 className="text-5xl font-extrabold leading-none">History</h1><p className="mt-1 text-lg text-cyan-100/90">{historyMessage}</p></div><div className="flex items-center gap-2"><button onClick={clearHistory} className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/20">History löschen</button><div className="rounded-full bg-[#073b44] px-4 py-2 text-sm">Verlauf</div></div></div>
          <div className="mb-4 flex justify-center"><div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm"><Link href="/missionen/tagesmissionen" className="pb-1 text-base text-white/85 hover:text-white">Tagesmissionen</Link><Link href="/missionen/wochenmissionen" className="pb-1 text-base text-white/85 hover:text-white">Wochenmissionen</Link><Link href="/missionen/abenteuer" className="pb-1 text-base text-white/85 hover:text-white">Abenteuer</Link><Link href="/missionen/challenge" className="pb-1 text-base text-white/85 hover:text-white">Challenge</Link><Link href="/missionen/wettkaempfe" className="pb-1 text-base text-white/85 hover:text-white">Wettkämpfe</Link><Link href="/missionen/favoriten" className="pb-1 text-base text-white/85 hover:text-white">Favoriten</Link><div className="relative pb-1 text-base font-semibold text-orange-400">History<span className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full bg-orange-400" /></div></div></div>
          <div className="mb-4 flex gap-3"><button onClick={() => setStatusFilter("Alle")} className={`rounded-xl px-4 py-2 text-sm font-bold ${statusFilter === "Alle" ? "bg-cyan-300 text-black" : "bg-[#053841]/90 text-white/80"}`}>Alle</button><button onClick={() => setStatusFilter("geschafft")} className={`rounded-xl px-4 py-2 text-sm font-bold ${statusFilter === "geschafft" ? "bg-green-300 text-black" : "bg-[#053841]/90 text-white/80"}`}>Geschafft</button><button onClick={() => setStatusFilter("nicht geschafft")} className={`rounded-xl px-4 py-2 text-sm font-bold ${statusFilter === "nicht geschafft" ? "bg-red-300 text-black" : "bg-[#053841]/90 text-white/80"}`}>Nicht geschafft</button><button onClick={() => setStatusFilter("in Prüfung")} className={`rounded-xl px-4 py-2 text-sm font-bold ${statusFilter === "in Prüfung" ? "bg-yellow-300 text-black" : "bg-[#053841]/90 text-white/80"}`}>In Prüfung</button></div>
          <div className="min-h-0 flex-1 overflow-y-auto pb-20 pr-2">
            {visibleHistory.length === 0 ? (<div className="rounded-[22px] bg-[#053841]/90 p-6 text-center shadow-[0_12px_30px_rgba(0,0,0,0.18)]"><div className="text-5xl">📜</div><h2 className="mt-3 text-3xl font-bold">Noch keine Einträge</h2><p className="mt-2 text-base text-white/75">Sobald du Missionen abschließt oder nicht schaffst, erscheinen sie hier.</p><p className="mt-2 text-sm text-white/55">Dieser Verlauf wird live aus Firestore geladen und geräteübergreifend synchronisiert.</p></div>) : (<div className="space-y-3">{visibleHistory.map((entry) => { const status = entry.status ?? "geschafft"; return (<div key={entry.id} className="rounded-[20px] border border-cyan-300/10 bg-[#053841]/90 p-4 shadow-[0_8px_20px_rgba(0,0,0,0.14)]"><div className="flex items-center justify-between gap-4"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a3d46] text-3xl">{entry.icon}</div><div><h3 className="text-lg font-bold text-white">{entry.title}</h3><p className="mt-1 text-sm text-cyan-200">{entry.category}</p><p className="mt-1 text-xs text-white/60">{status === "geschafft" ? "Abgeschlossen" : status} am {new Date(entry.completedAt).toLocaleString("de-DE")}</p></div></div><div className="flex items-center gap-3"><div className={`rounded-xl border px-3 py-2 text-sm font-bold ${status === "geschafft" ? "border-green-400/40 bg-green-400/10 text-green-300" : status === "nicht geschafft" ? "border-red-400/40 bg-red-400/10 text-red-300" : "border-yellow-400/40 bg-yellow-400/10 text-yellow-300"}`}>{status}</div><div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm font-bold text-yellow-400">{entry.rewardLabel}</div></div></div></div>); })}</div>)}
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3"><div className="flex items-center gap-3"><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Einträge gesamt</p><p className="mt-1 text-sm font-semibold text-white">{sortedHistory.length}</p></div><div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Letzter Eintrag</p><p className="mt-1 text-lg font-bold text-white">{sortedHistory[0]?.icon ?? "—"}</p></div><div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Speicher</p><p className="mt-1 text-sm font-semibold text-white">{storageMode}</p></div></div><div className="flex items-center gap-3 text-xl text-white/80"><span>f</span><span>𝕏</span><span>in</span></div></div>
        </section>
      </div>
    </main>
  );
}
