"use client";

type DailyHeaderProps = {
  diversityCount: number;
  completedCount: number;
  dailyGoal: number;
  goalCompleted: boolean;
  currentStreak: number;
  longestStreak: number;
  streakBonus: number;
};

export default function DailyHeader({
  diversityCount,
  completedCount,
  dailyGoal,
  goalCompleted,
  currentStreak,
  longestStreak,
  streakBonus,
}: DailyHeaderProps) {
  const remaining = Math.max(0, dailyGoal - completedCount);
  const dailyProgress = Math.min(100, Math.round((completedCount / Math.max(1, dailyGoal)) * 100));

  return (
    <div className="mb-4 flex justify-between gap-4">
      <div>
        <h1 className="text-5xl font-extrabold leading-none">Tagesmissionen</h1>
        <p className="mt-1 text-lg text-cyan-100/90">Ziehe Missionen in deine 3 Tagesfelder.</p>
        <p className="mt-1 text-xs text-cyan-100/65">10 balancierte Tagesmissionen · Punkte-System aktiv</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="min-w-[125px] rounded-2xl border border-yellow-400/40 bg-[#073b44] px-4 py-2 shadow-[0_0_16px_rgba(250,204,21,0.12)]">
          <p className="text-sm font-bold text-yellow-300">🔥 Streak {currentStreak}</p>
          <p className="text-[10px] text-white/55">Best {longestStreak}</p>
        </div>

        <div className="min-w-[155px] rounded-2xl border border-cyan-300/30 bg-[#073b44] px-4 py-2 shadow-[0_0_16px_rgba(34,211,238,0.10)]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-cyan-100">🎯 Heute {completedCount}/{dailyGoal}</p>
            <span className="text-xs font-bold text-yellow-200">+{streakBonus}</span>
          </div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/25">
            <div className="h-full rounded-full bg-cyan-300 transition-all duration-700" style={{ width: `${dailyProgress}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-white/55">{goalCompleted ? "Tagesziel erfüllt" : `Noch ${remaining} bis Bonus`}</p>
        </div>

        <div className="min-w-[125px] rounded-2xl border border-green-300/30 bg-[#073b44] px-4 py-2">
          <p className="text-sm font-bold text-green-300">🌈 Vielfalt {diversityCount}/3</p>
          <p className="text-[10px] text-white/55">3 Typen = Bonus</p>
        </div>
      </div>
    </div>
  );
}
