import type { PersonalMission } from "../../types";

type MissionSummaryCardProps = {
  mission: PersonalMission;
};

const cardClass = "rounded-[22px] bg-[#053841]/85 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.12)]";

export default function MissionSummaryCard({ mission }: MissionSummaryCardProps) {
  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-2xl font-bold text-cyan-300">Heutige Mission</h2>
      <p className="text-base text-white/80">{mission.title}</p>
      <p className="mt-2 text-sm text-white/60">{mission.activity} für {mission.goal}</p>
    </div>
  );
}
