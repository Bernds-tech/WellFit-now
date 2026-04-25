import type { BuddyAction } from "../types";

type BuddyActionsProps = {
  actions: BuddyAction[];
  onAction: (action: BuddyAction) => void;
};

export default function BuddyActions({ actions, onAction }: BuddyActionsProps) {
  return (
    <section className="rounded-[24px] bg-[#053841]/85 p-5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/60">Interaktion</p>
          <h2 className="text-2xl font-black text-cyan-300">Aktionen</h2>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-100">MVP</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.type}
            type="button"
            onClick={() => onAction(action)}
            disabled={action.disabled}
            className="rounded-2xl bg-cyan-400/95 p-3 text-left text-[#043139] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-white/12 disabled:text-white/45"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-black">{action.label}</span>
              <span className="text-xs font-bold">{action.cost > 0 ? `${action.cost} P` : "frei"}</span>
            </div>
            <p className="mt-1 text-xs font-semibold opacity-80">{action.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}
