"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AppFooter from "@/app/AppFooter";
import AppSidebar from "@/app/AppSidebar";
import type { MissionUiStatus, WellFitMissionRouteKey } from "@/lib/missions";
import { MISSION_PLACEHOLDER_NOTICE, MISSION_SERVER_REWARD_NOTICE } from "@/lib/missions";
import MissionStatusBadge from "./MissionStatusBadge";

type MissionTab = {
  routeKey: WellFitMissionRouteKey;
  label: string;
  href: string;
};

export type PreparedMissionCard = {
  id: string;
  title: string;
  description: string;
  icon: string;
  categoryLabel: string;
  status?: MissionUiStatus;
  notes?: string[];
};

export type PreparedMissionPageProps = {
  routeKey: WellFitMissionRouteKey;
  title: string;
  subtitle: string;
  cards: PreparedMissionCard[];
  primaryNote?: string;
  secondaryNote?: string;
  detailTitle?: string;
  detailBody?: string;
  footerRewardPreview?: number;
};

const tabs: MissionTab[] = [
  { routeKey: "tagesmissionen", label: "Tagesmissionen", href: "/missionen/tagesmissionen" },
  { routeKey: "wochenmissionen", label: "Wochenmissionen", href: "/missionen/wochenmissionen" },
  { routeKey: "abenteuer", label: "Abenteuer", href: "/missionen/abenteuer" },
  { routeKey: "challenge", label: "Challenge", href: "/missionen/challenge" },
  { routeKey: "wettkaempfe", label: "Wettkämpfe", href: "/missionen/wettkaempfe" },
  { routeKey: "favoriten", label: "Favoriten", href: "/missionen/favoriten" },
  { routeKey: "history", label: "History", href: "/missionen/history" },
];

export default function PreparedMissionPage({
  routeKey,
  title,
  subtitle,
  cards,
  primaryNote = MISSION_PLACEHOLDER_NOTICE,
  secondaryNote = MISSION_SERVER_REWARD_NOTICE,
  detailTitle = "Vorbereiteter KI-Missionsbereich",
  detailBody = "Diese Ansicht ist als Container vorbereitet. Echte Missionen entstehen später aus KI-Buddy-Drafts, Server-/Policy-Prüfung und Evidence-Auswertung.",
  footerRewardPreview = 0,
}: PreparedMissionPageProps) {
  const [brightness, setBrightness] = useState(100);
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id ?? "prepared");
  const [message, setMessage] = useState(primaryNote);

  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId) ?? cards[0],
    [cards, selectedCardId],
  );

  const handlePreparedAction = () => {
    setMessage("Start, Completion, Punkte, Rewards und Ledger folgen erst über serverseitige Prüfung.");
  };

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{ background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))` }}
    >
      <div className="flex h-full">
        <AppSidebar brightness={brightness} onBrightnessChange={setBrightness} />

        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-5xl font-extrabold leading-none">{title}</h1>
              <p className="mt-1 max-w-4xl text-lg text-cyan-100/90">{subtitle}</p>
              <p className="mt-2 max-w-5xl text-sm font-semibold text-cyan-100/80">{message}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <MissionStatusBadge status="placeholder" compact />
              <div className="rounded-full bg-[#073b44] px-4 py-2 text-sm font-semibold text-white/85">KI-Buddy Engine vorbereitet</div>
            </div>
          </div>

          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">
              {tabs.map((tab) =>
                tab.routeKey === routeKey ? (
                  <div key={tab.routeKey} className="relative pb-1 text-base font-semibold text-orange-400">
                    {tab.label}
                    <span className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full bg-orange-400" />
                  </div>
                ) : (
                  <Link key={tab.routeKey} href={tab.href} className="pb-1 text-base text-white/85 hover:text-white">
                    {tab.label}
                  </Link>
                ),
              )}
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[1.75fr_1fr] gap-5 overflow-hidden pb-20">
            <div className="min-h-0 overflow-y-auto pr-2">
              <div className="mb-4 rounded-[22px] border border-cyan-300/20 bg-[#053841]/90 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                <MissionStatusBadge status="placeholder" />
                <p className="mt-3 text-sm leading-relaxed text-white/80">{primaryNote}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{secondaryNote}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => {
                      setSelectedCardId(card.id);
                      setMessage(`${card.title}: vorbereitet, aber noch nicht als echte Mission freigegeben.`);
                    }}
                    className={`rounded-[20px] border p-4 text-left transition ${
                      selectedCard?.id === card.id
                        ? "border-yellow-400 bg-[#07505c]"
                        : "border-cyan-300/10 bg-[#053841]/90 hover:bg-[#07505c]"
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div className="text-3xl">{card.icon}</div>
                      <MissionStatusBadge status={card.status ?? "placeholder"} compact />
                    </div>
                    <p className="text-lg font-bold text-white">{card.title}</p>
                    <p className="mt-2 text-sm leading-relaxed text-white/78">{card.description}</p>
                    <p className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200/80">{card.categoryLabel}</p>
                  </button>
                ))}
              </div>
            </div>

            <aside className="min-h-0 overflow-y-auto rounded-[24px] bg-[#053841]/90 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300/80">Details</p>
              <h2 className="mt-2 text-2xl font-extrabold text-white">{selectedCard?.title ?? detailTitle}</h2>
              <div className="mt-4 flex justify-center text-5xl">{selectedCard?.icon ?? "🧭"}</div>
              <p className="mt-4 text-sm leading-relaxed text-white/80">{selectedCard?.description ?? detailBody}</p>

              <div className="mt-5 space-y-3">
                <MissionStatusBadge status={selectedCard?.status ?? "placeholder"} />
                {(selectedCard?.notes ?? [detailBody]).map((note) => (
                  <div key={note} className="rounded-[16px] border border-white/10 bg-[#082c39] px-4 py-3 text-sm leading-relaxed text-white/78">
                    {note}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handlePreparedAction}
                className="mt-5 w-full rounded-xl border border-cyan-300/30 bg-cyan-300/10 px-4 py-3 text-base font-bold text-cyan-100 transition hover:bg-cyan-300/15"
              >
                Serverprüfung später aktivieren
              </button>
              <p className="mt-3 text-xs leading-relaxed text-white/55">
                Dieser Button startet keine Mission und schreibt keine Punkte. Er markiert nur den vorgesehenen späteren Serverpfad.
              </p>
            </aside>
          </div>

          <AppFooter reward={footerRewardPreview} />
        </section>
      </div>
    </main>
  );
}
