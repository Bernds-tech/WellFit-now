"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppSidebar from "@/app/AppSidebar";
import { useWellFitBrightness } from "@/app/hooks/useWellFitBrightness";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import {
  readClientMissionHistory,
  subscribeClientMissionHistory,
  type ClientMissionHistoryEntry,
  type ClientMissionHistoryStatus,
} from "../lib/clientMissionHistory";

type HistoryStatus = ClientMissionHistoryStatus;
type HistoryEntry = ClientMissionHistoryEntry | {
  id: string;
  title: string;
  category: string;
  rewardLabel: string;
  completedAt: string;
  icon: string;
  pointsDelta?: number;
  status: HistoryStatus;
  source: "firestore";
};

const missionTabs = [
  { label: "Tagesmissionen", href: "/missionen/tagesmissionen" },
  { label: "Wochenmissionen", href: "/missionen/wochenmissionen" },
  { label: "Abenteuer", href: "/missionen/abenteuer" },
  { label: "Challenge", href: "/missionen/challenge" },
  { label: "Wettkämpfe", href: "/missionen/wettkaempfe" },
  { label: "Favoriten", href: "/missionen/favoriten" },
  { label: "History", href: "/missionen/history" },
];

const sanitizeRewardLabel = (value: unknown, pointsDelta?: number) => {
  const fallback = `+${pointsDelta ?? 0} interne Punkte`;
  if (typeof value !== "string" || value.trim().length === 0) return fallback;
  return value
    .replace(/WFT/gi, "interne Punkte")
    .replace(/NFT/gi, "Beta-Abzeichen")
    .replace(/Token/gi, "interne Punkte")
    .trim();
};

const toDateString = (value: unknown) => {
  if (!value) return new Date().toISOString();
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null) {
    const maybeTimestamp = value as { toDate?: unknown };
    if (typeof maybeTimestamp.toDate === "function") return maybeTimestamp.toDate().toISOString();
  }
  return new Date(String(value)).toISOString();
};

const getStatusClass = (status: HistoryStatus) => {
  if (status === "geschafft") return "border-green-400/40 bg-green-400/10 text-green-300";
  if (status === "nicht geschafft") return "border-red-400/40 bg-red-400/10 text-red-300";
  return "border-yellow-400/40 bg-yellow-400/10 text-yellow-300";
};

