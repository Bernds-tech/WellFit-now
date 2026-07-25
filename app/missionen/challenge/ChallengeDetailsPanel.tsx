import MissionLifecyclePanel from "@/components/mission/MissionLifecyclePanel";
import type { Beta1NearbyMissionLocation } from "@/lib/beta1/clientNearbyMissionLocations";
import type { MissionStatusPresentation } from "@/lib/beta1/missionStatusPresentation.mjs";
import type { Challenge } from "./challengeData";

type ChallengeDetailsPanelProps = {
  challenge: Challenge;
  location: Beta1NearbyMissionLocation | null;
  activeLocationTitle?: string | null;
  activeStartDistanceMeters?: number | null;
  isFavorite: boolean;
  isCompleted: boolean;
  presentation: MissionStatusPresentation;
  attemptStatus?: string | null;
  actionBusy?: boolean;
  actionDisabled?: boolean;
  routeDisabled?: boolean;
  onToggleFavorite: () => void;
  onPrepareRoute: () => void;
  onContinueChallenge: () => void;
  onRefreshStatus: () => void;
};

function formatDistance(distanceKm: number) {
  return distanceKm < 1
    ? `${Math.max(1, Math.round(distanceKm * 1000))} m`
    : `${distanceKm.toFixed(1)} km`;
}

export default function ChallengeDetailsPanel({
  challenge,
  location,
  activeLocationTitle = null,
  activeStartDistanceMeters = null,
  isFavorite,
  isCompleted,
  presentation,
  attemptStatus = null,
  actionBusy = false,
  actionDisabled = false,
  routeDisabled = false,
  onToggleFavorite,
  onPrepareRoute,
  onContinueChallenge,
  onRefreshStatus,
}: ChallengeDetailsPanelProps) {
  const locationTitle = activeLocationTitle ?? location?.title ?? "Kein veröffentlichter Challenge-Ort ausgewählt";
  const refreshDisabled = actionBusy
    || presentation.state === "login-required"
    || presentation.state === "loading";

  return (
    <div className="min-h-0 overflow-y-auto rounded-[22px] border border-cyan-300/10 bg-[#053841]/95 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="rounded-lg bg-cyan-500/20 px-3 py-2 text-sm font-bold text-cyan-300">{challenge.category}</div>
        <button
          type="button"
          onClick={onToggleFavorite}
          className={`text-2xl ${isFavorite ? "text-yellow-400" : "text-white/30"}`}
          aria-label={isFavorite ? "Aus Favoriten entfernen" : "Zu Favoriten hinzufügen"}
        >
          ★
        </button>
      </div>

      <MissionLifecyclePanel
        presentation={presentation}
        periodLabel="Einmal pro Nutzer und Challenge"
        authorityLabel="Serverseitig veröffentlichter Challenge-Ort"
        attemptStatus={attemptStatus}
        resumeDetail="Der vorhandene ortsgebundene Vorgang wird fortgesetzt. Startort, Attempt und Reward-Grenze bleiben erhalten."
        compact
      />

      {isCompleted ? (
        <div className="mt-4 rounded-xl border border-emerald-300/40 bg-emerald-400/15 px-3 py-2 text-center text-sm font-bold text-emerald-100">
          🏆 Interne Ledger-Buchung bestätigt · +{challenge.rewardWfxp} WFXP
        </div>
      ) : null}

      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/20 text-3xl">{challenge.icon}</div>
        <h2 className="text-2xl font-bold text-white">{challenge.title}</h2>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-white/85">{challenge.description}</p>

      <div className="mt-4 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-3 text-xs leading-relaxed text-white/70">
        <span className="font-black uppercase tracking-[0.16em] text-cyan-200">Challenge-Ort</span>
        <p className="mt-2 text-sm font-black text-white">{locationTitle}</p>
        {location && !activeLocationTitle && (
          <p className="mt-1">
            {formatDistance(location.distanceKm)} entfernt
            {location.locality ? ` · ${location.locality}` : ""}
            {location.countryCode ? ` · ${location.countryCode}` : ""}
          </p>
        )}
        {activeLocationTitle && activeStartDistanceMeters !== null && (
          <p className="mt-1">Start bei {activeStartDistanceMeters} m Entfernung serverseitig autorisiert.</p>
        )}
        <p className="mt-2 text-white/55">
          Eine neue oder ergänzte Bestätigung ist nur innerhalb von 500 Metern des sicher veröffentlichten Startorts möglich. Übermittelte Rohkoordinaten werden nicht im Challenge-Datensatz gespeichert.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs font-semibold text-white/65">
        <span>Server-/Reviewfortschritt</span>
        <span>{presentation.progress}%</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-black/25">
        <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${presentation.progress}%` }} />
      </div>

      <div className="mt-5 space-y-2 text-sm text-white/80">
        <p>📍 Ortsautorität: veröffentlichter Ort in deiner Umgebung</p>
        <p>🏅 Server-Katalogwert: +{challenge.rewardWfxp} interne WFXP nach Freigabe und Abschluss</p>
        <p>📶 Level-Empfehlung: {challenge.level}</p>
        <p>🎁 Bewegungsziel: {challenge.movementGoal}</p>
      </div>

      <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-3 text-xs leading-relaxed text-white/65">
        Beta-Regel: Interne WFXP werden höchstens einmal pro Nutzer und Challenge im serverseitigen Ledger gebucht. Sie sind nicht übertragbar, haben keinen Geldwert und keine Auszahlungsfunktion.
      </div>

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={onPrepareRoute}
          disabled={routeDisabled}
          className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-base font-bold text-black transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-45"
        >
          Challenge-Ort auf Karte vorbereiten
        </button>
        <button
          type="button"
          onClick={onContinueChallenge}
          disabled={actionDisabled || presentation.actionDisabled || actionBusy || isCompleted}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {presentation.actionLabel}
        </button>
        <button
          type="button"
          onClick={onRefreshStatus}
          disabled={refreshDisabled}
          className="w-full rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300/15 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Serverstatus aktualisieren
        </button>
      </div>
    </div>
  );
}
