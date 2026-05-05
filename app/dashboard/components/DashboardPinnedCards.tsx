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
  onDimensionsChange?: (cardId: string, nextDimensions: DashboardCardDimensions) => void;
};

const compactCardScale = 0.75;

const sizeClassByCardSize: Record<DashboardCardSize, string> = {
  small: "",
  medium: "",
  large: "sm:col-span-2 xl:col-span-2",
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

function getCompactDimensions(dimensions: DashboardCardDimensions) {
  return {
    width: Math.round(dimensions.width * compactCardScale),
    height: Math.round(dimensions.height * compactCardScale),
  };
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
        <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300/80">Dashboard</p>
        <h2 className="mt-2 text-2xl font-extrabold">Keine Karten ausgewählt</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/65">
          Aktiviere links mindestens eine Karte, damit sie in deiner persönlichen Startzentrale angezeigt wird.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-[24px] border border-cyan-300/10 bg-[#042f39]/70 p-5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
      <div className="mb-4">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300/80">Vorschau</p>
        <h2 className="mt-2 text-2xl font-extrabold">Deine Dashboard-Karten</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/65">
          Diese Karten bilden deine persönliche Startzentrale. In der Bearbeitung sind sie bewusst kompakter dargestellt.
        </p>
      </div>

      <div className={editable ? "flex min-w-0 flex-wrap items-start gap-3" : "grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"}>
        {pinnedCards.map((card) => {
          const cardSize = getCardSize(card, cardSizes);
          const dimensions = cardDimensions?.[card.id] ?? defaultDimensionsBySize[cardSize];
          const compactDimensions = getCompactDimensions(dimensions);

          const cardContent = (
            <div
              className="relative flex h-full min-h-[142px] min-w-0 flex-col overflow-hidden rounded-[20px] border border-cyan-300/10 bg-[#053841]/90 p-4 text-white shadow-[0_10px_24px_rgba(0,0,0,0.16)]"
              style={editable ? { width: compactDimensions.width, height: compactDimensions.height } : undefined}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="break-words text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300/75">{card.category}</p>
                  <h3 className="mt-1 break-words text-[clamp(0.95rem,1.3vw,1.18rem)] font-extrabold leading-tight text-white">{card.label}</h3>
                </div>

                {editable && onPinnedChange ? (
                  <DashboardPinToggle
                    isPinned
                    label={`${card.label} aus dem Dashboard entfernen`}
                    onPinnedChange={(nextPinned) => onPinnedChange(card.id, nextPinned)}
                  />
                ) : null}
              </div>

              <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
                <p className="break-words text-[clamp(0.75rem,0.9vw,0.88rem)] leading-relaxed text-white/72">
                  {card.description}
                </p>
              </div>

              {editable ? (
                <button
                  type="button"
                  aria-label={`${card.label} stufenlos an der Kartenecke ziehen, um die Größe zu ändern`}
                  title="Kartenecke ziehen zum stufenlosen Vergrößern oder Verkleinern"
                  onPointerDown={(event) => startResize(event, card.id, dimensions)}
                  className="absolute bottom-0 right-0 h-10 w-10 cursor-nwse-resize bg-transparent"
                >
                  <span className="absolute bottom-2 right-2 h-3.5 w-3.5 border-b-2 border-r-2 border-orange-200/70" />
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
