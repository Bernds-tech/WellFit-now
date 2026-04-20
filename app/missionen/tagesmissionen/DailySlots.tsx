"use client";

import MissionTile from "./MissionTile";
import { DailyMission } from "./missions";

type DailySlotsProps = {
  missions: DailyMission[];
  dailySlotIds: (string | null)[];
  dragOverSlot: number | null;
  setDragOverSlot: (i: number | null) => void;
  assignSlot: (index: number, missionId: string) => void;
  clearSlot: (index: number) => void;
  selectedMissionId: string | null;
  favoriteIds: string[];
  recommendedIds: string[];
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

export default function DailySlots(props: DailySlotsProps) {
  const {
    missions,
    dailySlotIds,
    dragOverSlot,
    setDragOverSlot,
    assignSlot,
    clearSlot,
    selectedMissionId,
    favoriteIds,
    recommendedIds,
    onSelect,
    onToggleFavorite,
  } = props;

  return (
    <section className="shrink-0 rounded-[8px] bg-[#00606b]/75 px-4 py-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="w-fit border-b border-white/70 text-2xl font-extrabold tracking-wide">Tagesauswahl</h2>
        <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-100">Daily 0%</span>
      </div>

      <div className="flex gap-3">
        {dailySlotIds.map((missionId, index) => {
          const mission = missions.find((m) => m.id === missionId);
          const isOver = dragOverSlot === index;

          return (
            <div
              key={index}
              onDragOver={(e) => { e.preventDefault(); setDragOverSlot(index); }}
              onDragLeave={() => setDragOverSlot(null)}
              onDrop={(e) => {
                e.preventDefault();
                const droppedId = e.dataTransfer.getData("text/plain");
                if (droppedId) assignSlot(index, droppedId);
              }}
              className={`flex h-[118px] w-[130px] shrink-0 items-center justify-center rounded-[10px] border-2 border-dashed transition ${isOver ? "scale-105 border-yellow-300 bg-yellow-400/15" : "border-cyan-200/35 bg-[#043c44]/80"}`}
            >
              {mission ? (
                <div className="relative">
                  <MissionTile
                    mission={mission}
                    selectedMissionId={selectedMissionId}
                    favoriteIds={favoriteIds}
                    recommendedIds={recommendedIds}
                    onSelect={onSelect}
                    onToggleFavorite={onToggleFavorite}
                  />
                  <button
                    onClick={() => clearSlot(index)}
                    className="absolute -right-2 -top-2 z-30 rounded-full bg-red-600 px-2 py-1 text-xs font-bold"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="text-center text-sm text-cyan-50/70">
                  <div className="text-3xl">＋</div>
                  <p>Mission hier ablegen</p>
                  <p className="text-xs text-white/40">Slot {index + 1}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
