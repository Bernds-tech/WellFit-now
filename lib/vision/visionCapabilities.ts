import type { VisionCapability } from "./visionTypes";

export const visionCapabilities: VisionCapability[] = [
  {
    title: "Kamera-Preview",
    status: "ready",
    description: "Startet nach Zustimmung die Live-Kamera als Grundlage für Training und AR.",
  },
  {
    title: "Skeleton Tracking",
    status: "planned",
    description: "Körperpunkte, Gelenkwinkel und Bewegungsqualität werden in dieser Phase angebunden.",
  },
  {
    title: "Face Tracking",
    status: "planned",
    description: "Gesicht, Blickrichtung und Mimik werden nur nach Zustimmung analysiert.",
  },
  {
    title: "Übungszählung",
    status: "planned",
    description: "Saubere Wiederholungen werden gezählt, unsaubere Wiederholungen markiert.",
  },
];
