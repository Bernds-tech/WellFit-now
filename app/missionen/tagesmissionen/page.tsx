"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppSidebar from "@/app/AppSidebar";
import AppFooter from "@/app/AppFooter";
import { useWellFitBrightness } from "@/app/hooks/useWellFitBrightness";
import DailyHeader from "./DailyHeader";
import DailySlots from "./DailySlots";
import FavoritesStrip from "./FavoritesStrip";
import MissionPool from "./MissionPool";
import MissionDetails from "./MissionDetails";
import { dailyMissions } from "./missions";
import { calculateDailyReward } from "./rewardEngine";
import { useDailyMissionFirebase } from "./useDailyMissionFirebase";

type MissionTab = "Tagesmissionen" | "Wochenmissionen" | "Abenteuer" | "Challenge" | "Wettkämpfe" | "Favoriten" | "History";

const tabs: MissionTab[] = [
  "Tagesmissionen",
  "Wochenmissionen",
  "Abenteuer",
  "Challenge",
  "Wettkämpfe",
  "Favoriten",
  "History",
];

const tabHref = (tab: MissionTab) =>
  tab === "Tagesmissionen"
    ? "/missionen/tagesmissionen"
    : tab === "Wochenmissionen"
      ? "/missionen/wochenmissionen"
      : tab === "Abenteuer"
        ? "/missionen/abenteuer"
        : tab === "Challenge"
          ? "/missionen/challenge"
          : tab === "Wettkämpfe"
            ? "/missionen/wettkaempfe"
            : tab === "Favoriten"
              ? "/missionen/favoriten"
              : "/missionen/history";

