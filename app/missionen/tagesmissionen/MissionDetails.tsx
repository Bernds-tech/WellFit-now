"use client";

import Image from "next/image";
import MissionLifecyclePanel from "@/components/mission/MissionLifecyclePanel";
import type { MissionStatusPresentation } from "@/lib/beta1/missionStatusPresentation.mjs";
import { DailyMission, missionIcon } from "./missions";

type RewardPreviewStatus = "preview_allowed" | "manual_review" | "blocked";

type MissionDetailsProps = {
  mission: DailyMission;
  reward: number;
  diversityMultiplier: number;
  antiFarmingMultiplier: number;
  reserveRewardRate?: number;
  rewardPreviewLabel?: string;
  rewardPreviewStatus?: RewardPreviewStatus;
  capReasons?: string[];
  statusPresentation: MissionStatusPresentation;
  periodLabel: string;
  timeZone: string;
  calendarAuthority: "server-user-time-zone" | "device-preview";
  timeZoneChangeDeferred: boolean;
  nextTimeZoneChangeAt: string | null;
  isFavorite: boolean;
  isStarted: boolean;
  isCompleted: boolean;
  activeAttemptStatus?: string | null;
  actionBusy?: boolean;
  rewardDetailsOpen: boolean;
  onToggleFavorite: (missionId: string) => void;
  onToggleRewardDetails: () => void;
  onStartMission: (missionId: string) => void;
  onCompleteMission: (missionId: string) => void;
  onRefreshStatus: () => void;
};

const getPreviewBadgeClasses = (status?: RewardPreviewStatus) => {
  if (status === "blocked") return "border-red-400/50 bg-red-500/15 text-red-100";
  if (status === "manual_review") return "border-yellow-400/50 bg-yellow-500/15 text-yellow-100";
  return "border-green-400/50 bg-green-500/15 text-green-100";
};

