import type { Challenge } from "./challengeData";

type ChallengeDetailsPanelProps = {
  challenge: Challenge;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPrepareRoute: () => void;
  onCompleteChallenge: () => void;
};

export default function ChallengeDetailsPanel({
  challenge,
  isFavorite,
  onToggleFavorite,
  onPrepareRoute,
  onCompleteChallenge,
}: ChallengeDetailsPanelProps) {
  return (
    <div className="min-h-0 overflow-y-auto rounded-[22px] border border-cyan-300/10 bg-[#053841]/95 p-5 shadow-[0_10px_28px_rgba(0,0,0,0.18)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="rounded-lg bg-cyan-500/20 px-3 py-2 text-sm font-bold text-cyan-300">
          {challenge.category}
        </div>
        <button onClick={onToggleFavorite} className={`text-2xl ${isFavorite ? "text-yellow-400" : "text-white/30"}`}>★</button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-400/20 text-3xl">{challenge.icon}</div>
        <h2 className="text-2xl font-bold text-white">{challenge.title}</h2>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-white/85">{challenge.description}</p>

      <div className="mb-4 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-3 text-xs leading-relaxed text-white/65">
        <span className="font-black uppercase tracking-[0.16em] text-cyan-200">Bewegungskontext</span><br />
        WellFit sucht automatisch deinen Standort, damit lokale Challenges in deiner Umgebung Sinn ergeben. Die finale Evidence-/20m-Prüfung kommt später serverseitig.
      </div>

      <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-black/25">
        <div className="h-full rounded-full bg-cyan-300" style={{ width: "32%" }} />
      </div>

      <div className="space-y-2 text-sm text-white/80">
        <p>👥 Vor Ort aktiv: {challenge.playersActive}</p>
        <p>🏅 Max. Beta-Belohnung: bis zu {challenge.rewardPoints} interne Punkte</p>
        <p>📶 Level-Empfehlung: {challenge.level}</p>
        <p>🎁 Bewegungsziel: {challenge.movementGoal}</p>
      </div>

      <div className="mt-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3 py-3 text-xs text-white/65">
        Interne Beta-Challenge. Server-Preview kann cappen oder Review verlangen. Keine Token, keine NFTs, keine Auszahlung.
      </div>

      <div className="mt-5 grid gap-3">
        <button onClick={onPrepareRoute} className="w-full rounded-xl bg-cyan-500 px-4 py-3 text-base font-bold text-black transition hover:bg-cyan-400">
          Challenge-Route vorbereiten
        </button>
        <button onClick={onCompleteChallenge} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-bold text-white transition hover:bg-blue-700">
          Challenge prüfen & abschließen
        </button>
      </div>
    </div>
  );
}
