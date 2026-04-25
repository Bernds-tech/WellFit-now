import type { PersonalMission } from "../../types";

type RewardSummaryCardProps = {
  mission: PersonalMission;
};

const cardClass = "rounded-[22px] bg-[#053841]/85 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.12)]";

export default function RewardSummaryCard({ mission }: RewardSummaryCardProps) {
  return (
    <div className={cardClass}>
      <h2 className="mb-3 text-2xl font-bold text-cyan-300">Heutige Belohnungen</h2>
      <p className="text-lg text-yellow-400">Mission: +{mission.reward} Punkte</p>
      <p className="text-lg">Aktivserie: 1 Tage 🔥</p>
    </div>
  );
}
