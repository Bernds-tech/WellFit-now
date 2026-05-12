export type WeeklyMissionServerResult = {
  source: "server" | "local";
  status: "completion_ready" | "manual_review_required" | "completion_blocked";
  approvedPointsPreview: number;
  approvedXpPreview: number;
  message: string;
};

type WeeklyMissionInput = {
  id: number;
  title: string;
  reward: number;
  description: string;
};

const asNumber = (value: unknown, fallback: number) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const getMissionType = (mission: WeeklyMissionInput) => {
  const text = `${mission.title} ${mission.description}`.toLowerCase();
  if (text.includes("wissen") || text.includes("lern")) return "learning";
  if (text.includes("community")) return "social_challenge";
  return "movement";
};

export async function fetchWeeklyMissionCompletion(params: {
  userId: string | null;
  mission: WeeklyMissionInput;
}): Promise<WeeklyMissionServerResult> {
  const fallback: WeeklyMissionServerResult = {
    source: "local",
    status: "completion_ready",
    approvedPointsPreview: Math.max(0, params.mission.reward),
    approvedXpPreview: Math.max(0, params.mission.reward),
    message: "Wochenmission lokal vorgemerkt. Server-Completion bleibt Zielpfad.",
  };

  try {
    const response = await fetch("/api/economy/complete-mission", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: params.userId ?? "weekly-mission-beta-user",
        missionId: `weekly-${params.mission.id}`,
        sourceId: `weekly-mission-${params.mission.id}`,
        sourceType: "mission",
        missionType: getMissionType(params.mission),
        requestedPoints: params.mission.reward,
        requestedXp: params.mission.reward,
        usage: {
          emittedToday: 0,
          userEarnedToday: 0,
          missionTypeEarnedToday: 0,
        },
        evidenceSummary: `Weekly mission beta completion: ${params.mission.title}.`,
        completionEvidenceSummary: "Weekly mission beta bridge. Final server writes are not active yet.",
        riskSummary: {
          proofQuality: "unknown",
          cooldownRisk: "unknown",
          patternRisk: "unknown",
          notes: ["Weekly mission uses server completion draft before final persistence."],
        },
      }),
    });

    if (!response.ok) return fallback;

    const data = (await response.json()) as {
      ok?: boolean;
      status?: unknown;
      approvedPointsPreview?: unknown;
      approvedXpPreview?: unknown;
      nextServerStep?: unknown;
    };

    if (!data.ok) return fallback;
    if (
      data.status !== "completion_ready" &&
      data.status !== "manual_review_required" &&
      data.status !== "completion_blocked"
    ) {
      return fallback;
    }

    return {
      source: "server",
      status: data.status,
      approvedPointsPreview: Math.max(0, Math.floor(asNumber(data.approvedPointsPreview, fallback.approvedPointsPreview))),
      approvedXpPreview: Math.max(0, Math.floor(asNumber(data.approvedXpPreview, fallback.approvedXpPreview))),
      message:
        typeof data.nextServerStep === "string"
          ? "Wochenmission serverseitig bewertet; finale Persistenz folgt später."
          : "Wochenmission serverseitig bewertet.",
    };
  } catch {
    return fallback;
  }
}
