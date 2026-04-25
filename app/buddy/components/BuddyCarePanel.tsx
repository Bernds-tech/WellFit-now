import type { BuddyState } from "../types";
import { getBuddyCareRules, getBuddyNextBestAction } from "../lib/buddyCare";

type BuddyCarePanelProps = {
  buddy: BuddyState;
};

const severityClass = {
  good: "border-green-300/25 bg-green-300/10 text-green-100",
  watch: "border-yellow-300/25 bg-yellow-300/10 text-yellow-100",
  danger: "border-red-300/25 bg-red-300/10 text-red-100",
};

export default function BuddyCarePanel({ buddy }: BuddyCarePanelProps) {
  const rules = getBuddyCareRules(buddy);
  const nextAction = getBuddyNextBestAction(buddy);

  return (
    <section className="rounded-[24px] bg-[#053841]/85 p-5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/60">Pflege & Konsequenzen</p>
          <h2 className="mt-1 text-2xl font-black text-cyan-300">Nächste gute Aktion</h2>
        </div>
        <span className="rounded-full bg-orange-400 px-3 py-1 text-xs font-black text-[#042f35]">{nextAction}</span>
      </div>

      <div className="mt-4 space-y-3">
        {rules.map((rule) => (
          <div key={rule.title} className={`rounded-2xl border p-3 ${severityClass[rule.severity]}`}>
            <h3 className="font-black">{rule.title}</h3>
            <p className="mt-1 text-sm leading-relaxed opacity-80">{rule.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
