import type { VisionCapability } from "./visionTypes";

export const visionCapabilities: VisionCapability[] = [
  {
    title: "Kamera-Preview",
    status: "ready",
    description: "Startet nach Zustimmung die Live-Kamera als Grundlage für Training und AR.",
  },
  {
    title: "Skeleton Tracking",
    status: "ready",
    description: "Körperpunkte werden über MediaPipe erkannt und als Skeleton-Overlay angezeigt.",
  },
  {
    title: "Face Tracking",
    status: "ready",
    description: "Face Signals sind technisch vorbereitet. Rohbilder und Videos werden nicht als Standard gespeichert.",
  },
  {
    title: "Übungszählung",
    status: "ready",
    description: "Saubere und unsaubere Wiederholungen werden für den Kniebeugen-Test gezählt und bewertet.",
  },
  {
    title: "Activity Recognition",
    status: "ready",
    description: "Browser-Sensoren erkennen erste Bewegungsmuster. Native Handy-Chip-Daten folgen später über HealthKit, Health Connect oder CoreMotion.",
  },
  {
    title: "Server-Plausibilisierung",
    status: "planned",
    description: "Der Client darf später nur Beweise senden. Finale Missionsergebnisse und Rewards müssen serverseitig validiert werden.",
  },
];
