"use client";

import { useMemo } from "react";
import Link from "next/link";
import AppShell from "@/app/components/AppShell";
import DashboardPinToggle from "@/app/components/DashboardPinToggle";
import DashboardPinnedCards from "../components/DashboardPinnedCards";
import {
  dashboardCards,
  type DashboardCardSize,
} from "../lib/dashboardCards";
import {
  useDashboardPreferences,
  type DashboardCardDimensions,
} from "../hooks/useDashboardPreferences";

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
  const {
    preferences,
    isLoaded,
    resetDashboardPreferences,
    setDashboardPreferences,
  } = useDashboardPreferences();
  const { pinnedCardIds, cardSizes, cardDimensions } = preferences;

  const pinnedCardIdSet = useMemo(() => new Set(pinnedCardIds), [pinnedCardIds]);

  const togglePinnedCard = (cardId: string, nextPinned: boolean) => {
    setDashboardPreferences((currentPreferences) => {
      const nextPinnedCardIds = nextPinned
        ? currentPreferences.pinnedCardIds.includes(cardId)
          ? currentPreferences.pinnedCardIds
          : [...currentPreferences.pinnedCardIds, cardId]
        : currentPreferences.pinnedCardIds.filter((currentId) => currentId !== cardId);

      return { ...currentPreferences, pinnedCardIds: nextPinnedCardIds };
    });
  };

  const cycleCardSize = (cardId: string) => {
    const card = dashboardCards.find((item) => item.id === cardId);
    if (!card) return;

    setDashboardPreferences((currentPreferences) => {
      const currentSize = currentPreferences.cardSizes[cardId] ?? card.defaultSize;
      const remainingDimensions = Object.fromEntries(Object.entries(currentPreferences.cardDimensions).filter(([dimensionCardId]) => dimensionCardId !== cardId));

      return {
        ...currentPreferences,
        cardSizes: {
          ...currentPreferences.cardSizes,
          [cardId]: getNextAllowedSize(cardId, currentSize),
        },
        cardDimensions: remainingDimensions,
      };
    });
  };

  const setCardFreeformDimensions = (cardId: string, nextDimensions: DashboardCardDimensions) => {
    setDashboardPreferences((currentPreferences) => ({
      ...currentPreferences,
      cardDimensions: {
        ...currentPreferences.cardDimensions,
        [cardId]: nextDimensions,
      },
    }));
  };

  return (
    <AppShell reward={0}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-200/80">Dashboard</p>
          <h1 className="mt-2 text-5xl font-extrabold leading-none">Dashboard anpassen</h1>
          <p className="mt-2 max-w-5xl text-lg leading-relaxed text-cyan-100/90">
            Wähle aus, welche Karten auf deiner persönlichen Startzentrale sichtbar sein sollen. Deine Auswahl wird lokal gespeichert.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={resetDashboardPreferences}
            disabled={!isLoaded}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Zurücksetzen
          </button>
          <Link href="/dashboard" className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-300/15">
            Zurück zum Dashboard
          </Link>
        </div>
      </div>

      {!isLoaded ? (
        <div className="grid min-h-0 flex-1 place-items-center overflow-hidden pb-20">
          <div className="rounded-[24px] border border-cyan-300/10 bg-[#053841]/90 p-6 text-center text-white shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300/80">Dashboard</p>
            <h2 className="mt-2 text-2xl font-extrabold">Deine Karten werden geladen</h2>
            <p className="mt-2 text-sm text-white/60">Gespeicherte Auswahl und Größen werden vorbereitet.</p>
          </div>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[0.95fr_1.55fr] gap-5 overflow-hidden pb-20">
          <aside className="min-h-0 overflow-y-auto rounded-[24px] bg-[#053841]/90 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300/80">Auswahl</p>
            <h2 className="mt-2 text-2xl font-extrabold text-white">Karten ein- oder ausblenden</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/65">
              Kreis aktivieren = Karte wird im Dashboard angezeigt. Rastergröße testet Standardformate; unten rechts an Karten ziehen ändert Breite und Höhe stufenlos.
            </p>

            <div className="mt-5 space-y-3">
              {dashboardCards.map((card) => {
                const isPinned = pinnedCardIdSet.has(card.id);
                const currentSize = cardSizes[card.id] ?? card.defaultSize;

                return (
                  <div key={card.id} className="rounded-[18px] border border-white/10 bg-[#082c39] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300/70">{card.category}</p>
                        <h3 className="mt-1 text-base font-extrabold text-white">{card.label}</h3>
                      </div>
                      <DashboardPinToggle
                        isPinned={isPinned}
                        label={`${card.label} im Dashboard anzeigen`}
                        onPinnedChange={(nextPinned) => togglePinnedCard(card.id, nextPinned)}
                      />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-white/60">{card.description}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => cycleCardSize(card.id)}
                        className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100 hover:bg-cyan-300/15"
                      >
                        Rastergröße: {currentSize} → {getNextAllowedSize(card.id, currentSize)}
                      </button>
                      {cardDimensions[card.id] ? (
                        <span className="rounded-full bg-orange-300/10 px-3 py-1 text-xs font-bold text-orange-100">freie Größe aktiv</span>
                      ) : null}
                      {card.requiresConsent ? (
                        <span className="rounded-full bg-yellow-300/10 px-3 py-1 text-xs font-bold text-yellow-100">Consent</span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          <div className="min-h-0 overflow-y-auto pr-2">
            <DashboardPinnedCards
              pinnedCardIds={pinnedCardIds}
              cardSizes={cardSizes}
              cardDimensions={cardDimensions}
              editable
              enableLinks={false}
              onPinnedChange={togglePinnedCard}
              onDimensionsChange={setCardFreeformDimensions}
            />
          </div>
        </div>
      )}
    </AppShell>
  );
}

