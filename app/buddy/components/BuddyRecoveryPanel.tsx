import type { BuddyState } from "../types";
import { getRecoveryHeadline, getRecoverySteps, getRecoveryText } from "../lib/buddyRecovery";

type BuddyRecoveryPanelProps = {
  buddy: BuddyState;
};

export default function BuddyRecoveryPanel({ buddy }: BuddyRecoveryPanelProps) {
  const steps = getRecoverySteps(buddy);

  return (
    <section className="rounded-[24px] bg-[#053841]/85 p-5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/60">Rückholmechanik</p>
          <h2 className="mt-1 text-2xl font-black text-cyan-300">{getRecoveryHeadline(buddy)}</h2>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-cyan-100">Phase 1 vorbereitet</span>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-white/70">{getRecoveryText(buddy)}</p>

      <div className="mt-4 space-y-3">
        {steps.map((step) => (
          <div key={step.label} className="rounded-2xl bg-black/18 p-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black text-white">{step.label}</h3>
              <span className={`text-xs font-bold ${step.done ? "text-green-300" : "text-yellow-200"}`}>
                {step.done ? "bereit" : "offen"}
              </span>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-white/60">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
