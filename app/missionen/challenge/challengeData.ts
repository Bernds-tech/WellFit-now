import type { ChallengeEconomyMission } from "./serverChallengeEconomyApi";

export type ChallengeCategory =
  | "Sport & Bewegung"
  | "Fitness & Klarheit"
  | "Wissen & Klarheit"
  | "Geschicklichkeit"
  | "AR & Erlebnis"
  | "Wellness & Mindset";

export type Challenge = ChallengeEconomyMission & {
  category: ChallengeCategory;
  playersActive: number;
  level: string;
  movementGoal: string;
  icon: string;
  lat: number;
  lng: number;
};

export const challengeCategories: ChallengeCategory[] = [
  "Sport & Bewegung",
  "Fitness & Klarheit",
  "Wissen & Klarheit",
  "Geschicklichkeit",
  "AR & Erlebnis",
  "Wellness & Mindset",
];

export const challenges: Challenge[] = [
  {
    id: 1,
    title: "Balance-Park Challenge",
    category: "Sport & Bewegung",
    description: "Balanciere über Hindernisse und halte deine Kontrolle bis zum Ziel.",
    playersActive: 8,
    level: "2+",
    rewardPoints: 95,
    movementGoal: "1,2 km",
    icon: "🏃",
    lat: 48.204994,
    lng: 16.386607,
  },
  {
    id: 2,
    title: "Fitness-Duelle",
    category: "Fitness & Klarheit",
    description: "Miss dich im lokalen Fitness-Quiz und sammle interne Bonuspunkte vor Ort.",
    playersActive: 6,
    level: "3+",
    rewardPoints: 110,
    movementGoal: "2,1 km",
    icon: "🏋️",
    lat: 48.198123,
    lng: 16.371512,
  },
  {
    id: 3,
    title: "Mathe-Speed",
    category: "Wissen & Klarheit",
    description: "Löse so viele Rechenaufgaben wie möglich in 45 Sekunden.",
    playersActive: 14,
    level: "4+",
    rewardPoints: 120,
    movementGoal: "2,6 km",
    icon: "✅",
    lat: 48.210033,
    lng: 16.363449,
  },
  {
    id: 4,
    title: "Reaktions-Test",
    category: "Geschicklichkeit",
    description: "Tippe präzise, reagiere schnell und knacke die Zielzeit.",
    playersActive: 5,
    level: "2+",
    rewardPoints: 75,
    movementGoal: "1,4 km",
    icon: "⚡",
    lat: 48.215115,
    lng: 16.396277,
  },
  {
    id: 5,
    title: "AR-Fundstück",
    category: "AR & Erlebnis",
    description: "Entdecke versteckte Marker in deiner Umgebung und sichere Spezialpunkte.",
    playersActive: 9,
    level: "5+",
    rewardPoints: 140,
    movementGoal: "3,0 km",
    icon: "📍",
    lat: 48.205914,
    lng: 16.357956,
  },
  {
    id: 6,
    title: "Mindset-Flow",
    category: "Wellness & Mindset",
    description: "Atme bewusst, bleibe fokussiert und schließe den Ruhe-Parcours ab.",
    playersActive: 4,
    level: "1+",
    rewardPoints: 60,
    movementGoal: "0,8 km",
    icon: "🧘",
    lat: 48.20849,
    lng: 16.37208,
  },
];

export const missionTabs = [
  { label: "Tagesmissionen", href: "/missionen/tagesmissionen" },
  { label: "Wochenmissionen", href: "/missionen/wochenmissionen" },
  { label: "Abenteuer", href: "/missionen/abenteuer" },
  { label: "Challenge", href: "/missionen/challenge" },
  { label: "Wettkämpfe", href: "/missionen/wettkaempfe" },
  { label: "Favoriten", href: "/missionen/favoriten" },
  { label: "History", href: "/missionen/history" },
];
