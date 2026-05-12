type DashboardAvatarPanelProps = {
  buddyLevel: number;
  buddyEnergy: number;
  buddyHunger: number;
  pointsBalance: number;
  foodPrice: number;
  onFeedBuddy: () => void;
};

const getBuddyMood = (energy: number, hunger: number) => {
  if (energy < 25 || hunger < 25) return "braucht Aufmerksamkeit";
  if (energy > 75 && hunger > 75) return "voll motiviert";
  return "stabil";
};

export default function DashboardAvatarPanel({
  buddyLevel,
  buddyEnergy,
  buddyHunger,
  pointsBalance,
  foodPrice,
  onFeedBuddy,
}: DashboardAvatarPanelProps) {
  const mood = getBuddyMood(buddyEnergy, buddyHunger);
  const canFeed = pointsBalance >= foodPrice;
  const remainingAfterFood = Math.max(0, pointsBalance - foodPrice);

  return (
    <div className="rounded-[24px] bg-[#053841]/85 p-5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-100/60">Mein KI-Buddy</p>
          <h2 className="mt-1 text-2xl font-black text-cyan-300">Flammi</h2>
          <p className="mt-1 text-sm text-white/70">Level {buddyLevel} · Zustand: {mood}</p>
        </div>
        <div className="rounded-full bg-black/20 px-3 py-1 text-sm font-black text-cyan-100">LVL {buddyLevel}</div>
      </div>

      <div className="mt-4 grid grid-cols-[90px_1fr] gap-4">
        <div className="grid h-[90px] w-[90px] place-items-center rounded-3xl bg-cyan-100/10 text-5xl shadow-inner">🐉</div>
        <div className="space-y-3">
          <div>
            <div className="mb-1 flex justify-between text-xs text-white/70"><span>Energie</span><span>{buddyEnergy}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full bg-cyan-300" style={{ width: `${buddyEnergy}%` }} /></div>
          </div>
          <div>
            <div className="mb-1 flex justify-between text-xs text-white/70"><span>Hunger</span><span>{buddyHunger}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-black/25"><div className="h-full rounded-full bg-green-300" style={{ width: `${buddyHunger}%` }} /></div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-cyan-200/10 bg-cyan-100/5 p-3 text-xs leading-relaxed text-cyan-50/70">
        Futter ist ein interner Punkte-Sink. Es ist kein Kauf, kein Token, kein NFT und keine Auszahlung.
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-black/18 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">Spend Preview</p>
          <p className="mt-1 text-xs font-black text-cyan-100">Server zuerst</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/18 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">Sink-Kosten</p>
          <p className="mt-1 text-xs font-black text-cyan-100">{foodPrice} Punkte</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/18 p-3">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">Rest danach</p>
          <p className="mt-1 text-xs font-black text-cyan-100">
            {canFeed ? remainingAfterFood.toLocaleString("de-DE") : "zu wenig"}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onFeedBuddy}
        disabled={!canFeed}
        className="mt-4 w-full rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-black text-[#053841] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/50"
      >
        Füttern · {foodPrice} interne Punkte
      </button>
    </div>
  );
}