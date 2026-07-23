import type { Beta1PendingDashboardMission } from "@/lib/beta1/clientMissionCommands";
import type { DashboardMissionPreview, PersonalMission } from "../types";

type Props = {
  mission: PersonalMission;
  missionPreview?: DashboardMissionPreview;
  stepsToday: number;
  onStartMission?: () => void;
  onCheckMissionStatus?: () => void;
  onDismissPendingMission?: () => void;
  pendingMission?: Beta1PendingDashboardMission | null;
  isSubmittingMission?: boolean;
  isCheckingMission?: boolean;
  missionCatalogLoading?: boolean;
  missionCatalogError?: string | null;
};

const reviewLabel = (pending: Beta1PendingDashboardMission) => {
  if (pending.completionStatus === "completed") return "Abgeschlossen";
  if (pending.reviewStatus === "approved") return "Evidence freigegeben";
  if (pending.reviewStatus === "rejected") return "Evidence abgelehnt";
  if (pending.reviewStatus === "needs-more-evidence") return "Mehr Evidence erforderlich";
  return "Wartet auf Admin-Review";
};

const reviewTone = (pending: Beta1PendingDashboardMission) => {
  if (pending.reviewStatus === "approved" || pending.completionStatus === "completed") {
    return "border-emerald-300/30 bg-emerald-400/10 text-emerald-100";
  }
  if (pending.reviewStatus === "rejected") {
    return "border-rose-300/30 bg-rose-400/10 text-rose-100";
  }
  if (pending.reviewStatus === "needs-more-evidence") {
    return "border-amber-300/30 bg-amber-400/10 text-amber-100";
  }
  return "border-cyan-300/30 bg-cyan-400/10 text-cyan-100";
};

export default function DashboardMissionPanel({
  mission,
  missionPreview,
  stepsToday,
  onStartMission,
  onCheckMissionStatus,
  onDismissPendingMission,
  pendingMission = null,
  isSubmittingMission = false,
  isCheckingMission = false,
  missionCatalogLoading = false,
  missionCatalogError = null,
}: Props) {
  const progress = Math.min(100, Math.round((stepsToday / mission.steps) * 100));
  const previewStatus = missionPreview?.decision.status;
  const cappedPoints = missionPreview?.decision.cappedPoints ?? mission.reward;
  const previewSource = missionPreview?.source === "server" ? "Server-Preview" : "Lokaler Fallback";
  const serverMissionReady = Boolean(mission.serverBacked && mission.id);
  const hasPendingMission = Boolean(pendingMission);
  const primaryDisabled = previewStatus === "blocked"
    || isSubmittingMission
    || isCheckingMission
    || missionCatalogLoading
    || (!serverMissionReady && !hasPendingMission);

  const buttonLabel = previewStatus === "blocked"
    ? "Blockiert"
    : isSubmittingMission
      ? "Wird eingereicht..."
      : isCheckingMission
        ? "Status wird geprüft..."
        : hasPendingMission
          ? "Prüfstatus aktualisieren"
          : missionCatalogLoading
            ? "Missionen werden geladen..."
            : serverMissionReady
              ? "Mission sicher starten"
              : "Keine Server-Mission";

  const onPrimaryAction = hasPendingMission ? onCheckMissionStatus : onStartMission;
  const dismissAllowed = pendingMission?.reviewStatus === "rejected"
    || pendingMission?.reviewStatus === "needs-more-evidence";

  return (
    <div className="rounded-[24px] bg-gradient-to-br from-[#063f46] to-[#052f35] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold">{mission.title}</h2>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${serverMissionReady ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200" : "border-amber-300/30 bg-amber-400/10 text-amber-100"}`}>
              {serverMissionReady ? "Server-Mission" : "Persönlicher Vorschlag"}
            </span>
          </div>

          <p className="mb-4 text-sm text-cyan-100/80">
            Ziel: {mission.steps} Schritte · Fokus: {mission.focus}
          </p>
        </div>

        {missionPreview && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100/50">Reward Preview</p>
            <p className="mt-1 text-sm font-black text-cyan-100">{missionPreview.label}</p>
            <p className="mt-1 text-[10px] font-semibold text-white/45">{previewSource}</p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="mb-1 flex justify-between text-xs">
          <span>{stepsToday} Schritte</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-black/30">
          <div
            className="h-full bg-green-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {missionCatalogError && (
        <div className="mb-4 rounded-2xl border border-amber-300/25 bg-amber-400/10 p-3 text-xs leading-relaxed text-amber-100">
          {missionCatalogError} Der persönliche Vorschlag bleibt sichtbar, kann aber keine Punkte oder XP vergeben.
        </div>
      )}

      {pendingMission && (
        <div className={`mb-4 rounded-2xl border p-3 text-xs leading-relaxed ${reviewTone(pendingMission)}`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-black">{reviewLabel(pendingMission)}</span>
            <span className="font-mono text-[10px] opacity-70">Attempt {pendingMission.attemptId.slice(0, 8)}…</span>
          </div>
          <p className="mt-2">
            Mission: {pendingMission.missionTitle}. Eingereicht am {new Date(pendingMission.submittedAt).toLocaleString("de-AT")}.
          </p>
          {pendingMission.lastCheckedAt && (
            <p className="mt-1 opacity-75">Zuletzt geprüft: {new Date(pendingMission.lastCheckedAt).toLocaleString("de-AT")}</p>
          )}
          <p className="mt-1 opacity-75">Pending-Verweis liegt nur lokal; Review, Completion und Ledger bleiben serverseitig.</p>
        </div>
      )}

      <div className="mb-4 rounded-2xl bg-black/18 p-3 text-xs leading-relaxed text-white/65">
        <span className="font-bold text-cyan-100">Beta-1-Sicherheit:</span>{" "}
        Das Dashboard schreibt bei Missionen keine Punkte, XP, Level oder Avatarwerte direkt. Es startet einen serverseitigen Attempt, reicht Evidence zur Admin-Prüfung ein und fordert Completion erst nach freigegebener Evidence an.
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-green-300">
          bis zu +{cappedPoints} WFXP nach Review{previewStatus === "manual_review" ? " · Review erforderlich" : ""}
        </span>
        <div className="flex flex-wrap gap-2">
          {dismissAllowed && (
            <button
              type="button"
              onClick={onDismissPendingMission}
              disabled={isCheckingMission}
              className="rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 hover:bg-white/10 disabled:opacity-40"
            >
              Vorgang schließen
            </button>
          )}
          <button
            type="button"
            onClick={onPrimaryAction}
            disabled={primaryDisabled}
            className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold hover:bg-orange-400 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
