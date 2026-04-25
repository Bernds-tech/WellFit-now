import type { MobileFocusCard } from "../types";

type MobileFocusCardsProps = {
  cards: MobileFocusCard[];
};

export default function MobileFocusCards({ cards }: MobileFocusCardsProps) {
  return (
    <section className="grid gap-3 px-4 pt-4">
      {cards.map((card) => (
        <div key={card.title} className="rounded-[24px] bg-[#053841]/90 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.14)]">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-black uppercase tracking-[0.18em] text-cyan-100/55">{card.title}</h2>
            <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-[#042f35]">{card.value}</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/72">{card.helper}</p>
        </div>
      ))}
    </section>
  );
}
