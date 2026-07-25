"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import AppSidebar from "@/app/AppSidebar";
import { useWellFitBrightness } from "@/app/hooks/useWellFitBrightness";
import { auth } from "@/lib/firebase";
import {
  fetchMissionHistory,
  type MissionHistoryCategory,
  type MissionHistoryEntry,
  type MissionHistoryResult,
  type MissionHistoryStatus,
} from "@/lib/beta1/clientMissionHistory";
import { formatMissionDateKey, formatMissionTimeZone } from "@/lib/beta1/missionStatusPresentation.mjs";

const missionTabs = [
  { label: "Tagesmissionen", href: "/missionen/tagesmissionen" },
  { label: "Wochenmissionen", href: "/missionen/wochenmissionen" },
  { label: "Abenteuer", href: "/missionen/abenteuer" },
  { label: "Challenge", href: "/missionen/challenge" },
  { label: "Wettkämpfe", href: "/missionen/wettkaempfe" },
  { label: "Favoriten", href: "/missionen/favoriten" },
  { label: "History", href: "/missionen/history" },
];

type StatusFilter = "all" | "completed" | "review" | "action" | "attention" | "started";
type CategoryFilter = "all" | MissionHistoryCategory;

const statusFilters: Array<{ key: StatusFilter; label: string }> = [
  { key: "all", label: "Alle" },
  { key: "completed", label: "Abgeschlossen" },
  { key: "review", label: "In Prüfung" },
  { key: "action", label: "Aktion erforderlich" },
  { key: "attention", label: "Serverprüfung" },
  { key: "started", label: "Gestartet" },
];

const categoryFilters: Array<{ key: CategoryFilter; label: string }> = [
  { key: "all", label: "Alle Kategorien" },
  { key: "daily", label: "Tagesmissionen" },
  { key: "weekly", label: "Wochenmissionen" },
  { key: "challenge", label: "Challenge" },
  { key: "adventure", label: "Abenteuer" },
  { key: "mission", label: "Weitere Missionen" },
];

const statusMeta: Record<MissionHistoryStatus, { label: string; detail: string; classes: string }> = {
  started: {
    label: "Gestartet",
    detail: "Der serverseitige Vorgang ist offen. Die vorgesehene Bestätigung kann im Missionsbereich eingereicht werden.",
    classes: "border-cyan-300/35 bg-cyan-400/10 text-cyan-100",
  },
  "review-pending": {
    label: "In Prüfung",
    detail: "Die Bestätigung liegt beim Server. Bis zur Freigabe wurden keine Reward-WFXP gebucht.",
    classes: "border-sky-300/35 bg-sky-400/10 text-sky-100",
  },
  "review-approved": {
    label: "Abschluss möglich",
    detail: "Die Bestätigung ist freigegeben. Der explizite serverseitige Completion-Schritt ist noch offen.",
    classes: "border-emerald-300/35 bg-emerald-400/10 text-emerald-100",
  },
  rejected: {
    label: "Bestätigung abgelehnt",
    detail: "Der bestehende Vorgang bleibt erhalten. Eine neue Bestätigung kann ohne zweiten Attempt eingereicht werden.",
    classes: "border-rose-300/40 bg-rose-400/10 text-rose-100",
  },
  "needs-more-evidence": {
    label: "Ergänzung erforderlich",
    detail: "Der vorhandene Vorgang benötigt weitere Bestätigung. Noch keine Reward-WFXP-Buchung.",
    classes: "border-amber-300/40 bg-amber-400/10 text-amber-100",
  },
  completed: {
    label: "Abgeschlossen",
    detail: "Completion und interne WFXP-Buchung sind durch den Server und das Ledger bestätigt.",
    classes: "border-green-300/40 bg-green-400/10 text-green-100",
  },
  "server-inconsistent": {
    label: "Serverprüfung erforderlich",
    detail: "Ein alter oder unvollständiger Serverzustand besitzt keinen vollständigen Ledgernachweis und wird deshalb nicht als Erfolg gewertet.",
    classes: "border-orange-300/45 bg-orange-400/10 text-orange-100",
  },
};

function statusMatches(entry: MissionHistoryEntry, filter: StatusFilter) {
  if (filter === "all") return true;
  if (filter === "completed") return entry.status === "completed";
  if (filter === "review") return entry.status === "review-pending";
  if (filter === "action") return entry.actionRequired;
  if (filter === "attention") return entry.serverAttentionRequired;
  return entry.status === "started";
}

function missionHref(category: MissionHistoryCategory) {
  if (category === "daily") return "/missionen/tagesmissionen";
  if (category === "weekly") return "/missionen/wochenmissionen";
  if (category === "challenge") return "/missionen/challenge";
  if (category === "adventure") return "/missionen/abenteuer";
  return "/missionen";
}

