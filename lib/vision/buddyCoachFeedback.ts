import type { ExerciseCounterState, MoodSignal } from "./visionTypes";
import { getMoodSignalLabel } from "./moodSignalEngine";

function moodHint(signal: MoodSignal) {
  if (signal === "strained") return "Du wirkst etwas angestrengt. Qualität zählt mehr als Tempo.";
  if (signal === "uneasy") return "Kurz stabilisieren, dann ruhig weiter.";
  if (signal === "tired") return "Mach langsam. Eine saubere Wiederholung ist besser als viele schnelle.";
  if (signal === "motivated") return "Flammi merkt deine Motivation. Stark bleiben!";
  if (signal === "focused") return "Guter Fokus. Halte die Bewegung kontrolliert.";
  if (signal === "calm") return "Ruhig und stabil – sehr gute Grundlage.";
  return "Flammi achtet auf saubere Bewegung und unterstützt dich.";
}

export function getBuddyCoachFeedback(counter: ExerciseCounterState) {
  const mood = getMoodSignalLabel(counter.moodSignal);
  const quality = counter.qualityScore;

  if (!counter.isTracking) {
    return "Flammi wartet auf die Kamera. Danach prüft er Bewegung und Qualität.";
  }

  if (counter.confidence < 35) {
    return "Flammi sieht dich noch nicht gut genug. Stelle dein Handy so auf, dass dein ganzer Körper sichtbar ist.";
  }

  if (quality >= 80) {
    return `Flammi: Sehr sauber! Stimmungssignal: ${mood}. ${moodHint(counter.moodSignal)}`;
  }

  if (quality >= 55) {
    return `Flammi: Gute Richtung. Noch etwas stabiler und kontrollierter. Stimmungssignal: ${mood}. ${moodHint(counter.moodSignal)}`;
  }

  return `Flammi: Noch nicht sauber genug. Geh langsamer, Rücken stabil, Knie kontrolliert. Stimmungssignal: ${mood}. ${moodHint(counter.moodSignal)}`;
}
