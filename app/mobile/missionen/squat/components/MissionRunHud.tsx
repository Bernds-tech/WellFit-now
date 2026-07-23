import type { Beta1MissionReviewStatus } from "@/lib/beta1/clientMissionCommands";
import type { ExerciseCounterState } from "@/lib/vision/visionTypes";

type MissionRunHudProps = {
  missionTitle: string;
  countdown: number;
  isRunning: boolean;
  targetReached: boolean;
  serverCompleted: boolean;
  hasOpenReview: boolean;
  reviewStatus?: Beta1MissionReviewStatus | null;
  isSavingMission?: boolean;
  startDisabled?: boolean;
  actionLabel: string;
  counter: ExerciseCounterState;
  targetReps: number;
  onStart: () => void;
  onStop: () => void;
  onComplete: () => void;
};

function statusText({
  isSavingMission,
  serverCompleted,
  reviewStatus,
  targetReached,
  countdown,
  feedback,
}: {
  isSavingMission: boolean;
  serverCompleted: boolean;
  reviewStatus?: Beta1MissionReviewStatus | null;
  targetReached: boolean;
  countdown: number;
  feedback: string;
}) {
  if (isSavingMission) return "Server verarbeitet Tracking, Evidence oder Completion. Bitte kurz warten.";
  if (serverCompleted) return "Mission serverseitig abgeschlossen. Die WFXP-Buchung ist im Ledger gespeichert.";
  if (reviewStatus === "approved") return "Evidence ist freigegeben. Prüfe den Status, um die Server-Completion auszuführen.";
  if (reviewStatus === "pending-server-review") return "Pose-Evidence wartet auf Admin-Prüfung. Noch keine WFXP-Gutschrift.";
  if (reviewStatus === "rejected") return "Evidence wurde abgelehnt. Wiederhole die Mission und reiche eine neue Pose-Zusammenfassung ein.";
  if (reviewStatus === "needs-more-evidence") return "Weitere Evidence erforderlich. Wiederhole die Mission für eine neue Einreichung.";
  if (targetReached) return "Ziel erreicht. Reiche die lokale Pose-Zusammenfassung zur Admin-Prüfung ein.";
  if (countdown > 0) return "Stelle dein Handy so auf, dass dein ganzer Körper sichtbar ist.";
  return feedback;
}

export default function MissionRunHud({
  missionTitle,
  countdown,
  isRunning,
  targetReached,
  serverCompleted,
  hasOpenReview,
  reviewStatus = null,
  isSavingMission = false,
  startDisabled = false,
  actionLabel,
  counter,
  targetReps,
  onStart,
  onStop,
  onComplete,
}: MissionRunHudProps) {
  const progress = serverCompleted ? 100 : Math.min(100, Math.round((counter.validReps / targetReps) * 100));
  const canRunServerAction = targetReached || hasOpenReview;

  return (
    <div className="absolute inset-x-3 bottom-4 z-20 rounded-[26px] bg-[#042f35]/88 p-4 text-white shadow-[0_16px_38px_rgba(0,0,0,0.32)] backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">Server-Review-Mission</p>
          <h1 className="mt-1 text-2xl font-black leading-none">{missionTitle}</h1>
        </div>
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-orange-400 text-2xl font-black text-[#042f35]">
          {countdown > 0 ? countdown : serverCompleted ? "✓" : counter.validReps}
        </div>
      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/12">
        <div className="h-full rounded-full bg-orange-400 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl bg-black/20 p-2">
          <p className="text-2xl font-black text-green-300">{counter.validReps}</p>
          <p className="text-[11px] text-white/55">sauber</p>
        </div>
        <div className="rounded-2xl bg-black/20 p-2">
          <p className="text-2xl font-black text-red-300">{counter.invalidReps}</p>
          <p className="text-[11px] text-white/55">unsauber</p>
        </div>
        <div className="rounded-2xl bg-black/20 p-2">
          <p className="text-2xl font-black text-cyan-200">{counter.qualityScore}%</p>
          <p className="text-[11px] text-white/55">Qualität</p>
        </div>
      </div>

      <p className="mt-3 rounded-2xl bg-black/20 p-3 text-xs font-semibold leading-relaxed text-cyan-100/78">
        {statusText({
          isSavingMission,
          serverCompleted,
          reviewStatus,
          targetReached,
          countdown,
          feedback: counter.feedback,
        })}
      </p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onStart}
          disabled={startDisabled || isRunning || countdown > 0 || serverCompleted || isSavingMission}
          className="rounded-2xl bg-orange-400 px-3 py-3 text-sm font-black text-[#042f35] disabled:opacity-45"
        >
          Start
        </button>
        <button
          type="button"
          onClick={onStop}
          disabled={isSavingMission || serverCompleted}
          className="rounded-2xl bg-white/10 px-3 py-3 text-sm font-black text-white disabled:opacity-45"
        >
          Stop
        </button>
        <button
          type="button"
          onClick={onComplete}
          disabled={serverCompleted || !canRunServerAction || isSavingMission}
          className="rounded-2xl bg-green-300 px-3 py-3 text-sm font-black text-[#042f35] disabled:opacity-45"
        >
          {isSavingMission ? "..." : actionLabel}
        </button>
      </div>
    </div>
  );
}