function formatTimestamp(value: string | null) {
  if (!value) return "Zeitpunkt nicht verfügbar";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("de-AT", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function periodLabel(entry: MissionHistoryEntry) {
  if (entry.periodType === "day" && entry.periodKey) return `Lokaler Tag ${formatMissionDateKey(entry.periodKey)}`;
  if (entry.periodType === "week" && entry.periodKey) return `Lokale Kalenderwoche ${entry.periodKey}`;
  return "Kein wiederkehrender Zeitraum";
}

export default function HistoryPage() {
  const [brightness, setBrightness] = useWellFitBrightness(100);
  const [authReady, setAuthReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("Serverseitiger Missionsverlauf wird vorbereitet...");
  const [result, setResult] = useState<MissionHistoryResult | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");

  const loadHistory = useCallback(async () => {
    if (!auth.currentUser) {
      setResult(null);
      setMessage("Bitte melde dich an, um deinen serverseitigen Missionsverlauf zu sehen.");
      return;
    }
    try {
      setLoading(true);
      setMessage("Attempts, Reviews, Completions und interne WFXP-Ledgernachweise werden serverseitig abgeglichen...");
      const history = await fetchMissionHistory(100);
      setResult(history);
      setMessage(
        history.entries.length > 0
          ? `${history.entries.length} serverautorisierte Verlaufseinträge geladen.`
          : "Noch keine serverseitigen Missionsvorgänge vorhanden.",
      );
    } catch (error) {
      setResult(null);
      setMessage(error instanceof Error ? error.message : "Der serverseitige Missionsverlauf konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!active) return;
      setAuthReady(true);
      setUserId(user?.uid ?? null);
      if (!user) {
        setResult(null);
        setMessage("Bitte melde dich an, um deinen serverseitigen Missionsverlauf zu sehen.");
        return;
      }
      void loadHistory();
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadHistory]);

  const entries = result?.entries ?? [];
  const visibleEntries = useMemo(
    () => entries.filter((entry) => statusMatches(entry, statusFilter) && (categoryFilter === "all" || entry.category === categoryFilter)),
    [categoryFilter, entries, statusFilter],
  );
  const completedCount = entries.filter((entry) => entry.status === "completed").length;
  const pendingCount = entries.filter((entry) => entry.status === "review-pending").length;
  const actionCount = entries.filter((entry) => entry.actionRequired).length;
  const attentionCount = entries.filter((entry) => entry.serverAttentionRequired).length;

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{ background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))` }}
    >
      <div className="flex h-full">
        <AppSidebar brightness={brightness} onBrightnessChange={setBrightness} />

        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-5xl font-extrabold leading-none">Missionsverlauf</h1>
              <p className="mt-2 text-base text-cyan-100/90">{message}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/50">
                Server-Read · Attempts → Evidence → Review → Completion → internes WFXP-Ledger
              </p>
            </div>
            <button
              type="button"
              onClick={() => void loadHistory()}
              disabled={!userId || loading}
              className="rounded-xl border border-cyan-200/30 bg-cyan-200/10 px-4 py-2 text-sm font-bold text-cyan-50 transition hover:bg-cyan-200/15 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? "Serververlauf wird geladen..." : "Serververlauf aktualisieren"}
            </button>
          </div>

          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">
              {missionTabs.map((tab) => tab.label === "History" ? (
                <div key={tab.label} className="relative pb-1 text-base font-semibold text-orange-400">
                  {tab.label}<span className="absolute -bottom-2 left-0 right-0 h-[2px] rounded-full bg-orange-400" />
                </div>
              ) : (
                <Link key={tab.label} href={tab.href} className="pb-1 text-base text-white/85 hover:text-white">{tab.label}</Link>
              ))}
            </div>
          </div>

          <div className="mb-3 flex flex-wrap gap-2">
            {statusFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setStatusFilter(filter.key)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${statusFilter === filter.key ? "border-cyan-200 bg-cyan-300 text-slate-950" : "border-white/15 bg-black/15 text-white/75 hover:bg-white/10"}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {categoryFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setCategoryFilter(filter.key)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${categoryFilter === filter.key ? "border-yellow-200 bg-yellow-300/20 text-yellow-50" : "border-white/10 bg-black/10 text-white/60 hover:bg-white/10"}`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {result?.scanTruncated ? (
            <p className="mb-3 rounded-xl border border-amber-300/35 bg-amber-300/10 px-3 py-2 text-xs text-amber-50">
              Der Verlauf überschreitet die sichere Scan-Grenze. Angezeigt werden die neuesten serverseitig gelesenen Einträge; eine paginierte Erweiterung ist erforderlich.
            </p>
          ) : null}

          <div className="min-h-0 flex-1 overflow-y-auto pb-24 pr-2">
            {!authReady || loading ? (
              <div className="rounded-[22px] border border-cyan-300/15 bg-[#053841]/90 p-8 text-center">
                <div className="text-5xl">⏳</div>
                <h2 className="mt-3 text-2xl font-bold">Serververlauf wird geprüft</h2>
                <p className="mt-2 text-sm text-white/65">Lokale Browserdaten werden nicht als Missionsabschluss oder Reward verwendet.</p>
              </div>
            ) : !userId ? (
              <div className="rounded-[22px] border border-amber-300/25 bg-[#053841]/90 p-8 text-center">
                <div className="text-5xl">🔐</div>
                <h2 className="mt-3 text-2xl font-bold">Login erforderlich</h2>
                <p className="mt-2 text-sm text-white/65">Nur dein authentifiziertes Konto darf seine serverseitigen Missionsvorgänge lesen.</p>
              </div>
            ) : visibleEntries.length === 0 ? (
              <div className="rounded-[22px] border border-cyan-300/15 bg-[#053841]/90 p-8 text-center">
                <div className="text-5xl">📜</div>
                <h2 className="mt-3 text-2xl font-bold">Keine passenden Einträge</h2>
                <p className="mt-2 text-sm text-white/65">Ändere die Filter oder starte eine serverseitige Mission.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {visibleEntries.map((entry) => {
                  const meta = statusMeta[entry.status];
                  return (
                    <article key={entry.historyId} className="rounded-[20px] border border-cyan-300/10 bg-[#053841]/90 p-4 shadow-[0_8px_20px_rgba(0,0,0,0.14)]">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0a3d46] text-3xl">{entry.icon}</div>
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold text-white">{entry.title}</h3>
                            <p className="mt-1 text-sm text-cyan-200">{entry.categoryLabel}</p>
                            <p className="mt-1 text-xs text-white/55">Letzte serverseitige Änderung: {formatTimestamp(entry.occurredAt)}</p>
                          </div>
                        </div>
                        <div className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-bold ${meta.classes}`}>{meta.label}</div>
                      </div>

                      <p className="mt-3 rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs leading-relaxed text-white/70">{meta.detail}</p>

                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-white/65">
                        <span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1">{periodLabel(entry)}</span>
                        {entry.timeZone ? <span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1">Zeitzone: {formatMissionTimeZone(entry.timeZone)}</span> : null}
                        {entry.isLocationBound ? <span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1">Ortsgebundene Mission</span> : null}
                        {entry.childProfile ? <span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1">Familienprofil</span> : null}
                        {entry.accessDebited ? <span className="rounded-full border border-orange-300/25 bg-orange-300/10 px-2.5 py-1 text-orange-100">Zugang einmalig gebucht: {entry.accessCostWfxp} WFXP</span> : null}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <div className={`rounded-xl border px-3 py-2 text-sm font-bold ${entry.status === "completed" ? "border-yellow-300/35 bg-yellow-300/10 text-yellow-100" : "border-white/10 bg-black/10 text-white/55"}`}>
                          {entry.status === "completed" ? `+${entry.rewardXp} interne WFXP im Ledger` : "Keine bestätigte Reward-WFXP-Buchung"}
                        </div>
                        <Link href={missionHref(entry.category)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700">
                          Missionsbereich öffnen
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[130px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Servereinträge</p><p className="mt-1 text-lg font-bold">{entries.length}</p></div>
              <div className="min-w-[130px] rounded-xl border border-emerald-400/25 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Abgeschlossen</p><p className="mt-1 text-lg font-bold text-emerald-200">{completedCount}</p></div>
              <div className="min-w-[130px] rounded-xl border border-sky-400/25 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">In Prüfung</p><p className="mt-1 text-lg font-bold text-sky-200">{pendingCount}</p></div>
              <div className="min-w-[150px] rounded-xl border border-amber-400/25 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Aktion erforderlich</p><p className="mt-1 text-lg font-bold text-amber-200">{actionCount}</p></div>
              <div className="min-w-[130px] rounded-xl border border-orange-400/25 bg-[#041f24] px-3 py-2"><p className="text-[10px] uppercase text-white/50">Serverprüfung</p><p className="mt-1 text-lg font-bold text-orange-200">{attentionCount}</p></div>
            </div>
            <div className="text-right text-[11px] text-white/55">
              <p>Read-only · keine Browser-History · keine direkten Firestore-Writes</p>
              <p className="mt-1">Interne WFXP · nicht übertragbar · kein Geldwert · kein Cashout</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
