"use client";

import Link from "next/link";
import type { PointerEvent as ReactPointerEvent } from "react";
import DashboardPinToggle from "@/app/components/DashboardPinToggle";
import {
  dashboardCards,
  defaultPinnedDashboardCardIds,
  type DashboardCardDefinition,
  type DashboardCardSize,
} from "../lib/dashboardCards";

type DashboardCardDimensions = {
  width: number;
  height: number;
};

type DashboardPinnedCardsProps = {
  pinnedCardIds?: string[];
  cardSizes?: Partial<Record<string, DashboardCardSize>>;
  cardDimensions?: Partial<Record<string, DashboardCardDimensions>>;
  editable?: boolean;
  enableLinks?: boolean;
  onPinnedChange?: (cardId: string, nextPinned: boolean) => void;
  onSizeChange?: (cardId: string, nextSize: DashboardCardSize) => void;
  onDimensionsChange?: (cardId: string, nextDimensions: DashboardCardDimensions) => void;
  onMoveCard?: (cardId: string, direction: "up" | "down") => void;
};

const sizeClassByCardSize: Record<DashboardCardSize, string> = {
  small: "sm:col-span-1",
  medium: "sm:col-span-1 xl:col-span-1",
  large: "sm:col-span-2 xl:col-span-1",
  wide: "sm:col-span-2 xl:col-span-2",
};

const defaultDimensionsBySize: Record<DashboardCardSize, DashboardCardDimensions> = {
  small: { width: 260, height: 230 },
  medium: { width: 330, height: 270 },
  large: { width: 420, height: 330 },
  wide: { width: 620, height: 330 },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

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
  cardDimensions,
  editable = false,
  enableLinks = true,
  onPinnedChange,
  onDimensionsChange,
}: DashboardPinnedCardsProps) {
  const pinnedCards = pinnedCardIds
    .map((cardId) => dashboardCards.find((card) => card.id === cardId))
    .filter((card): card is DashboardCardDefinition => Boolean(card));

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>, cardId: string, currentDimensions: DashboardCardDimensions) => {
    if (!editable || !onDimensionsChange) return;

    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = currentDimensions.width;
    const startHeight = currentDimensions.height;

    const handlePointerMove = (pointerEvent: PointerEvent) => {
      onDimensionsChange(cardId, {
        width: clamp(startWidth + pointerEvent.clientX - startX, 220, 900),
        height: clamp(startHeight + pointerEvent.clientY - startY, 190, 620),
      });
    };

    const stopResize = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopResize);
      window.removeEventListener("pointercancel", stopResize);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopResize);
    window.addEventListener("pointercancel", stopResize);
  };

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
    <section className="min-w-0 space-y-4 overflow-hidden">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300/80">Mein Dashboard</p>
          <h2 className="mt-1 text-2xl font-extrabold text-white">Ausgewählte Karten</h2>
        </div>
        <p className="max-w-xl text-sm leading-relaxed text-cyan-100/70">
          Auswahl, Reihenfolge und Größe werden später über settings.dashboard gespeichert.
        </p>
      </div>

      <div className={editable ? "flex min-w-0 flex-wrap items-start gap-4" : "grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"}>
        {pinnedCards.map((card) => {
          const cardSize = getCardSize(card, cardSizes);
          const dimensions = cardDimensions?.[card.id] ?? defaultDimensionsBySize[cardSize];

          const cardContent = (
            <div
              className="relative flex h-full min-h-[190px] min-w-0 flex-col overflow-hidden rounded-[22px] border border-cyan-300/10 bg-[#053841]/90 p-5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]"
              style={editable ? { width: dimensions.width, height: dimensions.height } : undefined}
            >
              <div className="flex min-w-0 items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-[10px] font-black uppercase tracking-[0.22em] text-cyan-300/75">{card.category}</p>
                  <h3 className="mt-2 break-words text-[clamp(1.05rem,1.4vw,1.55rem)] font-extrabold leading-tight text-white">
                    {card.label}
                  </h3>
                </div>
                <DashboardPinToggle
                  isPinned
                  label={`${card.label} im Dashboard anzeigen`}
                  onPinnedChange={(nextPinned) => onPinnedChange?.(card.id, nextPinned)}
                />
              </div>

              <div className="mt-3 min-h-0 flex-1 overflow-y-auto pr-1">
                <p className="break-words text-[clamp(0.82rem,1vw,0.98rem)] leading-relaxed text-white/72">
                  {card.description}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 pr-8 text-xs text-white/55">
                <span className="rounded-full bg-white/5 px-3 py-1">{editable ? `${Math.round(dimensions.width)} × ${Math.round(dimensions.height)} px` : `Größe: ${cardSize}`}</span>
                <span className="rounded-full bg-white/5 px-3 py-1">{card.requiresConsent ? "Consent nötig" : "Standardkarte"}</span>
              </div>

              {editable ? (
                <button
                  type="button"
                  aria-label={`${card.label} stufenlos an der Kartenecke ziehen, um die Größe zu ändern`}
                  title="Kartenecke ziehen zum stufenlosen Vergrößern oder Verkleinern"
                  onPointerDown={(event) => startResize(event, card.id, dimensions)}
                  className="absolute bottom-0 right-0 h-12 w-12 cursor-nwse-resize bg-transparent"
                >
                  <span className="absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-orange-200/70" />
                </button>
              ) : null}
            </div>
          );

          return (
            <div key={card.id} className={editable ? "min-w-0" : `min-w-0 ${sizeClassByCardSize[cardSize]}`}>
              {card.href && enableLinks && !editable ? (
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
