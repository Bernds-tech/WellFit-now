const label = (value?: string) => ({
  loseWeight: "Abnehmen",
  fitness: "Fitness",
  health: "Gesundheit",
  adventure: "Abenteuer",
  walking: "Gehen",
  running: "Laufen",
  cycling: "Radfahren",
  dancing: "Tanzen",
  workout: "Workout",
  relax: "Entspannung",
} as Record<string, string>)[value ?? ""] ?? "Bewegung";

export function getPersonalMission(user: any) {
  const profile = user?.profile ?? {};
  const activity = profile.activity ?? {};
  const vitals = profile.vitals ?? {};

  const goals: string[] = activity.goals ?? profile.goals ?? [];
  const activities: string[] =
    activity.activities ?? profile.activities ?? [profile.activityType ?? "walking"];

  const mainGoal = goals[0] ?? "health";
  const mainActivity = activities[0] ?? "walking";

  const beginner =
    activity.activityLevel === "Einsteiger" ||
    profile.fitnessLevel === "beginner";

  const steps = beginner
    ? 1500
    : mainActivity === "running"
    ? 2500
    : mainActivity === "cycling"
    ? 3000
    : 2000;

  const title =
    mainGoal === "loseWeight"
      ? "Flammi Fatburn Start"
      : mainGoal === "adventure"
      ? "Flammi Entdeckerpfad"
      : mainGoal === "fitness"
      ? "Flammi Power Start"
      : "Flammi Balance Start";

  const focus =
    mainGoal === "loseWeight"
      ? "leichte Aktivierung und Fettstoffwechsel"
      : mainGoal === "adventure"
      ? "Bewegung mit Entdecken"
      : mainGoal === "fitness"
      ? "Kraft, Ausdauer und Energie"
      : "gesunde Routine und Wohlbefinden";

  return {
    title,
    steps,
    activity: label(mainActivity),
    goal: label(mainGoal),
    focus,
    reward: beginner ? 20 : 35,
    note:
      vitals.sleepQuality === "Schlecht"
        ? "Heute sanft starten: Schlaf war nicht optimal."
        : "Guter Startpunkt für deine erste Routine.",
  };
}
