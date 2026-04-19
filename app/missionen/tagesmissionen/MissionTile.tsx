"use client";

import Image from "next/image";
import { DailyMission, missionIcon } from "./missions";

type MissionTileProps = {
  mission: DailyMission;
  selectedMissionId: string | null;
  favoriteIds: string[];
  recommendedIds: string[];
  onSelect: (missionId: string) => void;
  onToggleFavorite: (missionId: string) => void;
};

export default function MissionTile({
  mission,
  selectedMissionId,
  favoriteIds,
  recommendedIds,
  onSelect,
  onToggleFavorite,
}: MissionTileProps) {
  const isFavorite = favoriteIds.includes(mission.id);
  const isRecommended = recommendedIds.includes(mission.id);

  return (
    <button
      draggable
      onDragStart={(event) => event.dataTransfer.setData("text/plain", mission.id)}
      onClick={() => onSelect(mission.id)}
      className={`group relative h-[118px] w-[130px] shrink-0 overflow-hidden rounded-[10px] border bg-[#044b54]/95 p-2 text-left shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:bg-[#075d68] active:scale-95 ${
        isRecommended
          ? "border-yellow-400 ring-2 ring-yellow-300/70"
          : selectedMissionId === mission.id
            ? "border-yellow-400"
            : "border-cyan-300/25"
      }`}
    >
      {isRecommended && (
        <div className="absolute left-1/2 top-1 z-10 -translate-x-1/2 rounded-full bg-yellow-400 px-2 py-[1px] text-[10px] font-extrabold text-[#053841]">
          KI
        </div>
      )}

      <span
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggleFavorite(mission.id);
        }}
        className={`absolute right-2 top-1 z-20 text-2xl transition hover:scale-150 ${
          isFavorite ? "text-yellow-400" : "text-white/25 hover:text-yellow-300"
        }`}
      >
        ★
      </span>

      <div className="absolute left-2 top-2 text-xs text-cyan-100/50">↕</div>
      <div className="flex h-11 items-center justify-center text-3xl text-white/85 transition group-hover:scale-110">
        {missionIcon(mission.type)}
      </div>
      <p className="line-clamp-2 text-center text-sm font-bold leading-tight text-white">{mission.title}</p>
      <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1 text-sm font-bold text-white">
        <Image src="/coin.png" alt="Punkte" width={25} height={25} className="rounded-full" />
        <span>+ {mission.reward} Pkt.</span>
      </div>
    </button>
  );
}
