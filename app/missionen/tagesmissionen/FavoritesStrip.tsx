"use client";

import MissionTile from "./MissionTile";
import { DailyMission } from "./missions";

type Props = {
  missions: DailyMission[];
  favoriteIds: string[];
  selectedMissionId: string | null;
  recommendedIds: string[];
  onSelect: (id: string) => void;
  onToggleFavorite: (id: string) => void;
};

export default function FavoritesStrip({
  missions,
  favoriteIds,
  selectedMissionId,
  recommendedIds,
  onSelect,
  onToggleFavorite,
}: Props) {
  const favoriteMissions = missions.filter((m) => favoriteIds.includes(m.id));

  return (
    <section className="rounded-[8px] bg-[#00606b]/75 px-4 py-3">
      <h2 className="mb-2 w-fit border-b border-white/70 text-2xl font-extrabold tracking-wide">Favoriten</h2>

      <div className="flex gap-3 overflow-x-auto pb-2">
        {favoriteMissions.length ? (
          favoriteMissions.map((mission) => (
            <MissionTile
              key={mission.id}
              mission={mission}
              selectedMissionId={selectedMissionId}
              favoriteIds={favoriteIds}
              recommendedIds={recommendedIds}
              onSelect={onSelect}
              onToggleFavorite={onToggleFavorite}
            />
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-white/25 px-5 py-5 text-sm text-white/50">
            Noch keine Favoriten. Tippe auf einen Stern.
          </div>
        )}
      </div>
    </section>
  );
}
