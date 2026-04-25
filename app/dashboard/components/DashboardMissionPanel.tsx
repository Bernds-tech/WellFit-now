import type { PersonalMission } from "../types";

type Props = {
  mission: PersonalMission;
  stepsToday: number;
  onStartMission?: () => void;
};

export default function DashboardMissionPanel({ mission, stepsToday, onStartMission }: Props) {
  const progress = Math.min(100, Math.round((stepsToday / mission.steps) * 100));

  return (
    <div className="rounded-[24px] bg-gradient-to-br from-[#063f46] to-[#052f35] p-6 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
      <h2 className="text-2xl font-bold mb-2">{mission.title}</h2>

      <p className="text-sm text-cyan-100/80 mb-4">
        Ziel: {mission.steps} Schritte · Fokus: {mission.focus}
      </p>

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

      <div className="flex items-center justify-between">
        <span className="text-sm text-green-300">+{mission.reward} Punkte</span>
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
