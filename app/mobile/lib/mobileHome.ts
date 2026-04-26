import type { MobileFocusCard, MobileQuickAction } from "../types";

export const mobileFocusCards: MobileFocusCard[] = [
  {
    title: "Heute",
    value: "3 Missionen",
    helper: "Spiele nur die wichtigsten Tagesaufgaben auf dem Handy.",
  },
  {
    title: "Buddy",
    value: "Füttern & Pflege",
    helper: "Schnelle Interaktion ohne großes Dashboard.",
  },
  {
    title: "Analyse",
    value: "Kamera bereit",
    helper: "Skeleton-, Face- und Übungsanalyse wird vorbereitet.",
  },
];

export const mobileQuickActions: MobileQuickAction[] = [
  {
    label: "Mission spielen",
    description: "Öffnet die mobile Missions-Testansicht ohne Desktop-Dashboard.",
    href: "/mobile/missionen",
  },
  {
    label: "Flammi füttern",
    description: "Öffnet den mobilen KI-Buddy für schnelle Pflege.",
    href: "/mobile/buddy",
  },
  {
    label: "Nutzer analysieren",
    description: "Kamera-, Pose- und Face-Tracking für Phase 2.",
    href: "/mobile/analyse",
  },
  {
    label: "Bewegung testen",
    description: "Testet Schritte und grobe Aktivität über Handy-Bewegungssensoren.",
    href: "/mobile/bewegung",
  },
  {
    label: "AR starten",
    description: "Buddy und Missionen später im echten Raum erleben.",
    href: "/mobile/ar",
    disabled: true,
  },
];
