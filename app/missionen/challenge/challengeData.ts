export const CHALLENGE_CATALOG_ID = "wellfit-beta1-challenge-missions";
export const CHALLENGE_CATALOG_VERSION = "1.1.0";
export const CHALLENGE_COMPLETION_POLICY = "once-per-mission-per-user" as const;
export const CHALLENGE_LOCATION_POLICY = "nearby-published-location" as const;
export const CHALLENGE_START_RADIUS_METERS = 500 as const;
export const CHALLENGE_EVIDENCE_TYPE = "challenge-user-confirmation" as const;

export type ChallengeCategory =
  | "Sport & Bewegung"
  | "Fitness & Klarheit"
  | "Wissen & Klarheit"
  | "Geschicklichkeit"
  | "AR & Erlebnis"
  | "Wellness & Mindset";

export type ChallengeServerType = "movement" | "workout" | "learning" | "skill" | "ar" | "wellness";
export type ChallengeDisplayType = "Bewegung" | "Workout" | "Abenteuer";

export type Challenge = {
  id: number;
  missionId: string;
  title: string;
  category: ChallengeCategory;
  description: string;
  level: string;
  rewardWfxp: number;
  movementGoal: string;
  icon: string;
  displayType: ChallengeDisplayType;
  serverType: ChallengeServerType;
  evidenceType: typeof CHALLENGE_EVIDENCE_TYPE;
  reviewRequired: true;
  childAllowed: false;
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
    missionId: "challenge-balance-park",
    title: "Balance-Park Challenge",
    category: "Sport & Bewegung",
    description: "Balanciere über Hindernisse und halte deine Kontrolle bis zum Ziel.",
    level: "2+",
    rewardWfxp: 95,
    movementGoal: "1,2 km",
    icon: "🏃",
    displayType: "Bewegung",
    serverType: "movement",
    evidenceType: CHALLENGE_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
  },
  {
    id: 2,
    missionId: "challenge-fitness-duel",
    title: "Fitness-Duelle",
    category: "Fitness & Klarheit",
    description: "Miss dich im lokalen Fitness-Quiz und sammle interne WFXP nach serverseitiger Prüfung.",
    level: "3+",
    rewardWfxp: 110,
    movementGoal: "2,1 km",
    icon: "🏋️",
    displayType: "Workout",
    serverType: "workout",
    evidenceType: CHALLENGE_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
  },
  {
    id: 3,
    missionId: "challenge-math-speed",
    title: "Mathe-Speed",
    category: "Wissen & Klarheit",
    description: "Löse so viele Rechenaufgaben wie möglich in 45 Sekunden.",
    level: "4+",
    rewardWfxp: 120,
    movementGoal: "2,6 km",
    icon: "✅",
    displayType: "Abenteuer",
    serverType: "learning",
    evidenceType: CHALLENGE_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
  },
  {
    id: 4,
    missionId: "challenge-reaction-test",
    title: "Reaktions-Test",
    category: "Geschicklichkeit",
    description: "Tippe präzise, reagiere schnell und knacke die Zielzeit.",
    level: "2+",
    rewardWfxp: 75,
    movementGoal: "1,4 km",
    icon: "⚡",
    displayType: "Abenteuer",
    serverType: "skill",
    evidenceType: CHALLENGE_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
  },
  {
    id: 5,
    missionId: "challenge-ar-find",
    title: "AR-Fundstück",
    category: "AR & Erlebnis",
    description: "Entdecke versteckte Marker in deiner Umgebung und reiche den Abschluss zur Prüfung ein.",
    level: "5+",
    rewardWfxp: 140,
    movementGoal: "3,0 km",
    icon: "📍",
    displayType: "Abenteuer",
    serverType: "ar",
    evidenceType: CHALLENGE_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
  },
  {
    id: 6,
    missionId: "challenge-mindset-flow",
    title: "Mindset-Flow",
    category: "Wellness & Mindset",
    description: "Atme bewusst, bleibe fokussiert und schließe den Ruhe-Parcours ab.",
    level: "1+",
    rewardWfxp: 60,
    movementGoal: "0,8 km",
    icon: "🧘",
    displayType: "Abenteuer",
    serverType: "wellness",
    evidenceType: CHALLENGE_EVIDENCE_TYPE,
    reviewRequired: true,
    childAllowed: false,
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
