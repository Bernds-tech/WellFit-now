"use client";

type AppFooterProps = {
  reward: number;
  brightness?: number;
};

const createFooterBackground = (brightness = 100) => {
  const ratio = Math.max(0.05, Math.min(1, brightness / 100));
  const green = Math.round(35 + ratio * 75);
  const blue = Math.round(40 + ratio * 85);
  return `rgba(2, ${green}, ${blue}, 0.96)`;
};

export default function AppFooter({ reward, brightness = 100 }: AppFooterProps) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between border-t border-cyan-400/10 px-5 py-3"
      style={{ backgroundColor: createFooterBackground(brightness) }}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-black/25 px-3 py-2">
          <p className="text-[10px] uppercase text-white/50">Letzter Login</p>
          <p className="mt-1 text-sm font-semibold text-white">Heute</p>
        </div>

        <div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-black/25 px-3 py-2 text-center">
          <p className="text-[10px] uppercase text-white/50">Reward Score</p>
          <p className="mt-1 text-lg font-bold text-white">{reward}</p>
        </div>

        <div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-black/25 px-3 py-2 text-center">
          <p className="text-[10px] uppercase text-white/50">Live Schritte</p>
          <p className="mt-1 text-sm font-semibold text-white/70">0</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xl text-white/80">
        <span>f</span>
        <span>X</span>
        <span>in</span>
      </div>
    </div>
  );
}
