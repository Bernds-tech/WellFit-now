"use client";

import Link from "next/link";
import DashboardPinnedCards from "./DashboardPinnedCards";
import { useDashboardPreferences } from "../hooks/useDashboardPreferences";

export default function DashboardSavedCardsPanel() {
  const { preferences, isLoaded } = useDashboardPreferences();

  if (!isLoaded) {
    return (
      <section className="rounded-[24px] border border-cyan-300/10 bg-[#042f39]/70 p-5 text-white shadow-[0_12px_30px_rgba(0,0,0,0.16)]">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300/80">Dashboard</p>
        <h2 className="mt-2 text-2xl font-extrabold">Deine Karten werden geladen</h2>
        <p className="mt-2 text-sm leading-relaxed text-white/65">Gespeicherte Auswahl und Größen werden vorbereitet.</p>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300/80">Persönliches Dashboard</p>
          <h2 className="mt-1 text-2xl font-extrabold text-white">Deine gespeicherten Karten</h2>
        </div>
        <Link
          href="/dashboard/anpassen"
          className="shrink-0 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-300/15"
        >
          Karten anpassen
        </Link>
      </div>

      <DashboardPinnedCards
        pinnedCardIds={preferences.pinnedCardIds}
        cardSizes={preferences.cardSizes}
        cardDimensions={preferences.cardDimensions}
      />
    </div>
  );
}
