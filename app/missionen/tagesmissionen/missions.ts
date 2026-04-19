export type DailyMissionType = "Bewegung" | "Ernährung" | "Workout" | "Community" | "Abenteuer";

export type DailyMission = {
  id: string;
  title: string;
  reward: number;
  difficulty: "Leicht" | "Mittel" | "Schwer";
  description: string;
  duration: string;
  type: DailyMissionType;
};

export const dailyMissions: DailyMission[] = [
  { id: "daily-8000-steps", title: "8.000 Schritte", reward: 8, difficulty: "Mittel", description: "Erreiche heute 8.000 Schritte. Eine starke Alltagsmission für Kreislauf, Ausdauer und Grundaktivität.", duration: "1 Tag", type: "Bewegung" },
  { id: "daily-sprint-20", title: "20 Sek. Sprint", reward: 10, difficulty: "Schwer", description: "Führe 20 Sekunden intensive Bewegung aus: Sprint, Hampelmänner oder schnelles Treppensteigen.", duration: "20 Sekunden", type: "Bewegung" },
  { id: "daily-squats-15", title: "15 saubere Kniebeugen", reward: 9, difficulty: "Mittel", description: "Mache 15 kontrollierte Kniebeugen. Saubere Ausführung zählt mehr als Geschwindigkeit.", duration: "3 Minuten", type: "Workout" },
  { id: "daily-plank-60", title: "1 Min. Plank", reward: 12, difficulty: "Schwer", description: "Halte eine saubere Plank für 60 Sekunden. Stabilität, Core und Willenskraft werden belohnt.", duration: "1 Minute", type: "Workout" },
  { id: "daily-pushups-10", title: "10 Liegestütze", reward: 11, difficulty: "Schwer", description: "Mache 10 saubere Liegestütze. Wenn nötig auf Knien, aber mit kontrollierter Bewegung.", duration: "4 Minuten", type: "Workout" },
  { id: "daily-memory-3", title: "3 Begriffe merken", reward: 7, difficulty: "Mittel", description: "Merke dir drei Begriffe, warte kurz und rufe sie wieder ab. Trainiert Gedächtnis und Fokus.", duration: "5 Minuten", type: "Abenteuer" },
  { id: "daily-healthy-meal", title: "Bewusste Mahlzeit", reward: 6, difficulty: "Leicht", description: "Iss eine bewusste Mahlzeit mit Gemüse, Eiweiß oder wenig Zucker. Ziel ist bessere Entscheidung, nicht Perfektion.", duration: "1 Mahlzeit", type: "Ernährung" },
  { id: "daily-water-1500", title: "1,5L Wasser", reward: 6, difficulty: "Leicht", description: "Trinke über den Tag verteilt mindestens 1,5 Liter Wasser. Unterstützt Energie, Konzentration und Regeneration.", duration: "1 Tag", type: "Ernährung" },
  { id: "daily-breathing-3", title: "3 Min. Atemruhe", reward: 5, difficulty: "Leicht", description: "Atme 3 Minuten ruhig und bewusst. Senkt Stress und stärkt Selbstkontrolle.", duration: "3 Minuten", type: "Community" },
  { id: "daily-screen-break", title: "10 Min. Bildschirmpause", reward: 5, difficulty: "Leicht", description: "Lege das Handy weg und gönne Augen und Kopf 10 Minuten Pause. Ein kleiner Reset mit großer Wirkung.", duration: "10 Minuten", type: "Community" },
];

export function missionIcon(type: DailyMissionType) {
  return type === "Bewegung" ? "🏃" : type === "Ernährung" ? "🥗" : type === "Workout" ? "💪" : type === "Community" ? "🧘" : "🧠";
}
