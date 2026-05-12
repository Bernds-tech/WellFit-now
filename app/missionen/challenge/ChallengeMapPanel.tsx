import GoogleMissionMap from "../components/GoogleMissionMap";
import type { Challenge, ChallengeCategory } from "./challengeData";

type ChallengeMapPanelProps = {
  categories: ChallengeCategory[];
  selectedCategory: ChallengeCategory;
  onSelectCategory: (category: ChallengeCategory) => void;
  challenges: Challenge[];
  selectedChallengeId: number;
  onSelectChallenge: (challengeId: number) => void;
};

export default function ChallengeMapPanel({
  categories,
  selectedCategory,
  onSelectCategory,
  challenges,
  selectedChallengeId,
  onSelectChallenge,
}: ChallengeMapPanelProps) {
  const challengeMarkers = challenges.map((challenge) => ({
    id: challenge.id,
    title: challenge.title,
    subtitle: challenge.category,
    icon: challenge.icon,
    lat: challenge.lat,
    lng: challenge.lng,
    status: challenge.playersActive > 10 ? "aktiv" : "live",
  }));

  return (
    <div className="min-h-0 overflow-hidden rounded-[22px] border border-cyan-300/10 bg-[#0a5564]/55">
      <div className="flex border-b border-white/10 bg-[#093f4a]/95">
        {categories.map((category) => (
          <button
            key={category}
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
        title="Google Maps Challenge"
        subtitle="Standort automatisch · bewegen · lokale Challenges wählen"
        markers={challengeMarkers}
        selectedMarkerId={selectedChallengeId}
        onSelectMarker={onSelectChallenge}
        zoom={13}
        minHeightClassName="h-[calc(100%-45px)] min-h-[480px]"
        autoRequestLocation
      />
    </div>
  );
}
