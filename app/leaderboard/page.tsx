import AppShell from "@/app/components/AppShell";
import { Beta1PageShell } from "@/components/beta1/Beta1Foundation";
import Beta1Leaderboard from "@/components/beta1/Beta1Leaderboard";

export default function LeaderboardPage() {
  return (
    <AppShell contentClassName="px-7 py-5 pb-4 overflow-y-auto">
      <Beta1PageShell
        title="Beta-1 Leaderboard"
        subtitle="Privacy-safe und read-only: zeigt nur sichere Projektionen ohne öffentliche Kinderprofile, ohne sensible Rohdaten und ohne clientseitige Ranking-/Reward-Authority."
      >
        <Beta1Leaderboard />
      </Beta1PageShell>
    </AppShell>
  );
}
