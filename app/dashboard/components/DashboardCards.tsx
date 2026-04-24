import { economyConfig } from "@/config/economy";
import type { PersonalMission } from "../types";

type Props = {
  mission: PersonalMission;
  pointsBalance: number;
  buddyEnergy: number;
  buddyHunger: number;
  stepsToday: number;
  foodPrice: number;
};

const cardClass = "rounded-[22px] bg-[#053841]/85 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.12)]";

export default function DashboardCards({
  mission,
  pointsBalance,
  buddyEnergy,
  buddyHunger,
  stepsToday,
  foodPrice,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className={cardClass}>
        <h2 className="text-2xl font-bold text-cyan-300">Deine Gesundheit</h2>
        <p className="mt-3 text-lg font-bold text-white">{stepsToday} / 10.000 Schritte</p>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-black/25">
          <div
            className="h-full rounded-full bg-cyan-300 transition-all"
            style={{ width: `${Math.min((stepsToday / 10000) * 100, 100)}%` }}
          />
        </div>
      </div>

      <div className={cardClass}>
        <h2 className="mb-3 text-2xl font-bold text-cyan-300">Heutige Mission</h2>
        <p className="text-base text-white/80">{mission.title}</p>
        <p className="mt-2 text-sm text-white/60">{mission.activity} für {mission.goal}</p>
      </div>

      <div className={cardClass}>
        <h2 className="mb-3 text-2xl font-bold text-cyan-300">Punkte</h2>
        <p className="text-4xl font-extrabold leading-tight">{pointsBalance} Punkte</p>
      </div>

      <div className={cardClass}>
        <h2 className="mb-3 text-2xl font-bold text-cyan-300">Mein Begleiter</h2>
        <div className="text-4xl">🐉</div>
        <p className="mt-3 text-lg">Energie: {buddyEnergy}%</p>
        <p className="mt-1 text-lg">Hunger: {buddyHunger}%</p>
        <p className="mt-3 text-sm text-cyan-100/70">Futterpreis: {foodPrice} Punkte</p>
      </div>

      <div className={cardClass}>
        <h2 className="mb-3 text-2xl font-bold text-cyan-300">Economy</h2>
        <p className="text-lg text-white/90">Reserve: {economyConfig.reserve}</p>
        <p className="text-lg text-white/90">Umlauf: {economyConfig.circulating}</p>
      </div>

      <div className={cardClass}>
        <h2 className="mb-3 text-2xl font-bold text-cyan-300">Heutige Belohnungen</h2>
        <p className="text-lg text-yellow-400">Mission: +{mission.reward} Punkte</p>
        <p className="text-lg">Aktivserie: 1 Tage 🔥</p>
      </div>
    </div>
  );
}