export default function HistoryPage() {
  const [brightness, setBrightness] = useWellFitBrightness(100);
  const [firestoreEntries, setFirestoreEntries] = useState<HistoryEntry[]>([]);
  const [clientEntries, setClientEntries] = useState<ClientMissionHistoryEntry[]>([]);
  const [historyMessage, setHistoryMessage] = useState("History wird vorbereitet...");
  const [storageMode, setStorageMode] = useState("Beta-History + Firestore Read");
  const [statusFilter, setStatusFilter] = useState<"Alle" | HistoryStatus>("Alle");

  useEffect(() => {
    queueMicrotask(() => setClientEntries(readClientMissionHistory()));
    return subscribeClientMissionHistory(setClientEntries);
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setFirestoreEntries([]);
        setHistoryMessage("Lokale Beta-History aktiv. Für Firestore-History bitte einloggen.");
        setStorageMode("lokale Beta-History");
        return;
      }

      const historyQuery = query(
        collection(db, "history"),
        where("userId", "==", firebaseUser.uid),
        orderBy("createdAt", "desc"),
      );

      const unsubscribeHistory = onSnapshot(historyQuery, (snapshot) => {
        const entries: HistoryEntry[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const pointsDelta = typeof data.pointsDelta === "number" ? data.pointsDelta : undefined;
          return {
            id: `firestore-${docSnap.id}`,
            title: String(data.title ?? "Mission"),
            category: String(data.category ?? "Mission"),
            rewardLabel: sanitizeRewardLabel(data.rewardLabel, pointsDelta),
            completedAt: toDateString(data.createdAt),
            icon: String(data.icon ?? "✅"),
            pointsDelta,
            status: String(data.status ?? "geschafft") as HistoryStatus,
            source: "firestore",
          };
        });
        setFirestoreEntries(entries);
        setHistoryMessage(entries.length > 0 ? "Firestore-History + lokale Beta-History aktiv" : "Noch keine Firestore-History. Lokale Beta-History wird angezeigt.");
        setStorageMode("Firestore Read + lokale Beta-History");
      }, (error) => {
        console.error("Firestore History konnte nicht geladen werden", error);
        setHistoryMessage("Firestore-History nicht erreichbar. Lokale Beta-History wird angezeigt.");
        setStorageMode("lokaler Fallback");
      });

      return unsubscribeHistory;
    });

    return () => unsubscribeAuth();
  }, []);

  const combinedHistory = useMemo(() => {
    const merged = [...clientEntries, ...firestoreEntries];
    return merged
      .reduce<HistoryEntry[]>((accumulator, entry) => {
        if (!accumulator.some((existing) => existing.id === entry.id)) accumulator.push(entry);
        return accumulator;
      }, [])
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  }, [clientEntries, firestoreEntries]);

  const visibleHistory = useMemo(
    () => statusFilter === "Alle" ? combinedHistory : combinedHistory.filter((entry) => entry.status === statusFilter),
    [combinedHistory, statusFilter],
  );

  const clearHistory = () => {
    setHistoryMessage("Löschen ist später serverseitig geplant. Beta-History bleibt vorerst unverändert.");
  };

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{ background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))` }}
    >
      <div className="flex h-full">
        <AppSidebar brightness={brightness} onBrightnessChange={setBrightness} />

        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <div className="mb-4 flex justify-between">
            <div>
              <h1 className="text-5xl font-extrabold leading-none">History</h1>
              <p className="mt-1 text-lg text-cyan-100/90">{historyMessage}</p>
              <p className="mt-1 text-sm text-white/60">Verlauf für interne Beta-Punkte und Missionsstatus. Keine Token, keine NFTs, keine Auszahlung.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={clearHistory} className="rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-bold text-red-300 hover:bg-red-500/20">History löschen</button>
              <div className="rounded-full bg-[#073b44] px-4 py-2 text-sm">Verlauf</div>
            </div>
          </div>

          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">
              {missionTabs.map((tab) => tab.label === "History" ? (
                <div key={tab.label} className="relative pb-1 text-base font-semibold text-orange-400">
                  {tab.label}<span className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full bg-orange-400" />
                </div>
              ) : (
                <Link key={tab.label} href={tab.href} className="pb-1 text-base text-white/85 hover:text-white">{tab.label}</Link>
              ))}
            </div>
          </div>

          <div className="mb-4 flex gap-3">
            {(["Alle", "geschafft", "nicht geschafft", "in Prüfung"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-xl px-4 py-2 text-sm font-bold ${statusFilter === status ? "bg-cyan-300 text-black" : "bg-[#053841]/90 text-white/80"}`}
              >
                {status === "Alle" ? "Alle" : status}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pb-20 pr-2">
            {visibleHistory.length === 0 ? (
              <div className="rounded-[22px] bg-[#053841]/90 p-6 text-center shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                <div className="text-5xl">📜</div>
                <h2 className="mt-3 text-3xl font-bold">Noch keine Einträge</h2>
                <p className="mt-2 text-base text-white/75">Sobald du Missionen abschließt oder nicht schaffst, erscheinen sie hier.</p>
                <p className="mt-2 text-sm text-white/55">Aktuell wird Firestore-Read plus lokale Beta-History angezeigt.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleHistory.map((entry) => (
                  <div key={entry.id} className="rounded-[20px] border border-cyan-300/10 bg-[#053841]/90 p-4 shadow-[0_8px_20px_rgba(0,0,0,0.14)]">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a3d46] text-3xl">{entry.icon}</div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{entry.title}</h3>
                          <p className="mt-1 text-sm text-cyan-200">{entry.category}</p>
                          <p className="mt-1 text-xs text-white/60">{entry.status === "geschafft" ? "Abgeschlossen" : entry.status} am {new Date(entry.completedAt).toLocaleString("de-DE")}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`rounded-xl border px-3 py-2 text-sm font-bold ${getStatusClass(entry.status)}`}>{entry.status}</div>
                        <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm font-bold text-yellow-400">{entry.rewardLabel}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Einträge gesamt</p><p className="mt-1 text-sm font-semibold text-white">{combinedHistory.length}</p></div>
              <div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Letzter Eintrag</p><p className="mt-1 text-lg font-bold text-white">{combinedHistory[0]?.icon ?? "—"}</p></div>
              <div className="min-w-[190px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Speicher</p><p className="mt-1 text-sm font-semibold text-white">{storageMode}</p></div>
              <div className="min-w-[220px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2 text-center"><p className="text-[10px] uppercase text-white/50">Beta-Hinweis</p><p className="mt-1 text-xs font-semibold text-white/70">Keine Token · keine NFTs · keine Auszahlung</p></div>
            </div>
            <div className="flex items-center gap-3 text-xl text-white/80"><span>f</span><span>X</span><span>in</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
