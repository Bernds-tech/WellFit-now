import type { BuddyState } from "../types";
import { getBuddyStatusLabel } from "../lib/buddyCopy";
import { getNextLevelProgress } from "../lib/buddyState";

type BuddyHeroProps = {
  buddy: BuddyState;
};

export default function BuddyHero({ buddy }: BuddyHeroProps) {
  const progress = getNextLevelProgress(buddy);

  return (
    <section className="rounded-[30px] bg-gradient-to-br from-[#063f46] via-[#053841] to-[#031f24] p-6 shadow-[0_14px_40px_rgba(0,0,0,0.24)]">
      <div className="flex items-start justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="grid h-[150px] w-[150px] place-items-center rounded-[34px] bg-cyan-100/10 text-7xl shadow-inner">
            🐉
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-100/60">Mein KI-Buddy</p>
            <h1 className="mt-2 text-5xl font-black leading-none text-white">{buddy.name}</h1>
            <p className="mt-2 text-lg font-bold text-cyan-200">{buddy.title}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
              <span className="rounded-full bg-orange-400 px-3 py-1 text-[#042f35]">Level {buddy.level}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-cyan-100">{getBuddyStatusLabel(buddy)}</span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-cyan-100">Tagesmodus: {buddy.dailyMode}</span>
            </div>
          </div>
        </div>

        <div className="min-w-[220px] rounded-3xl bg-black/18 p-4">
          <div className="flex items-center justify-between text-sm text-cyan-100/80">
            <span>XP bis Level {buddy.level + 1}</span>
            <span>{progress}%</span>
          </div>
          <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/30">
            <div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-3 text-sm text-white/70">{buddy.xp} / {buddy.nextLevelXp} XP</p>
          <p className="mt-2 text-2xl font-black text-yellow-300">{buddy.points} Punkte</p>
        </div>
      </div>
    </section>
  );
}
