"use client";

type DailyHeaderProps = {
  diversityCount: number;
  completedCount: number;
  dailyGoal: number;
  goalCompleted: boolean;
  currentStreak: number;
  longestStreak: number;
  streakBonus: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
};

export default function DailyHeader(_props: DailyHeaderProps) {
  void _props;
  return (
    <div className="mb-4 flex min-h-[78px] items-start justify-between gap-4 pr-[120px]">
      <div>
        <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">Tagesmissionen</h1>
      </div>
    </div>
  );
}
