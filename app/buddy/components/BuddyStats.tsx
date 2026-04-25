import type { BuddyState, BuddyStat } from "../types";

type BuddyStatsProps = {
  buddy: BuddyState;
};

const statsFromBuddy = (buddy: BuddyState): BuddyStat[] => [
  { label: "Energie", value: buddy.energy, helper: "Kraft für Abenteuer und Training" },
  { label: "Hunger", value: buddy.hunger, helper: "Pflege- und Futterzustand" },
  { label: "Stimmung", value: buddy.mood, helper: "Wie lebendig Flammi wirkt" },
  { label: "Sauberkeit", value: buddy.cleanliness, helper: "Zustand von Buddy und Zuhause" },
  { label: "Bindung", value: buddy.bond, helper: "Eure emotionale Verbindung" },
  { label: "Loyalität", value: buddy.loyalty, helper: "Wie stark Flammi bei dir bleibt" },
  { label: "Neugier", value: buddy.curiosity, helper: "Drang nach Abenteuer und AR-Suche" },
];

export default function BuddyStats({ buddy }: BuddyStatsProps) {
  return (
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      {statsFromBuddy(buddy).map((stat) => (
        <div key={stat.label} className="rounded-[24px] bg-[#053841]/85 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
          <div className="flex items-center justify-between text-sm font-bold text-cyan-100/80">
            <span>{stat.label}</span>
            <span>{stat.value}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/25">
            <div className="h-full rounded-full bg-cyan-300" style={{ width: `${stat.value}%` }} />
          </div>
          <p className="mt-3 text-xs text-white/55">{stat.helper}</p>
        </div>
      ))}
    </section>
  );
}
