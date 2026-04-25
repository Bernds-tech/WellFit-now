import type { BuddyState } from "../types";

type BuddyEvolutionProps = {
  buddy: BuddyState;
};

const milestones = [
  { level: 1, title: "Junges Wesen", text: "Flammi lernt dich kennen." },
  { level: 2, title: "Treuer Begleiter", text: "Er reagiert stärker auf Pflege." },
  { level: 5, title: "Abenteuer-Buddy", text: "AR-Suche und Spezialfähigkeiten werden vorbereitet." },
  { level: 10, title: "Drachengefährte", text: "Später bereit für Duelle, Training und besondere Skins." },
];

export default function BuddyEvolution({ buddy }: BuddyEvolutionProps) {
  return (
    <section className="rounded-[24px] bg-[#053841]/85 p-5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/60">Entwicklung</p>
      <h2 className="mt-1 text-2xl font-black text-cyan-300">Flammis Pfad</h2>
      <div className="mt-5 space-y-3">
        {milestones.map((milestone) => {
          const reached = buddy.level >= milestone.level;
          return (
            <div key={milestone.level} className={`rounded-2xl p-3 ${reached ? "bg-cyan-300/18" : "bg-black/18"}`}>
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-black text-white">Level {milestone.level}: {milestone.title}</h3>
                <span className={`text-xs font-bold ${reached ? "text-green-300" : "text-white/45"}`}>
                  {reached ? "erreicht" : "später"}
                </span>
              </div>
              <p className="mt-1 text-sm text-white/62">{milestone.text}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
