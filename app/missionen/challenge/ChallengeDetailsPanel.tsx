import type { Beta1MissionReviewStatus } from "@/lib/beta1/clientMissionCommands";
import type { Challenge } from "./challengeData";

type ChallengeDetailsPanelProps = {
  challenge: Challenge;
  isFavorite: boolean;
  progress: number;
  isStarted: boolean;
  isCompleted: boolean;
  reviewStatus?: Beta1MissionReviewStatus | null;
  attemptStatus?: string | null;
  actionBusy?: boolean;
  actionDisabled?: boolean;
  actionLabel: string;
  onToggleFavorite: () => void;
  onPrepareRoute: () => void;
  onContinueChallenge: () => void;
};

function reviewStatusLabel(status?: Beta1MissionReviewStatus | null) {
  if (status === "approved") return "Evidence freigegeben";
  if (status === "rejected") return "Evidence abgelehnt";
  if (status === "needs-more-evidence") return "Neue Evidence erforderlich";
  if (status === "pending-server-review") return "Admin-Review offen";
  return "Server-Attempt gestartet";
}

export default function ChallengeDetailsPanel({
  challenge,
  isFavorite,
  progress,
  isStarted,
  isCompleted,
  reviewStatus = null,
  attemptStatus = null,
  actionBusy = false,
  actionDisabled = false,
  actionLabel,
  onToggleFavorite,
  onPrepareRoute,
  onContinueChallenge,
}: ChallengeDetailsPanelProps) {
  return (
    <div className="min-h-0 overflow-y-auto rounded-[22px] border border-cyan-300/10 bg-[#053841]/95 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="rounded-lg bg-cyan-500/20 px-3 py-2 text-sm font-bold text-cyan-300">
          {challenge.category}
        </div>
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`text-2xl ${isFavorite ? "text-yellow-400" : "text-white/30"}`}
          aria-label={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
        >
          ★
        </button>
      </div>

      {isCompleted ? (
        <div className="mb-4 rounded-xl border border-emerald-300/40 bg-emerald-400/15 px-3 py-2 text-center text-sm font-bold text-emerald-100">
          🏆 Serverseitig abgeschlossen · +{challenge.rewardWfxp} WFXP
        </div>
      ) : isStarted ? (
        <div className="mb-4 rounded-xl border border-cyan-300/35 bg-cyan-400/10 px-3 py-2 text-center text-sm font-bold text-cyan-100">
          {reviewStatusLabel(reviewStatus)}
          {attemptStatus ? <span className="mt-1 block text-[10px] font-semibold text-cyan-100/55">Attempt: {attemptStatus}</span> : null}
        </div>
      ) : null}

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/20 text-3xl">{challenge.icon}</div>
        <h2 className="text-2xl font-bold text-white">{challenge.title}</h2>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-white/85">{challenge.description}</p>

      <div className="mb-4 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-3 text-xs leading-relaxed text-white/65">
        <span className="font-black uppercase tracking-[0.16em] text-cyan-200">Bewegungskontext</span><br />
        Die Karte hilft dir, die Challenge-Route vorzubereiten. Eine Route oder lokale Browsermarkierung autorisiert weder Abschluss noch WFXP. Dafür sind Evidence-Review und Server-Completion erforderlich.
      </div>

      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-white/65">
        <span>Server-/Reviewfortschritt</span>
        <span>{progress}%</span>
      </div>
      <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-black/25">
        <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="space-y-2 text-sm text-white/80">
        <p>👥 Vor Ort aktiv: {challenge.playersActive}</p>
        <p>🏅 Server-Katalogwert: +{challenge.rewardWfxp} WFXP nach Freigabe</p>
        <p>📶 Level-Empfehlung: {challenge.level}</p>
        <p>🎁 Bewegungsziel: {challenge.movementGoal}</p>
      </div>

      <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-3 text-xs leading-relaxed text-white/65">
        Beta-Regel: WFXP werden höchstens einmal pro Nutzer und Challenge im serverseitigen Ledger gebucht. WFXP haben keinen Geldwert; keine Token, NFTs oder Auszahlung.
      </div>

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={onPrepareRoute}
          className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-base font-bold text-black transition hover:bg-cyan-400"
        >
          Challenge-Route vorbereiten
        </button>
        <button
          type="button"
          onClick={onContinueChallenge}
          disabled={actionDisabled || actionBusy || isCompleted}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {actionBusy ? "Server wird kontaktiert..." : actionLabel}
        </button>
      </div>
    </div>
  );
}
