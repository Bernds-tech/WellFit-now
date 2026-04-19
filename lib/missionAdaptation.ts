export type MissionPeriod = "daily" | "weekly" | "open";

export type MissionAdaptationInput = {
  period?: MissionPeriod;
  completedInPeriod?: boolean;
  expiredUnfinished?: boolean;
  currentTargetValue?: number;
  lastCompletedTargetValue?: number;
  successStreak?: number;
  failedPeriodCount?: number;
  userAverageValue?: number;
  unit?: string;
};

export type MissionAdaptationResult = {
  nextTargetValue: number;
  difficultyAction: "increase" | "hold" | "reduce_after_expiry";
  reason: string;
};

export function adaptMissionTarget(input: MissionAdaptationInput): MissionAdaptationResult {
  const current = Math.max(1, Math.round(input.currentTargetValue ?? input.lastCompletedTargetValue ?? input.userAverageValue ?? 10));
  const average = Math.max(1, Math.round(input.userAverageValue ?? current));
  const streak = Math.max(0, input.successStreak ?? 0);
  const failures = Math.max(0, input.failedPeriodCount ?? 0);

  if (input.completedInPeriod) {
    const increaseRate = streak >= 5 ? 0.08 : streak >= 2 ? 0.05 : 0.03;
    const next = Math.max(current + 1, Math.round(current * (1 + increaseRate)));
    return { nextTargetValue: next, difficultyAction: "increase", reason: "Mission abgeschlossen: nächstes Ziel wird kontrolliert erhöht." };
  }

  if (input.expiredUnfinished) {
    const reduceRate = failures >= 3 ? 0.15 : 0.08;
    const next = Math.max(1, Math.round(Math.max(average * 0.9, current * (1 - reduceRate))));
    return { nextTargetValue: next, difficultyAction: "reduce_after_expiry", reason: "Mission-Zeitraum abgelaufen: nächstes Ziel wird angepasst." };
  }

  return { nextTargetValue: current, difficultyAction: "hold", reason: "Mission läuft noch: Schwierigkeit bleibt stabil." };
}
