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
import {
  calculateDailyReward,
  createDailyMissionRewardPreview,
  getDailyMissionRewardPreviewLabel,
} from "./rewardEngine";
import { fetchDailyMissionCompletion } from "./serverCompletionApi";
import { fetchDailyMissionProjection } from "./serverProjectionApi";
import { fetchDailyBuddySyncPreview } from "./serverBuddySyncApi";
import { useDailyMissionFirebase } from "./useDailyMissionFirebase";
import { applyMissionBuddyBridge } from "../lib/missionBuddyBridge";

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
  const [projectionSource, setProjectionSource] = useState<"server" | "local">("local");
  const [projectionHint, setProjectionHint] = useState("Projection Read: lokaler Fallback");

  const {
    favoriteIds,
    dailySlotIds,
    startedMissionIds,
    completedMissionIds,
    setFavoriteIds,
    setDailySlotIds,
    startMission: persistStartMission,
    completeMission: persistCompleteMission,
    ready,
    userId,
    dailyGoal,
    goalCompleted,
    currentStreak,
    longestStreak,
    streakBonus,
    xp,
    level,
    xpForCurrentLevel,
    xpForNextLevel,
  } = useDailyMissionFirebase();

  useEffect(() => {
    if (!ready) return;

    let isCancelled = false;

    fetchDailyMissionProjection({
      userId,
      xp,
      level,
      currentStreak,
      longestStreak,
    }).then((projection) => {
      if (isCancelled) return;
      setProjectionSource(projection.source);
      setProjectionHint(
        projection.source === "server"
          ? "Projection Read: API-Vorstufe aktiv"
          : userId
            ? "Projection Read: lokaler Fallback"
            : "Projection Read: kein Profil geladen"
      );
    });

    return () => {
      isCancelled = true;
    };
  }, [currentStreak, level, longestStreak, ready, userId, xp]);

  const selectedMission = dailyMissions.find((mission) => mission.id === selectedMissionId) ?? dailyMissions[0];
  const isStarted = startedMissionIds.includes(selectedMission.id);
  const isCompleted = completedMissionIds.includes(selectedMission.id);

  const recommendedIds = useMemo(
    () => ["daily-plank-60", "daily-8000-steps", "daily-healthy-meal"],
    []
  );

  const selectedTypes = dailySlotIds
    .map((id) => dailyMissions.find((mission) => mission.id === id)?.type)
    .filter(Boolean) as string[];

  const reward = calculateDailyReward(selectedMission, selectedTypes, streakBonus);

  const rewardPreview = useMemo(
    () =>
      createDailyMissionRewardPreview({
        userId,
        mission: selectedMission,
        selectedTypes,
        streakBonus,
      }),
    [selectedMission, selectedTypes, streakBonus, userId]
  );

  const rewardPreviewLabel = getDailyMissionRewardPreviewLabel(rewardPreview);
  const displayReward = rewardPreview.cappedPoints;

  const createPreviewForMission = (missionId: string) => {
    const mission = dailyMissions.find((item) => item.id === missionId);
    if (!mission) return null;

    return {
      mission,
      preview: createDailyMissionRewardPreview({
        userId,
        mission,
        selectedTypes,
        streakBonus,
      }),
    };
  };

  const toggleFavorite = async (missionId: string) => {
    const next = favoriteIds.includes(missionId)
      ? favoriteIds.filter((id) => id !== missionId)
      : [...favoriteIds, missionId];

    await setFavoriteIds(next);
    setStatusMessage(
      next.includes(missionId)
        ? "Mission wurde zu Favoriten hinzugefügt."
        : "Mission wurde aus Favoriten entfernt."
    );
  };

  const assignSlot = async (slotIndex: number, missionId: string) => {
    const next = dailySlotIds.map((id) => (id === missionId ? null : id));
    next[slotIndex] = missionId;

    await setDailySlotIds(next);
    setSelectedMissionId(missionId);
    setDragOverSlot(null);
    setStatusMessage(
      userId
        ? "Mission wurde gespeichert und in deine Tagesauswahl gelegt."
        : "Mission wurde lokal in deine Tagesauswahl gelegt. Für Sync bitte einloggen."
    );
  };

  const clearSlot = async (slotIndex: number) => {
    const next = dailySlotIds.map((id, index) => (index === slotIndex ? null : id));
    await setDailySlotIds(next);
    setStatusMessage("Tagesfeld wurde geleert.");
  };

  const startMission = async (missionId: string) => {
    const result = createPreviewForMission(missionId);
    if (!result) return;

    if (result.preview.status === "blocked") {
      setStatusMessage(`${result.mission.title} ist aktuell durch interne Beta-Limits blockiert.`);
      return;
    }

    await persistStartMission(missionId);
    setStatusMessage(
      `${result.mission.title} gestartet. ${getDailyMissionRewardPreviewLabel(result.preview)}: ${result.preview.cappedPoints} interne Punkte vorgemerkt.`
    );
  };

  const completeMission = async (missionId: string) => {
    const result = createPreviewForMission(missionId);
    if (!result) return;

    if (result.preview.status === "blocked") {
      setStatusMessage(`${result.mission.title} ist aktuell durch interne Beta-Limits blockiert.`);
      return;
    }

    if (result.preview.status === "manual_review") {
      setStatusMessage(`${result.mission.title} wurde für Review vorgemerkt. Keine direkte Punktegutschrift.`);
      return;
    }

    const completion = await fetchDailyMissionCompletion({
      userId,
      mission: result.mission,
      rewardPreview: result.preview,
      selectedTypes,
      streakBonus,
    });

    if (completion.status === "completion_blocked") {
      setStatusMessage(`${result.mission.title} wurde servernah blockiert. Keine Punktegutschrift.`);
      return;
    }

    if (completion.status === "manual_review_required") {
      setStatusMessage(`${result.mission.title} wurde servernah für Review vorgemerkt. Keine direkte Punktegutschrift.`);
      return;
    }

    await persistCompleteMission(missionId, completion.approvedXpPreview || completion.approvedPointsPreview);

    const bridgeResult = await applyMissionBuddyBridge({
      mission: result.mission,
      rewardPoints: completion.approvedPointsPreview,
      source: "dailyMission",
      rewardPreviewEvent: result.preview.ledgerEvent,
    });

    const buddySyncPreview = bridgeResult.ok
      ? null
      : await fetchDailyBuddySyncPreview({
          userId,
          mission: result.mission,
          rewardPoints: completion.approvedPointsPreview,
        });

    const completionSource = completion.source === "server" ? "Server-Completion" : "lokaler Completion-Fallback";

    setStatusMessage(
      bridgeResult.ok
        ? bridgeResult.alreadyApplied
          ? `${result.mission.title} war bereits verbunden. Keine doppelte Punktevergabe. Flammi bleibt synchron. ${completionSource}.`
          : `${result.mission.title} abgeschlossen. +${completion.approvedPointsPreview} interne Punkte. ${completionSource}; finale Ledger-Autorität folgt serverseitig.`
        : `${result.mission.title} abgeschlossen. ${completionSource}; ${buddySyncPreview?.message ?? "Buddy-Sync bleibt als MVP-Bruecke vorgemerkt."}`
    );
  };

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
            {!ready
              ? "Lade Tagesmissionen..."
              : isCompleted
                ? `${selectedMission.title} ist abgeschlossen.`
                : isStarted
                  ? `${selectedMission.title} läuft bereits.`
                  : statusMessage}
          </p>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-100/45">
            {projectionHint} · {projectionSource === "server" ? "keine finale Autorität" : "MVP-Brücke bleibt aktiv"}
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
                )
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
              reserveRewardRate={rewardPreview.rewardRate}
              rewardPreviewLabel={rewardPreviewLabel}
              rewardPreviewStatus={rewardPreview.status}
              capReasons={rewardPreview.reasons}
              isFavorite={favoriteIds.includes(selectedMission.id)}
              isStarted={isStarted}
              isCompleted={isCompleted}
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
