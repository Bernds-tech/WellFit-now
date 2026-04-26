import type { ExerciseCounterState, ExerciseEvaluation, ExercisePhase, MoodSignal, PoseAnalysisResult } from "./visionTypes";
import { getSquatPhase, getSquatQualityScore, isValidSquatRep } from "./exerciseRules";

export const initialExerciseCounterState: ExerciseCounterState = {
  exercise: "squat",
  validReps: 0,
  invalidReps: 0,
  confidence: 0,
  qualityScore: 0,
  moodSignal: "unknown",
  phase: "unknown",
  feedback: "Starte die Kamera. Danach erkennt WellFit deine Kniebeugen über Körperpunkte.",
  isTracking: false,
};

function getBasicFeedback(phase: ExercisePhase, qualityScore: number, detected: boolean) {
  if (!detected) return "Stelle dich so hin, dass dein ganzer Körper gut sichtbar ist.";
  if (phase === "standing") return "Bereit. Gehe kontrolliert in die Kniebeuge.";
  if (phase === "descending") return "Langsam und stabil weiter nach unten.";
  if (phase === "bottom") return qualityScore >= 70 ? "Tiefe erreicht. Jetzt kontrolliert hoch." : "Tiefe gut, aber achte auf Stabilität und Rücken.";
  if (phase === "ascending") return "Kontrolliert hochkommen, nicht springen.";
  return "Halte deinen Körper gut sichtbar und bewege dich langsam.";
}

export function updateSquatCounter(
  previous: ExerciseCounterState,
  analysis: PoseAnalysisResult,
  moodSignal: MoodSignal = "unknown"
): ExerciseEvaluation {
  const nextPhase = getSquatPhase(previous.phase, analysis);
  const qualityScore = getSquatQualityScore(analysis);
  const completedRep = (previous.phase === "bottom" || previous.phase === "ascending") && nextPhase === "standing";
  const validRep = completedRep && isValidSquatRep(analysis);
  const invalidRep = completedRep && !validRep;

  return {
    ...previous,
    phase: nextPhase,
    confidence: analysis.confidence,
    qualityScore,
    moodSignal,
    validReps: previous.validReps + (validRep ? 1 : 0),
    invalidReps: previous.invalidReps + (invalidRep ? 1 : 0),
    feedback: completedRep
      ? validRep
        ? "Saubere Wiederholung gezählt. Stark!"
        : "Wiederholung erkannt, aber noch nicht sauber genug. Langsamer und stabiler."
      : getBasicFeedback(nextPhase, qualityScore, analysis.detected),
    isTracking: true,
    detected: analysis.detected,
    lastRepValid: completedRep ? validRep : undefined,
  };
}
