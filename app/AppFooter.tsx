"use client";

export default function AppFooter({ reward }: { reward: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-cyan-400/10 bg-[#062f35]/95 px-5 py-3">
      <div className="flex items-center gap-3">
        <div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2">
          <p className="text-[10px] uppercase text-white/50">Letzter Login</p>
          <p className="mt-1 text-sm font-semibold text-white">Heute</p>
        </div>

        <div className="min-w-[150px] rounded-xl border border-yellow-500/60 bg-[#041f24] px-3 py-2 text-center">
          <p className="text-[10px] uppercase text-white/50">Reward Score</p>
          <p className="mt-1 text-lg font-bold text-white">{reward}</p>
        </div>

        <div className="min-w-[150px] rounded-xl border border-cyan-400/10 bg-[#041f24] px-3 py-2 text-center">
          <p className="text-[10px] uppercase text-white/50">Live Schritte</p>
          <p className="mt-1 text-sm font-semibold text-white/70">0</p>
        </div>
      </div>

      <div className="flex items-center gap-3 text-xl text-white/80">
        <span>f</span>
        <span>𝕏</span>
        <span>in</span>
      </div>
    </div>
  );
}
