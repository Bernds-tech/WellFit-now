"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import AppSidebar from "@/app/AppSidebar";
import AppFooter from "@/app/AppFooter";
import DailyHeader from "./DailyHeader";
import DailySlots from "./DailySlots";
import FavoritesStrip from "./FavoritesStrip";
import MissionPool from "./MissionPool";
import MissionDetails from "./MissionDetails";
import { dailyMissions } from "./missions";
import { calculateDailyReward } from "./rewardEngine";

type MissionTab = "Tagesmissionen" | "Wochenmissionen" | "Abenteuer" | "Challenge" | "Wettkämpfe" | "Favoriten" | "History";

const tabs: MissionTab[] = ["Tagesmissionen", "Wochenmissionen", "Abenteuer", "Challenge", "Wettkämpfe", "Favoriten", "History"];

const tabHref = (tab: MissionTab) =>
  tab === "Tagesmissionen" ? "/missionen/tagesmissionen" :
  tab === "Wochenmissionen" ? "/missionen/wochenmissionen" :
  tab === "Abenteuer" ? "/missionen/abenteuer" :
  tab === "Challenge" ? "/missionen/challenge" :
  tab === "Wettkämpfe" ? "/missionen/wettkaempfe" :
  tab === "Favoriten" ? "/missionen/favoriten" : "/missionen/history";

export default function MissionenPage() {
  const [brightness, setBrightness] = useState(100);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(dailyMissions[0].id);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [dailySlotIds, setDailySlotIds] = useState<(string | null)[]>([null, null, null]);
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);
  const [rewardDetailsOpen, setRewardDetailsOpen] = useState(false);

  const selectedMission = dailyMissions.find((mission) => mission.id === selectedMissionId) ?? dailyMissions[0];
  const recommendedIds = useMemo(() => ["daily-plank-60", "daily-8000-steps", "daily-healthy-meal"], []);
  const selectedTypes = dailySlotIds
    .map((id) => dailyMissions.find((mission) => mission.id === id)?.type)
    .filter(Boolean) as string[];
  const reward = calculateDailyReward(selectedMission, selectedTypes);

  const toggleFavorite = (missionId: string) => {
    setFavoriteIds((current) => current.includes(missionId) ? current.filter((id) => id !== missionId) : [...current, missionId]);
  };

  const assignSlot = (slotIndex: number, missionId: string) => {
    setDailySlotIds((current) => {
      const next = current.map((id) => id === missionId ? null : id);
      next[slotIndex] = missionId;
      return next;
    });
    setSelectedMissionId(missionId);
    setDragOverSlot(null);
  };

  const clearSlot = (slotIndex: number) => {
    setDailySlotIds((current) => current.map((id, index) => index === slotIndex ? null : id));
  };

  return (
    <main className="h-screen w-screen overflow-hidden text-white" style={{ background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))` }}>
      <div className="flex h-full">
        <AppSidebar brightness={brightness} onBrightnessChange={setBrightness} />

        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <DailyHeader diversityCount={reward.diversityCount} />

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
              reward={reward.finalReward}
              diversityMultiplier={reward.diversityMultiplier}
              antiFarmingMultiplier={reward.antiFarmingMultiplier}
              isFavorite={favoriteIds.includes(selectedMission.id)}
              rewardDetailsOpen={rewardDetailsOpen}
              onToggleFavorite={toggleFavorite}
              onToggleRewardDetails={() => setRewardDetailsOpen((open) => !open)}
            />
          </div>

          <AppFooter reward={reward.finalReward} />
        </section>
      </div>
    </main>
  );
}
