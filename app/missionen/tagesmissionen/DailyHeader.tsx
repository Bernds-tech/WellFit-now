"use client";

type DailyHeaderProps = {
  diversityCount: number;
};

export default function DailyHeader({ diversityCount }: DailyHeaderProps) {
  return (
    <div className="mb-4 flex justify-between gap-4">
      <div>
        <h1 className="text-5xl font-extrabold leading-none">Tagesmissionen</h1>
        <p className="mt-1 text-lg text-cyan-100/90">Ziehe Missionen in deine 3 Tagesfelder.</p>
        <p className="mt-1 text-xs text-cyan-100/65">10 balancierte Tagesmissionen · Punkte-System aktiv</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="rounded-2xl border border-yellow-400/40 bg-[#073b44] px-4 py-2">
          <p className="text-sm font-bold text-yellow-300">🔥 Streak 0</p>
          <p className="text-[10px] text-white/55">Best 0</p>
        </div>

        <div className="rounded-2xl border border-cyan-300/30 bg-[#073b44] px-4 py-2">
          <p className="text-sm font-bold text-cyan-100">🎯 Heute 0/3</p>
          <p className="text-[10px] text-white/55">Noch 3 bis Bonus</p>
        </div>

        <div className="rounded-2xl border border-green-300/30 bg-[#073b44] px-4 py-2">
          <p className="text-sm font-bold text-green-300">🌈 Vielfalt {diversityCount}/3</p>
          <p className="text-[10px] text-white/55">3 Typen = Bonus</p>
        </div>
      </div>
    </div>
  );
}