export default function MissionenPage() {
  const [brightness, setBrightness] = useWellFitBrightness(100);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(dailyMissions[0].id);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [rewardDetailsOpen, setRewardDetailsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Ziehe Missionen in deine 3 Tagesfelder.");

  const {
    favoriteIds,
    dailySlotIds,
    startedMissionIds,
    completedMissionIds,
    activeAttempts,
    setFavoriteIds,
    setDailySlotIds,
    startMission: submitMissionForReview,
    completeMission: reconcileMissionReview,
    ready,
    userId,
    lastError,
    dailyGoal,
    goalCompleted,
    currentStreak,
    longestStreak,
    streakBonus,
    xp,
    level,
    xpForCurrentLevel,
    xpForNextLevel,
    walletAvailable,
    progressSource,
    busyMissionId,
  } = useDailyMissionFirebase();

  useEffect(() => {
    if (lastError) setStatusMessage(lastError);
  }, [lastError]);

  const selectedMission = dailyMissions.find((mission) => mission.id === selectedMissionId) ?? dailyMissions[0];
  const activeAttempt = activeAttempts.find((attempt) => attempt.missionId === selectedMission.id) ?? null;
  const isStarted = Boolean(activeAttempt) || startedMissionIds.includes(selectedMission.id);
  const isCompleted = completedMissionIds.includes(selectedMission.id);
  const missionActionBusy = busyMissionId === selectedMission.id;

  const recommendedIds = useMemo(
    () => ["daily-plank-60", "daily-8000-steps", "daily-healthy-meal"],
    [],
  );

  const selectedTypes = dailySlotIds
    .map((id) => dailyMissions.find((mission) => mission.id === id)?.type)
    .filter(Boolean) as string[];

  const reward = calculateDailyReward(selectedMission, selectedTypes, streakBonus);
  const displayReward = selectedMission.reward;

  const toggleFavorite = async (missionId: string) => {
    const next = favoriteIds.includes(missionId)
      ? favoriteIds.filter((id) => id !== missionId)
      : [...favoriteIds, missionId];
    try {
      await setFavoriteIds(next);
      setStatusMessage(
        next.includes(missionId)
          ? userId
            ? "Mission wurde serverseitig zu den Favoriten hinzugefügt."
            : "Mission wurde lokal zu den Favoriten hinzugefügt. Für Server-Sync bitte einloggen."
          : userId
            ? "Mission wurde serverseitig aus den Favoriten entfernt."
            : "Mission wurde lokal aus den Favoriten entfernt.",
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Favoriten konnten nicht gespeichert werden.");
    }
  };

  const assignSlot = async (slotIndex: number, missionId: string) => {
    const next = dailySlotIds.map((id) => (id === missionId ? null : id));
    next[slotIndex] = missionId;
    try {
      await setDailySlotIds(next);
      setSelectedMissionId(missionId);
      setDragOverSlot(null);
      setStatusMessage(
        userId
          ? "Mission wurde über den Server in deine Tagesauswahl gelegt."
          : "Mission wurde nur lokal vorgemerkt. Für sichere Missionen und WFXP bitte einloggen.",
      );
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Tagesauswahl konnte nicht gespeichert werden.");
    }
  };

  const clearSlot = async (slotIndex: number) => {
    const next = dailySlotIds.map((id, index) => (index === slotIndex ? null : id));
    try {
      await setDailySlotIds(next);
      setStatusMessage(userId ? "Tagesfeld wurde serverseitig geleert." : "Tagesfeld wurde lokal geleert.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Tagesfeld konnte nicht geleert werden.");
    }
  };

  const startMission = async (missionId: string) => {
    try {
      setStatusMessage("Mission wird serverseitig gestartet und zur Evidence-Prüfung eingereicht...");
      const result = await submitMissionForReview(missionId);
      setStatusMessage(result.message);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Mission konnte nicht sicher gestartet werden.");
    }
  };

  const completeMission = async (missionId: string) => {
    try {
      setStatusMessage("Der aktuelle Reviewstatus wird serverseitig geprüft...");
      const result = await reconcileMissionReview(missionId);
      if (result.kind === "completed") {
        window.dispatchEvent(new CustomEvent("wellfit-beta1-projection-updated"));
      }
      setStatusMessage(result.message);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Reviewstatus konnte nicht sicher verarbeitet werden.");
    }
  };

  const projectionHint = !userId
    ? "Gastmodus: nur lokale Auswahl, keine Mission und keine WFXP"
    : progressSource === "server"
      ? walletAvailable
        ? "Server-Autorität aktiv · WFXP-Wallet verbunden · ein Abschluss je Mission und Wien-Tag"
        : "Server-Autorität aktiv · WFXP-Wallet wird mit der ersten Buchung angelegt"
      : "Server-Projektion momentan nicht erreichbar · keine Client-Belohnung";

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{
        background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))`,
      }}
    >
      <div className="flex h-full">
        <AppSidebar brightness={brightness} onBrightnessChange={setBrightness} />

        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <DailyHeader
            diversityCount={reward.diversityCount}
            completedCount={completedMissionIds.length}
            dailyGoal={dailyGoal}
            goalCompleted={goalCompleted}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            streakBonus={streakBonus}
            level={level}
            xpForCurrentLevel={xpForCurrentLevel}
            xpForNextLevel={xpForNextLevel}
          />

          <p className="-mt-3 mb-1 text-sm font-semibold text-cyan-100/80">
            {!ready ? "Lade serverseitige Tagesmissionen..." : statusMessage}
          </p>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/45">
            {projectionHint}
          </p>

          <div className="mb-4 flex justify-center">
            <div className="flex items-center gap-5 rounded-full border border-white/10 bg-[#0b6d79]/35 px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)] backdrop-blur-sm">
              {tabs.map((tab) =>
                tab === "Tagesmissionen" ? (
                  <div key={tab} className="relative pb-1 text-base font-semibold text-orange-400">
                    {tab}
                    <span className="absolute left-0 right-0 -bottom-2 h-[2px] rounded-full bg-orange-400" />
                  </div>
                ) : (
                  <Link key={tab} href={tabHref(tab)} className="pb-1 text-base text-white/85 hover:text-white">
                    {tab}
                  </Link>
                ),
              )}
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[2.15fr_1fr] gap-5 overflow-hidden pb-20">
            <div className="flex min-h-0 flex-col overflow-hidden">
              <DailySlots
                missions={dailyMissions}
                dailySlotIds={dailySlotIds}
                dragOverSlot={dragOverSlot}
                setDragOverSlot={setDragOverSlot}
                assignSlot={assignSlot}
                clearSlot={clearSlot}
                selectedMissionId={selectedMissionId}
                favoriteIds={favoriteIds}
                recommendedIds={recommendedIds}
                onSelect={setSelectedMissionId}
                onToggleFavorite={toggleFavorite}
              />

              <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1">
                <FavoritesStrip
                  missions={dailyMissions}
                  favoriteIds={favoriteIds}
                  selectedMissionId={selectedMissionId}
                  recommendedIds={recommendedIds}
                  onSelect={setSelectedMissionId}
                  onToggleFavorite={toggleFavorite}
                />

                <MissionPool
                  missions={dailyMissions}
                  selectedMissionId={selectedMissionId}
                  favoriteIds={favoriteIds}
                  recommendedIds={recommendedIds}
                  onSelect={setSelectedMissionId}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            </div>

            <MissionDetails
              mission={selectedMission}
              reward={displayReward}
              diversityMultiplier={reward.diversityMultiplier}
              antiFarmingMultiplier={reward.antiFarmingMultiplier}
              reserveRewardRate={1}
              rewardPreviewLabel="Server-Katalog · Admin-Review"
              rewardPreviewStatus="manual_review"
              capReasons={["WFXP werden ausschließlich nach serverseitiger Evidence-Freigabe gebucht."]}
              isFavorite={favoriteIds.includes(selectedMission.id)}
              isStarted={isStarted}
              isCompleted={isCompleted}
              activeReviewStatus={activeAttempt?.reviewStatus ?? null}
              activeAttemptStatus={activeAttempt?.attemptStatus ?? null}
              actionBusy={missionActionBusy}
              rewardDetailsOpen={rewardDetailsOpen}
              onToggleFavorite={toggleFavorite}
              onToggleRewardDetails={() => setRewardDetailsOpen((open) => !open)}
              onStartMission={startMission}
              onCompleteMission={completeMission}
            />
          </div>

          <AppFooter reward={displayReward} brightness={brightness} />
        </section>
      </div>
    </main>
  );
}
