import type { DashboardMissionPreview, PersonalMission } from "../types";

type Props = {
  mission: PersonalMission;
  missionPreview?: DashboardMissionPreview;
  stepsToday: number;
  onStartMission?: () => void;
};

export default function DashboardMissionPanel({ mission, missionPreview, stepsToday, onStartMission }: Props) {
  const progress = Math.min(100, Math.round((stepsToday / mission.steps) * 100));
  const previewStatus = missionPreview?.decision.status;
  const cappedPoints = missionPreview?.decision.cappedPoints ?? mission.reward;

  return (
    <div className="rounded-[24px] bg-gradient-to-br from-[#063f46] to-[#052f35] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold mb-2">{mission.title}</h2>

          <p className="text-sm text-cyan-100/80 mb-4">
            Ziel: {mission.steps} Schritte · Fokus: {mission.focus}
          </p>
        </div>

        {missionPreview && (
          <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-100/50">Reward Preview</p>
            <p className="mt-1 text-sm font-black text-cyan-100">{missionPreview.label}</p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span>{stepsToday} Schritte</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-black/30 overflow-hidden">
          <div
            className="h-full bg-green-400 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mb-4 rounded-2xl bg-black/18 p-3 text-xs leading-relaxed text-white/65">
        <span className="font-bold text-cyan-100">Beta-Hinweis:</span> Diese Mission erzeugt aktuell nur interne Punkte/XP.
        Finale Abrechnung, Anti-Cheat und spätere Token-Migration bleiben serverseitig und kommen erst nach stabilem internen Ledger.
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-green-300">
          +{cappedPoints} interne Punkte{previewStatus === "manual_review" ? " · Review" : ""}
        </span>
        <button
          onClick={onStartMission}
          className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold hover:bg-orange-400"
        >
          Mission starten
        </button>
      </div>
    </div>
  );
}
