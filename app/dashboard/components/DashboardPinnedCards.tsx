"use client";

import Link from "next/link";
import DashboardPinToggle from "@/app/components/DashboardPinToggle";
import {
  dashboardCards,
  defaultPinnedDashboardCardIds,
  type DashboardCardDefinition,
  type DashboardCardSize,
} from "../lib/dashboardCards";

type DashboardPinnedCardsProps = {
  pinnedCardIds?: string[];
  cardSizes?: Partial<Record<string, DashboardCardSize>>;
  onPinnedChange?: (cardId: string, nextPinned: boolean) => void;
};

const sizeClassByCardSize: Record<DashboardCardSize, string> = {
  small: "md:col-span-1",
  medium: "md:col-span-1 xl:col-span-1",
  large: "md:col-span-2 xl:col-span-1",
  wide: "md:col-span-2 xl:col-span-2",
};

function getCardSize(card: DashboardCardDefinition, cardSizes?: Partial<Record<string, DashboardCardSize>>) {
  const requestedSize = cardSizes?.[card.id];
  if (requestedSize && card.allowedSizes.includes(requestedSize)) {
    return requestedSize;
  }

  return card.defaultSize;
}

export default function DashboardPinnedCards({
  pinnedCardIds = defaultPinnedDashboardCardIds,
  cardSizes,
  onPinnedChange,
}: DashboardPinnedCardsProps) {
  const pinnedCards = dashboardCards.filter((card) => pinnedCardIds.includes(card.id));

  if (pinnedCards.length === 0) {
    return (
      <section className="rounded-[24px] border border-cyan-300/10 bg-[#053841]/90 p-5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300/80">Mein Dashboard</p>
        <h2 className="mt-2 text-2xl font-extrabold">Noch keine Karten ausgewählt</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/70">
          Aktiviere auf Karten den Dashboard-Kreis, damit sie hier als persönliche Startzentrale erscheinen.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300/80">Mein Dashboard</p>
          <h2 className="mt-1 text-2xl font-extrabold text-white">Ausgewählte Karten</h2>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-cyan-100/70">
          Diese Karten sind die persönliche Übersicht. Auswahl, Reihenfolge und Größe werden später über settings.dashboard gespeichert.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {pinnedCards.map((card) => {
          const cardSize = getCardSize(card, cardSizes);
          const cardContent = (
            <div className="flex h-full flex-col rounded-[22px] border border-cyan-300/10 bg-[#053841]/90 p-5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300/75">{card.category}</p>
                  <h3 className="mt-2 text-xl font-extrabold leading-tight">{card.label}</h3>
                </div>
                <DashboardPinToggle
                  isPinned
                  label={`${card.label} im Dashboard anzeigen`}
                  onPinnedChange={(nextPinned) => onPinnedChange?.(card.id, nextPinned)}
                />
              </div>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/72">{card.description}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-white/50">
                <span>Größe: {cardSize}</span>
                <span>{card.requiresConsent ? "Consent nötig" : "Standardkarte"}</span>
              </div>
            </div>
          );

          return (
            <div key={card.id} className={sizeClassByCardSize[cardSize]}>
              {card.href ? (
                <Link href={card.href} className="block h-full transition hover:scale-[1.01]">
                  {cardContent}
                </Link>
              ) : (
                cardContent
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
