import type { Beta1NearbyMissionLocation } from "@/lib/beta1/clientNearbyMissionLocations";
import GoogleMissionMap from "../components/GoogleMissionMap";
import type { ChallengeCategory } from "./challengeData";

type ChallengeMapPanelProps = {
  categories: ChallengeCategory[];
  selectedCategory: ChallengeCategory;
  onSelectCategory: (category: ChallengeCategory) => void;
  locations: Beta1NearbyMissionLocation[];
  selectedLocationId: string | null;
  onSelectLocation: (location: Beta1NearbyMissionLocation) => void;
  radiusKm: number;
  locationReady: boolean;
};

function formatDistance(distanceKm: number) {
  return distanceKm < 1
    ? `${Math.max(1, Math.round(distanceKm * 1000))} m`
    : `${distanceKm.toFixed(1)} km`;
}

export default function ChallengeMapPanel({
  categories,
  selectedCategory,
  onSelectCategory,
  locations,
  selectedLocationId,
  onSelectLocation,
  radiusKm,
  locationReady,
}: ChallengeMapPanelProps) {
  const markers = locations.map((location, index) => ({
    id: index + 1,
    title: location.title,
    subtitle: `${formatDistance(location.distanceKm)}${location.locality ? ` · ${location.locality}` : ""}`,
    icon: location.icon || "📍",
    lat: location.latitude,
    lng: location.longitude,
    status: "sicher veröffentlicht",
  }));
  const selectedMarkerId = Math.max(0, locations.findIndex((location) => location.locationId === selectedLocationId) + 1);

  return (
    <div className="min-h-0 overflow-hidden rounded-[22px] border border-cyan-300/10 bg-[#0a5564]/55">
      <div className="flex border-b border-white/10 bg-[#093f4a]/95">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => onSelectCategory(category)}
            className={`flex-1 border-r border-white/10 px-2 py-3 text-center text-sm font-semibold transition last:border-r-0 ${
              selectedCategory === category
                ? "bg-[#0e6e7a] text-cyan-200"
                : "text-white/75 hover:bg-white/5 hover:text-white"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
      <GoogleMissionMap
        title="WellFit-Challenges in deiner Umgebung"
        subtitle={locationReady
          ? `${locations.length} sichere Orte im Radius von ${radiusKm} km`
          : "Standortfreigabe lädt nur nahe, serverseitig veröffentlichte Orte"}
        markers={markers}
        selectedMarkerId={selectedMarkerId}
        onSelectMarker={(markerId) => {
          const location = locations[markerId - 1];
          if (location) onSelectLocation(location);
        }}
        zoom={13}
        minHeightClassName="h-[calc(100%-45px)] min-h-[480px]"
        autoRequestLocation
      />
    </div>
  );
}
