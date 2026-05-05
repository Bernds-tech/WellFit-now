"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/app/components/AppShell";
import DashboardPinToggle from "@/app/components/DashboardPinToggle";
import DashboardPinnedCards from "../components/DashboardPinnedCards";
import {
  dashboardCards,
  defaultPinnedDashboardCardIds,
  type DashboardCardSize,
} from "../lib/dashboardCards";

const nextSizeBySize: Record<DashboardCardSize, DashboardCardSize> = {
  small: "medium",
  medium: "large",
  large: "wide",
  wide: "small",
};

function getNextAllowedSize(cardId: string, currentSize: DashboardCardSize) {
  const card = dashboardCards.find((item) => item.id === cardId);
  if (!card) return currentSize;

  let nextSize = nextSizeBySize[currentSize];
  let safetyCounter = 0;

  while (!card.allowedSizes.includes(nextSize) && safetyCounter < 4) {
    nextSize = nextSizeBySize[nextSize];
    safetyCounter += 1;
  }

  return nextSize;
}

export default function DashboardCustomizePage() {
  const [pinnedCardIds, setPinnedCardIds] = useState<string[]>(defaultPinnedDashboardCardIds);
  const [cardSizes, setCardSizes] = useState<Partial<Record<string, DashboardCardSize>>>({});

  const pinnedCardIdSet = useMemo(() => new Set(pinnedCardIds), [pinnedCardIds]);

  const togglePinnedCard = (cardId: string, nextPinned: boolean) => {
    setPinnedCardIds((currentIds) => {
      if (nextPinned) {
        return currentIds.includes(cardId) ? currentIds : [...currentIds, cardId];
      }

      return currentIds.filter((currentId) => currentId !== cardId);
    });
  };

  const cycleCardSize = (cardId: string) => {
    const card = dashboardCards.find((item) => item.id === cardId);
    if (!card) return;

    setCardSizes((currentSizes) => {
      const currentSize = currentSizes[cardId] ?? card.defaultSize;
      return { ...currentSizes, [cardId]: getNextAllowedSize(cardId, currentSize) };
    });
  };

  const setCardSize = (cardId: string, nextSize: DashboardCardSize) => {
    setCardSizes((currentSizes) => ({ ...currentSizes, [cardId]: nextSize }));
  };

  const moveCard = (cardId: string, direction: "up" | "down") => {
    setPinnedCardIds((currentIds) => {
      const currentIndex = currentIds.indexOf(cardId);
      if (currentIndex === -1) return currentIds;

      const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
      if (targetIndex < 0 || targetIndex >= currentIds.length) return currentIds;

      const reorderedIds = [...currentIds];
      const [movedId] = reorderedIds.splice(currentIndex, 1);
      reorderedIds.splice(targetIndex, 0, movedId);
      return reorderedIds;
    });
  };

  return (
    <AppShell reward={0}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-200/80">Dashboard</p>
          <h1 className="mt-2 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-none">Dashboard anpassen</h1>
          <p className="mt-2 max-w-5xl text-base leading-relaxed text-cyan-100/90 lg:text-lg">
            Wähle aus, welche Karten auf deiner persönlichen Startzentrale sichtbar sein sollen. Diese Vorschau speichert noch nichts dauerhaft.
          </p>
        </div>
        <Link href="/dashboard" className="shrink-0 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-300/15">
          Zurück zum Dashboard
        </Link>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-5 overflow-hidden pb-20 xl:grid-cols-[0.95fr_1.55fr]">
        <aside className="min-h-0 overflow-y-auto rounded-[24px] bg-[#053841]/90 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300/80">Auswahl</p>
          <h2 className="mt-2 text-2xl font-extrabold text-white">Karten ein- oder ausblenden</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/65">
            Kreis aktivieren = Karte wird im Dashboard angezeigt. Größe und Reihenfolge ändern testet späteres responsive Verhalten.
          </p>

          <div className="mt-5 space-y-3">
            {dashboardCards.map((card) => {
              const isPinned = pinnedCardIdSet.has(card.id);
              const currentSize = cardSizes[card.id] ?? card.defaultSize;
              const nextSize = getNextAllowedSize(card.id, currentSize);

              return (
                <div key={card.id} className="rounded-[18px] border border-white/10 bg-[#082c39] p-4">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300/70">{card.category}</p>
                      <h3 className="mt-1 break-words text-base font-extrabold text-white">{card.label}</h3>
                    </div>
                    <DashboardPinToggle
                      isPinned={isPinned}
                      label={`${card.label} im Dashboard anzeigen`}
                      onPinnedChange={(nextPinned) => togglePinnedCard(card.id, nextPinned)}
                    />
                  </div>
                  <p className="mt-2 break-words text-xs leading-relaxed text-white/60">{card.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => cycleCardSize(card.id)}
                      className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100 hover:bg-cyan-300/15"
                    >
                      Größe: {currentSize} → {nextSize}
                    </button>
                    {card.requiresConsent ? (
                      <span className="rounded-full bg-yellow-300/10 px-3 py-1 text-xs font-bold text-yellow-100">Consent</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        <div className="min-h-0 min-w-0 overflow-y-auto pr-2">
          <DashboardPinnedCards
            pinnedCardIds={pinnedCardIds}
            cardSizes={cardSizes}
            editable
            enableLinks={false}
            onPinnedChange={togglePinnedCard}
            onSizeChange={setCardSize}
            onMoveCard={moveCard}
          />
        </div>
      </div>
    </AppShell>
  );
}
