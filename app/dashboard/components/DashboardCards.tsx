import type { PersonalMission } from "../types";
import BuddyStatusCard from "./cards/BuddyStatusCard";
import EconomyReserveCard from "./cards/EconomyReserveCard";
import HealthProgressCard from "./cards/HealthProgressCard";
import MissionSummaryCard from "./cards/MissionSummaryCard";
import PointsBalanceCard from "./cards/PointsBalanceCard";
import RewardSummaryCard from "./cards/RewardSummaryCard";

type Props = {
  mission: PersonalMission;
  pointsBalance: number;
  buddyEnergy: number;
  buddyHunger: number;
  stepsToday: number;
  foodPrice: number;
  onFeedBuddy?: () => void;
};

export default function DashboardCards({
  mission,
  pointsBalance,
  buddyEnergy,
  buddyHunger,
  stepsToday,
  foodPrice,
  onFeedBuddy,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <HealthProgressCard stepsToday={stepsToday} />
      <MissionSummaryCard mission={mission} />
      <PointsBalanceCard pointsBalance={pointsBalance} />
      <BuddyStatusCard
        buddyEnergy={buddyEnergy}
        buddyHunger={buddyHunger}
        foodPrice={foodPrice}
        onFeedBuddy={onFeedBuddy}
      />
      <EconomyReserveCard />
      <RewardSummaryCard mission={mission} />
    </div>
  );
}
