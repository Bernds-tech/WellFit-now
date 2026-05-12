"use client";

import { useMemo } from "react";
import GoogleMissionMap from "../components/GoogleMissionMap";

export type GoogleMapCheckpoint = {
  id: number;
  title: string;
  mayor: string;
  icon: string;
  status: "Offen" | "Umkämpft" | "Geschützt";
  lat: number;
  lng: number;
};

type GoogleCompetitionMapProps = {
  checkpoints: GoogleMapCheckpoint[];
  selectedCheckpointId: number;
  onSelectCheckpoint: (checkpointId: number) => void;
};

export default function GoogleCompetitionMap({
  checkpoints,
  selectedCheckpointId,
  onSelectCheckpoint,
}: GoogleCompetitionMapProps) {
  const checkpointMarkers = useMemo(
    () =>
      checkpoints.map((checkpoint) => ({
        id: checkpoint.id,
        title: checkpoint.title,
        subtitle: `Bürgermeister: ${checkpoint.mayor}`,
        icon: checkpoint.id === selectedCheckpointId ? "👑" : checkpoint.icon,
        lat: checkpoint.lat,
        lng: checkpoint.lng,
        status: checkpoint.status,
      })),
    [checkpoints, selectedCheckpointId],
  );

  return (
    <GoogleMissionMap
      title="Google Maps Wettkämpfe"
      subtitle="Standort automatisch · sichere Checkpoints · Bürgermeister"
      markers={checkpointMarkers}
      selectedMarkerId={selectedCheckpointId}
      onSelectMarker={onSelectCheckpoint}
      zoom={12}
      minHeightClassName="min-h-[520px]"
      autoRequestLocation
    />
  );
}
