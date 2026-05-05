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

type DashboardPinnedCardsProps = {
  pinnedCardIds?: string[];
  cardSizes?: Partial<Record<string, DashboardCardSize>>;
  editable?: boolean;
  enableLinks?: boolean;
  onPinnedChange?: (cardId: string, nextPinned: boolean) => void;
  onSizeChange?: (cardId: string, nextSize: DashboardCardSize) => void;
  onMoveCard?: (cardId: string, direction: "up" | "down") => void;
};

const sizeClassByCardSize: Record<DashboardCardSize, string> = {
  small: "sm:col-span-1",
  medium: "sm:col-span-1 xl:col-span-1",
  large: "sm:col-span-2 xl:col-span-1",
  wide: "sm:col-span-2 xl:col-span-2",
};

const sizeOrder: DashboardCardSize[] = ["small", "medium", "large", "wide"];

const nextSizeBySize: Record<DashboardCardSize, DashboardCardSize> = {
  small: "medium",
  medium: "large",
  large: "wide",
  wide: "small",
};

function getCardSize(card: DashboardCardDefinition, cardSizes?: Partial<Record<string, DashboardCardSize>>) {
  const requestedSize = cardSizes?.[card.id];
  if (requestedSize && card.allowedSizes.includes(requestedSize)) {
    return requestedSize;
  }

  return card.defaultSize;
}

function getNextAllowedSize(card: DashboardCardDefinition, currentSize: DashboardCardSize) {
  let nextSize = nextSizeBySize[currentSize];
  let safetyCounter = 0;

  while (!card.allowedSizes.includes(nextSize) && safetyCounter < 4) {
    nextSize = nextSizeBySize[nextSize];
    safetyCounter += 1;
  }

  return nextSize;
}

function getSizeFromDrag(card: DashboardCardDefinition, currentSize: DashboardCardSize, deltaX: number, deltaY: number) {
  const dragDistance = deltaX + deltaY * 0.7;
  const currentIndex = sizeOrder.indexOf(currentSize);
  const step = Math.max(-2, Math.min(2, Math.round(dragDistance / 110)));
  const targetIndex = Math.max(0, Math.min(sizeOrder.length - 1, currentIndex + step));
  let targetSize = sizeOrder[targetIndex];

  if (card.allowedSizes.includes(targetSize)) {
    return targetSize;
  }

  const allowedByDistance = [...card.allowedSizes].sort(
    (a, b) => Math.abs(sizeOrder.indexOf(a) - targetIndex) - Math.abs(sizeOrder.indexOf(b) - targetIndex),
  );

  targetSize = allowedByDistance[0] ?? currentSize;
  return targetSize;
}

export default function DashboardPinnedCards({
  pinnedCardIds = defaultPinnedDashboardCardIds,
  cardSizes,
  editable = false,
  enableLinks = true,
  onPinnedChange,
  onSizeChange,
  onMoveCard,
}: DashboardPinnedCardsProps) {
  const pinnedCards = pinnedCardIds
    .map((cardId) => dashboardCards.find((card) => card.id === cardId))
    .filter((card): card is DashboardCardDefinition => Boolean(card));

  const startResize = (event: ReactPointerEvent<HTMLButtonElement>, card: DashboardCardDefinition, currentSize: DashboardCardSize) => {
    if (!editable || !onSizeChange) return;

    event.preventDefault();
    event.stopPropagation();

    const startX = event.clientX;
    const startY = event.clientY;
    let lastAppliedSize = currentSize;

    const handlePointerMove = (pointerEvent: PointerEvent) => {
      const nextSize = getSizeFromDrag(card, currentSize, pointerEvent.clientX - startX, pointerEvent.clientY - startY);
      if (nextSize !== lastAppliedSize) {
        lastAppliedSize = nextSize;
        onSizeChange(card.id, nextSize);
      }
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

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {pinnedCards.map((card, index) => {
          const cardSize = getCardSize(card, cardSizes);
          const nextSize = getNextAllowedSize(card, cardSize);
          const isFirst = index === 0;
          const isLast = index === pinnedCards.length - 1;

          const cardContent = (
            <div className="relative flex h-full min-h-[220px] min-w-0 flex-col overflow-hidden rounded-[22px] border border-cyan-300/10 bg-[#053841]/90 p-5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
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

              <p className="mt-3 flex-1 break-words text-[clamp(0.82rem,1vw,0.98rem)] leading-relaxed text-white/72">
                {card.description}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/55">
                <span className="rounded-full bg-white/5 px-3 py-1">Größe: {cardSize}</span>
                <span className="rounded-full bg-white/5 px-3 py-1">{card.requiresConsent ? "Consent nötig" : "Standardkarte"}</span>
              </div>

              {editable ? (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/10 pt-3 pr-8">
                  <button
                    type="button"
                    onClick={() => onSizeChange?.(card.id, nextSize)}
                    className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-bold text-cyan-100 hover:bg-cyan-300/15"
                  >
                    Größe ändern → {nextSize}
                  </button>
                  <button
                    type="button"
                    disabled={isFirst}
                    onClick={() => onMoveCard?.(card.id, "up")}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    ↑ Hoch
                  </button>
                  <button
                    type="button"
                    disabled={isLast}
                    onClick={() => onMoveCard?.(card.id, "down")}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    ↓ Runter
                  </button>
                </div>
              ) : null}

              {editable ? (
                <button
                  type="button"
                  aria-label={`${card.label} an der Ecke ziehen, um die Größe zu ändern`}
                  title="Ziehen zum Vergrößern oder Verkleinern"
                  onPointerDown={(event) => startResize(event, card, cardSize)}
                  className="absolute bottom-3 right-3 h-8 w-8 cursor-nwse-resize rounded-br-[18px] rounded-tl-xl border border-orange-300/35 bg-orange-300/15 text-orange-100 hover:bg-orange-300/25"
                >
                  <span className="absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-orange-200" />
                  <span className="absolute bottom-2 right-2 h-5 w-5 border-b border-r border-orange-200/60" />
                </button>
              ) : null}
            </div>
          );

          return (
            <div key={card.id} className={`min-w-0 ${sizeClassByCardSize[cardSize]}`}>
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
