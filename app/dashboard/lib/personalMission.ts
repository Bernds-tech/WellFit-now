import type { User } from "@/types/user";
import type { Beta1MissionSummary } from "@/lib/beta1/beta1Types";
import type { PersonalMission } from "../types";

type PersonalMissionProfile = {
  activityType?: string;
  fitnessLevel?: string;
  goals?: string[];
  activities?: string[];
  vitals?: {
    sleepQuality?: string;
  };
  activity?: {
    activityLevel?: string;
    goals?: string[];
    activities?: string[];
  };
};

type PersonalMissionUser = (User & { profile?: PersonalMissionProfile }) | null | undefined;

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
  movement: "Bewegung",
  learning: "Lernen",
  social: "Gemeinsam",
} as Record<string, string>)[value ?? ""] ?? "Bewegung";

export function getPersonalMission(user: PersonalMissionUser): PersonalMission {
  const profile = user?.profile ?? {};
  const activity = profile.activity ?? {};
  const vitals = profile.vitals ?? {};

  const goals = activity.goals ?? profile.goals ?? [];
  const activities = activity.activities ?? profile.activities ?? [profile.activityType ?? "walking"];

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
    serverBacked: false,
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

export function selectPublishedDashboardMission(missions: Beta1MissionSummary[]): Beta1MissionSummary | null {
  const published = missions.filter((mission) => mission.status === "published");
  return published.find((mission) => mission.type === "movement") ?? published[0] ?? null;
}

export function getServerBackedDashboardMission(
  mission: Beta1MissionSummary,
  fallback: PersonalMission,
): PersonalMission {
  return {
    id: mission.id,
    serverBacked: true,
    title: mission.title,
    steps: fallback.steps,
    activity: label(mission.type),
    goal: fallback.goal,
    focus: mission.type === "learning"
      ? "Lernen mit serverseitiger Fortschrittsprüfung"
      : mission.type === "social"
        ? "Gemeinsame Aktivität mit serverseitiger Prüfung"
        : "Bewegung mit serverseitiger Evidence-Prüfung",
    reward: typeof mission.rewardXp === "number" && mission.rewardXp > 0
      ? Math.min(Math.floor(mission.rewardXp), 100)
      : fallback.reward,
    note: "XP werden erst nach serverseitiger Evidence-Prüfung und Freigabe gutgeschrieben.",
  };
}