export default function MissionDetails({
  mission,
  reward,
  diversityMultiplier,
  antiFarmingMultiplier,
  reserveRewardRate = 1,
  rewardPreviewLabel = "Server-Katalog",
  rewardPreviewStatus = "manual_review",
  capReasons = [],
  statusPresentation,
  periodLabel,
  timeZone,
  calendarAuthority,
  timeZoneChangeDeferred,
  nextTimeZoneChangeAt,
  isFavorite,
  isStarted,
  isCompleted,
  activeAttemptStatus = null,
  actionBusy = false,
  rewardDetailsOpen,
  onToggleFavorite,
  onToggleRewardDetails,
  onStartMission,
  onCompleteMission,
  onRefreshStatus,
}: MissionDetailsProps) {
  const buttonDisabled = statusPresentation.actionDisabled || rewardPreviewStatus === "blocked" || actionBusy;
  const refreshDisabled = actionBusy
    || statusPresentation.state === "login-required"
    || statusPresentation.state === "loading";

  return (
    <aside className="h-full overflow-hidden rounded-[6px] bg-[#003d46]/95 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.2)]">
      <div className="flex h-full flex-col overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-2xl font-extrabold tracking-wide">Missionsdetails</h2>
          <button
            type="button"
            onClick={() => onToggleFavorite(mission.id)}
            className={`text-5xl leading-none transition hover:scale-125 ${isFavorite ? "text-yellow-400" : "text-white/25 hover:text-yellow-300"}`}
            aria-label={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
          >
            ★
          </button>
        </div>

        <MissionLifecyclePanel
          presentation={statusPresentation}
          periodLabel={periodLabel}
          timeZone={timeZone}
          calendarAuthority={calendarAuthority}
          timeZoneChangeDeferred={timeZoneChangeDeferred}
          nextTimeZoneChangeAt={nextTimeZoneChangeAt}
          attemptStatus={activeAttemptStatus}
          compact
        />

        {isCompleted ? (
          <div className="mt-3 rounded-xl border border-yellow-400/50 bg-yellow-500/15 px-3 py-2 text-center text-sm font-bold text-yellow-200">
            🏆 Interne Ledger-Buchung bestätigt · +{reward} WFXP
          </div>
        ) : null}

        <div className={`mt-3 rounded-xl border px-3 py-2 text-center text-sm font-bold ${getPreviewBadgeClasses(rewardPreviewStatus)}`}>
          {rewardPreviewLabel} · bis zu +{reward} WFXP
        </div>

        <div className="mt-3 flex justify-center text-6xl text-cyan-300">{missionIcon(mission.type)}</div>
        <h3 className="mt-3 text-center text-3xl font-extrabold leading-tight">{mission.title}</h3>
        <p className="mt-3 text-center text-base leading-tight text-white/90">{mission.description}</p>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-sm text-white/75">
            <span>Server-/Reviewfortschritt</span>
            <span className="font-bold">{statusPresentation.progress}%</span>
          </div>
          <div className="h-5 overflow-hidden rounded bg-[#062e34]">
            <div className="h-full rounded bg-cyan-300 transition-all duration-700" style={{ width: `${statusPresentation.progress}%` }} />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-base">
          <span>Schwierigkeit</span>
          <span className="font-bold">{mission.difficulty}</span>
        </div>

        <div className="mt-2 flex items-center gap-3 text-lg font-bold">
          <Image src="/coin.png" alt="WellFit-XP" width={34} height={34} className="rounded-full" />
          <span>+ {reward} interne WFXP nach Freigabe und Abschluss</span>
        </div>

        <div className="mt-3 overflow-hidden rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-xs text-white/80">
          <button
            type="button"
            onClick={onToggleRewardDetails}
            className="flex w-full items-center justify-between p-3 text-left font-bold text-yellow-300"
          >
            <span>Abrechnung und Sicherheitsgrenzen</span>
            <span>{rewardDetailsOpen ? "−" : "+"}</span>
          </button>
          {rewardDetailsOpen && (
            <div className="border-t border-yellow-500/20 px-3 pb-3">
              <div className="mt-2 grid grid-cols-2 gap-1">
                <span>Server-Katalogwert</span>
                <span className="text-right">{mission.reward} WFXP</span>
                <span>Vielfalt-Vorschau</span>
                <span className="text-right">×{diversityMultiplier.toFixed(2)}</span>
                <span>Anti-Farming-Vorschau</span>
                <span className="text-right">×{antiFarmingMultiplier.toFixed(2)}</span>
                <span>Reserve-Vorschau</span>
                <span className="text-right">×{reserveRewardRate.toFixed(2)}</span>
              </div>
              <p className="mt-2 text-cyan-50/80">
                Die Vorschaufaktoren sind nicht buchungswirksam. In Beta 1 autorisiert ausschließlich der Server den Katalogwert nach Review und verhindert Mehrfachabschlüsse am selben nutzerlokalen Kalendertag.
              </p>
              {capReasons.length > 0 && (
                <p className="mt-2 text-yellow-100/80">Hinweise: {capReasons.join(" · ")}</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 rounded-xl border border-cyan-300/20 bg-cyan-500/10 p-3 text-xs leading-relaxed text-cyan-50/80">
          Beta-Regel: Start, Bestätigung, Review, Abschluss und WFXP-Buchung laufen serverseitig. Der Browser schreibt weder XP noch Level, Streaks, Missionsabschlüsse oder Buddy-Werte. WFXP sind interne, nicht übertragbare Fortschrittspunkte ohne Geldwert und ohne Auszahlungsfunktion.
        </div>

        <button
          type="button"
          onClick={() => isStarted ? onCompleteMission(mission.id) : onStartMission(mission.id)}
          disabled={buttonDisabled}
          className={`mt-4 w-full rounded-[16px] px-4 py-3 text-lg font-extrabold transition active:scale-95 ${buttonDisabled ? "cursor-not-allowed bg-yellow-600/70" : isStarted ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {statusPresentation.actionLabel}
        </button>

        <button
          type="button"
          onClick={onRefreshStatus}
          disabled={refreshDisabled}
          className="mt-2 w-full rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Serverstatus aktualisieren
        </button>
      </div>
    </aside>
  );
}
