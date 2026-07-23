"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useWellFitBrightness } from "@/app/hooks/useWellFitBrightness";
import { weeklyMissions } from "./missions";
import { useWeeklyMissionFirebase } from "./useWeeklyMissionFirebase";

function formatDate(dateKey: string | null) {
  if (!dateKey) return "–";
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return new Intl.DateTimeFormat("de-AT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function reviewStatusLabel(status: string | null | undefined) {
  if (status === "approved") return "Evidence freigegeben";
  if (status === "rejected") return "Evidence abgelehnt";
  if (status === "needs-more-evidence") return "Neue Evidence erforderlich";
  if (status === "pending-server-review") return "Admin-Review offen";
  return "Server-Attempt gestartet";
}

export default function WochenmissionenPage() {
  const [brightness, setBrightness] = useWellFitBrightness(100);
  const [selectedMissionId, setSelectedMissionId] = useState(weeklyMissions[0].id);
  const [message, setMessage] = useState("Die aktuelle Wien-Woche wird serverseitig geladen...");
  const weeklyState = useWeeklyMissionFirebase();

  const selectedMission = weeklyMissions.find((mission) => mission.id === selectedMissionId) ?? weeklyMissions[0];
  const activeAttemptByMission = useMemo(
    () => new Map(weeklyState.activeAttempts.map((attempt) => [attempt.missionId, attempt])),
    [weeklyState.activeAttempts],
  );
  const selectedAttempt = activeAttemptByMission.get(selectedMission.id) ?? null;
  const completedCount = weeklyState.completedMissionIds.length;
  const selectedCompleted = weeklyState.completedMissionIds.includes(selectedMission.id);
  const selectedStarted = weeklyState.startedMissionIds.includes(selectedMission.id);
  const selectedBusy = weeklyState.busyMissionId === selectedMission.id;
  const weekRangeLabel = weeklyState.weekKey
    ? `${weeklyState.weekKey} · ${formatDate(weeklyState.weekStartDateKey)} bis ${formatDate(weeklyState.weekEndDateKey)}`
    : "Wien-Woche wird bestimmt";

  const missionProgress = (missionId: string) => {
    if (weeklyState.completedMissionIds.includes(missionId)) return 100;
    const attempt = activeAttemptByMission.get(missionId);
    if (attempt?.reviewStatus === "approved") return 80;
    if (attempt?.reviewStatus === "pending-server-review") return 55;
    if (attempt?.reviewStatus === "rejected" || attempt?.reviewStatus === "needs-more-evidence") return 40;
    if (weeklyState.startedMissionIds.includes(missionId)) return 25;
    return 0;
  };

  const actionLabel = () => {
    if (selectedCompleted) return "Mission erledigt";
    if (selectedBusy) return "Server wird kontaktiert...";
    if (!weeklyState.userId) return "Login erforderlich";
    if (!selectedStarted) return "Mission starten & bestätigen";
    if (selectedAttempt?.reviewStatus === "approved") return "Freigabe abschließen";
    if (selectedAttempt?.reviewStatus === "rejected" || selectedAttempt?.reviewStatus === "needs-more-evidence") {
      return "Bestätigung erneut einreichen";
    }
    if (selectedAttempt?.reviewStatus === "pending-server-review") return "Reviewstatus prüfen";
    return "Evidence einreichen";
  };

  const toggleFavorite = (missionId: string) => {
    const next = weeklyState.favoriteIds.includes(missionId)
      ? weeklyState.favoriteIds.filter((id) => id !== missionId)
      : [...weeklyState.favoriteIds, missionId];
    weeklyState.setFavoriteIds(next);
  };

  const continueMission = async (missionId = selectedMission.id) => {
    const mission = weeklyMissions.find((item) => item.id === missionId) ?? selectedMission;
    if (!weeklyState.userId) {
      setMessage("Bitte melde dich an, um Wochenmissionen serverseitig zu starten.");
      return;
    }
    if (weeklyState.completedMissionIds.includes(mission.id)) {
      setMessage(`${mission.title} wurde in ${weeklyState.weekKey ?? "dieser Woche"} bereits serverseitig abgeschlossen.`);
      return;
    }

    try {
      const result = await weeklyState.continueMission(mission.id);
      setMessage(result.message);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Die Wochenmission konnte nicht sicher verarbeitet werden.");
    }
  };

  const serverStateLabel = !weeklyState.ready
    ? "Serverprojektion wird geladen"
    : weeklyState.progressSource === "server"
      ? "Attempt → Evidence → Admin-Review → Completion → WFXP"
      : "Nur lokale Anzeige · keine Reward-Autorität";

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{
        background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))`,
      }}
    >
      <div className="flex h-full">
        <aside className="flex h-full w-[250px] flex-col border-r border-cyan-400/10 bg-[#042f35]/95 px-5 py-6">
          <div className="mb-8 flex justify-center">
            <Image src="/logo.png" alt="WellFit Logo" width={150} height={150} className="object-contain" priority />
          </div>

          <nav className="space-y-2 text-[14px]">
            <Link href="/dashboard" className="block text-white/80">Dashboard</Link>
            <div className="font-bold text-orange-400">Missionen</div>
            <Link href="/buddy" className="block text-white/80">Mein KI-Buddy</Link>
            <div className="text-white/80">Marktplatz</div>
            <div className="text-white/80">Leaderboard</div>
            <div className="text-white/80">Punkte-Shop</div>
            <div className="text-white/80">Analytics & Stats</div>
          </nav>

          <div className="mt-5 border-t border-cyan-400/10 pt-4">
            <div className="mb-2 whitespace-nowrap text-base font-bold text-green-400">App aufs Handy laden</div>
            <label className="mb-1 block text-lg">Helligkeit</label>
            <input
              type="range"
              min="5"
              max="100"
              value={brightness}
              onChange={(event) => setBrightness(Number(event.target.value))}
              className="w-full"
            />
            <div className="mt-1 text-right text-sm text-white/70">{brightness}%</div>
          </div>

          <div className="mt-auto pt-4">
            <div className="space-y-2 text-[14px]">
              <Link href="/einstellungen" className="block text-white/80">Einstellungen</Link>
              <Link href="/datenschutz" className="block text-white/80">Datenschutz</Link>
              <Link href="/agb" className="block text-white/80">AGB</Link>
              <Link href="/impressum" className="block text-white/80">Impressum</Link>
              <Link href="/faq" className="block text-white/80">FAQ</Link>
              <Link href="/hilfe" className="block text-white/80">Hilfe</Link>
            </div>
          </div>
        </aside>

        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <div className="mb-4 flex justify-between gap-4">
            <div>
              <h1 className="text-5xl font-extrabold leading-none">Wochenmissionen</h1>
              <p className="mt-2 max-w-3xl text-base text-cyan-100/90">
                {weeklyState.lastError || message}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/45">
                {serverStateLabel}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/mobile/analyse" className="rounded-[16px] bg-orange-500 px-5 py-3 text-sm font-bold transition hover:bg-orange-400">
                Tracker öffnen
              </Link>
              <div className="rounded-full bg-[#073b44] px-4 py-2 text-sm">
                Level {weeklyState.level} · {weeklyState.walletBalance} WFXP
              </div>
            </div>
          </div>

          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">
              <Link href="/missionen/tagesmissionen" className="pb-1 text-base text-white/85 hover:text-white">Tagesmissionen</Link>
              <div className="relative pb-1 text-base font-semibold text-orange-400">
                Wochenmissionen
                <span className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full bg-orange-400" />
              </div>
              <Link href="/missionen/abenteuer" className="pb-1 text-base text-white/85 hover:text-white">Abenteuer</Link>
              <Link href="/missionen/challenge" className="pb-1 text-base text-white/85 hover:text-white">Challenge</Link>
              <Link href="/missionen/wettkaempfe" className="pb-1 text-base text-white/85 hover:text-white">Wettkämpfe</Link>
              <Link href="/missionen/favoriten" className="pb-1 text-base text-white/85 hover:text-white">Favoriten</Link>
              <Link href="/missionen/history" className="pb-1 text-base text-white/85 hover:text-white">History</Link>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[2fr_1fr] gap-4 overflow-hidden pb-20">
            <div className="min-h-0 space-y-4 overflow-y-auto pr-3 pb-5">
              <div className="rounded-[20px] border border-cyan-300/20 bg-[#053841]/90 px-4 py-3 shadow-[0_8px_20px_rgba(0,0,0,0.14)]">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">Schließe in dieser Wien-Woche alle 3 Hauptmissionen ab</p>
                    <p className="mt-1 text-sm text-yellow-300">
                      {completedCount}/{weeklyState.weeklyGoal} serverseitig abgeschlossen · {weekRangeLabel}
                    </p>
                    <p className="mt-1 text-xs text-white/55">
                      Das Wochenziel wird ausschließlich aus freigegebenen Mission-Completions abgeleitet. In Beta 1 gibt es keinen separaten Browser-Bonus.
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl border text-2xl ${weeklyState.goalCompleted ? "border-emerald-300/50 bg-emerald-400/15" : "border-yellow-400/30 bg-[#0a3d46]"}`}>
                    {weeklyState.goalCompleted ? "🏆" : "🎁"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {weeklyMissions.map((mission) => {
                  const progress = missionProgress(mission.id);
                  const attempt = activeAttemptByMission.get(mission.id);
                  const completed = weeklyState.completedMissionIds.includes(mission.id);
                  const busy = weeklyState.busyMissionId === mission.id;
                  return (
                    <article
                      key={mission.id}
                      onClick={() => setSelectedMissionId(mission.id)}
                      className={`cursor-pointer rounded-[20px] border p-4 transition ${
                        selectedMissionId === mission.id
                          ? "border-yellow-400 bg-[#07505c]"
                          : "border-cyan-300/10 bg-[#053841]/90 hover:bg-[#07505c]"
                      }`}
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div className="text-3xl">{mission.icon}</div>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFavorite(mission.id);
                          }}
                          className={`text-xl ${weeklyState.favoriteIds.includes(mission.id) ? "text-yellow-400" : "text-white/30"}`}
                          aria-label={weeklyState.favoriteIds.includes(mission.id) ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
                        >
                          ★
                        </button>
                      </div>
                      <h3 className="text-lg font-bold leading-tight text-white">{mission.title}</h3>
                      <p className="mt-2 text-sm text-white/80">{mission.description}</p>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-black/25">
                        <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progress}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-white/80">
                        <span>{progress}%</span>
                        <span>{mission.rewardLabel}</span>
                      </div>
                      <p className="mt-2 min-h-8 text-[11px] font-semibold text-cyan-100/60">
                        {completed ? "Serverseitig abgeschlossen" : attempt ? reviewStatusLabel(attempt.reviewStatus) : "Noch nicht gestartet"}
                      </p>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedMissionId(mission.id);
                          void continueMission(mission.id);
                        }}
                        disabled={completed || busy || !weeklyState.ready || !weeklyState.userId}
                        className="mt-3 w-full rounded-lg border border-yellow-400/40 bg-[#0a3d46] px-3 py-2 text-sm font-bold text-white transition hover:bg-[#0e4c57] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {completed ? "Erledigt" : busy ? "Server läuft..." : attempt?.reviewStatus === "pending-server-review" ? "Status prüfen" : "Fortsetzen"}
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>

            <aside className="min-h-0 overflow-y-auto rounded-[24px] bg-[#053841]/90 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
              <div className="mb-4 flex items-start justify-between gap-3">
                <h2 className="text-2xl font-bold text-white">Missionsdetails</h2>
                <button
                  type="button"
                  onClick={() => toggleFavorite(selectedMission.id)}
                  className={`text-2xl ${weeklyState.favoriteIds.includes(selectedMission.id) ? "text-yellow-400" : "text-white/30"}`}
                  aria-label={weeklyState.favoriteIds.includes(selectedMission.id) ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
                >
                  ★
                </button>
              </div>

              {selectedCompleted ? (
                <div className="mb-3 rounded-xl border border-emerald-300/40 bg-emerald-400/15 px-3 py-2 text-center text-sm font-bold text-emerald-100">
                  🏆 Serverseitig abgeschlossen · +{selectedMission.reward} WFXP
                </div>
              ) : selectedStarted ? (
                <div className="mb-3 rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-3 py-2 text-center text-sm font-bold text-cyan-100">
                  {reviewStatusLabel(selectedAttempt?.reviewStatus)}
                  {selectedAttempt ? <span className="mt-1 block text-[10px] font-semibold text-cyan-100/55">Attempt: {selectedAttempt.attemptStatus}</span> : null}
                </div>
              ) : null}

              <div className="mb-3 flex justify-center text-5xl">{selectedMission.icon}</div>
              <h3 className="text-center text-2xl font-bold text-white">{selectedMission.title}</h3>
              <p className="mt-3 text-center text-sm text-white/85">{selectedMission.description}</p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/70">
                <div className="rounded-xl bg-black/15 p-3">
                  <p className="text-white/45">Ziel</p>
                  <p className="mt-1 font-bold text-white">{selectedMission.targetValue.toLocaleString("de-AT")} {selectedMission.targetUnit}</p>
                </div>
                <div className="rounded-xl bg-black/15 p-3">
                  <p className="text-white/45">Zeitraum</p>
                  <p className="mt-1 font-bold text-white">{selectedMission.duration}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm text-white/80">
                  <span>Server-/Reviewfortschritt</span>
                  <span>{missionProgress(selectedMission.id)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-black/25">
                  <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${missionProgress(selectedMission.id)}%` }} />
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">
                  <div className="flex items-center justify-between text-base">
                    <span className="font-semibold text-white/90">Server-Katalogwert</span>
                    <span className="font-bold text-yellow-300">+{selectedMission.reward} WFXP</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-white/60">
                    WFXP werden erst nach Evidence-Review und serverseitiger Completion einmal pro Mission und Wien-Woche gebucht. Keine Token, keine NFTs und keine Auszahlung.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void continueMission()}
                  disabled={selectedCompleted || selectedBusy || !weeklyState.ready || !weeklyState.userId}
                  className="w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {actionLabel()}
                </button>

                <button
                  type="button"
                  onClick={() => void weeklyState.refreshProgress()}
                  disabled={!weeklyState.userId || selectedBusy}
                  className="w-full rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-50 disabled:opacity-40"
                >
                  Serverstatus aktualisieren
                </button>
              </div>
            </aside>
          </div>

          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="min-w-[180px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2">
                <p className="text-[10px] uppercase text-white/50">Aktuelle Wien-Woche</p>
                <p className="mt-1 text-sm font-semibold text-white">{weeklyState.weekKey ?? "wird geladen"}</p>
              </div>
              <div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center">
                <p className="text-[10px] uppercase text-white/50">WFXP-Wallet</p>
                <p className="mt-1 text-lg font-bold text-white">{weeklyState.walletBalance}</p>
              </div>
              <div className="min-w-[230px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2 text-center">
                <p className="text-[10px] uppercase text-white/50">Beta-Sicherheitsgrenze</p>
                <p className="mt-1 text-xs font-semibold text-white/70">Server-Review · kein Geldwert · kein Cashout</p>
              </div>
              <div className={`min-w-[185px] rounded-xl border px-3 py-2 text-center ${weeklyState.progressSource === "server" ? "border-emerald-400/40 bg-emerald-500/10" : "border-amber-400/40 bg-amber-500/10"}`}>
                <p className={`text-sm font-semibold ${weeklyState.progressSource === "server" ? "text-emerald-200" : "text-amber-200"}`}>
                  {weeklyState.progressSource === "server" ? "✓ Serverprojektion aktiv" : "⚠ Keine Serverautorität"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xl text-white/80"><span>f</span><span>X</span><span>in</span></div>
          </div>
        </section>
      </div>
    </main>
  );
}
