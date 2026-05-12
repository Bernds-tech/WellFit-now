export type WeeklyMissionServerResult = {
  source: "server" | "local";
  status: "completion_ready" | "manual_review_required" | "completion_blocked";
  rewardPreviewStatus: "preview_allowed" | "manual_review" | "blocked" | "fallback";
  approvedPointsPreview: number;
  approvedXpPreview: number;
  projectedPoints: number;
  projectedXp: number;
  buddySyncMessage: string;
  draftCollections: string[];
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

async function fetchWeeklyRewardPreview(params: {
  userId: string;
  mission: WeeklyMissionInput;
}) {
  const response = await fetch("/api/economy/reward-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: params.userId,
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
      evidenceSummary: `Weekly mission reward preview: ${params.mission.title}.`,
      riskSummary: {
        proofQuality: "unknown",
        cooldownRisk: "unknown",
        patternRisk: "unknown",
        notes: ["Weekly mission reward preview before completion draft."],
      },
    }),
  });

  if (!response.ok) return null;
  return (await response.json()) as {
    ok?: boolean;
    status?: "preview_allowed" | "manual_review" | "blocked";
    cappedPoints?: unknown;
    serverDraft?: { collection?: string };
  };
}

async function fetchWeeklyCompletion(params: {
  userId: string;
  mission: WeeklyMissionInput;
  requestedPoints: number;
}) {
  const response = await fetch("/api/economy/complete-mission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: params.userId,
      missionId: `weekly-${params.mission.id}`,
      sourceId: `weekly-mission-${params.mission.id}`,
      sourceType: "mission",
      missionType: getMissionType(params.mission),
      requestedPoints: params.requestedPoints,
      requestedXp: params.requestedPoints,
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

  if (!response.ok) return null;
  return (await response.json()) as {
    ok?: boolean;
    status?: unknown;
    approvedPointsPreview?: unknown;
    approvedXpPreview?: unknown;
    serverDrafts?: Array<{ collection?: string }>;
    nextServerStep?: unknown;
  };
}

async function fetchWeeklyUserProjection(params: {
  userId: string;
  points: number;
  xp: number;
  level: number;
}) {
  try {
    const response = await fetch("/api/economy/user-projection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: params.userId,
        points: params.points,
        xp: params.xp,
        level: params.level,
      }),
    });

    if (!response.ok) return null;
    return (await response.json()) as { ok?: boolean; projection?: { balance?: { points?: unknown; xp?: unknown } } };
  } catch {
    return null;
  }
}

async function fetchWeeklyBuddySync(params: {
  userId: string;
  mission: WeeklyMissionInput;
  rewardPoints: number;
}) {
  try {
    const response = await fetch("/api/economy/buddy-sync-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: params.userId,
        missionId: `weekly-${params.mission.id}`,
        missionTitle: params.mission.title,
        missionType: params.mission.description,
        rewardPoints: params.rewardPoints,
        source: "dailyMission",
      }),
    });

    if (!response.ok) return "Buddy-Sync-Draft nicht erreichbar. MVP-Bruecke bleibt aktiv.";
    const data = (await response.json()) as { ok?: boolean };
    return data.ok
      ? "Buddy-Sync-Preview serverseitig vorgemerkt."
      : "Buddy-Sync-Preview nicht bestaetigt. MVP-Bruecke bleibt aktiv.";
  } catch {
    return "Buddy-Sync-Preview im lokalen Fallback.";
  }
}

export async function fetchWeeklyMissionCompletion(params: {
  userId: string | null;
  mission: WeeklyMissionInput;
  currentPoints?: number;
  currentXp?: number;
  currentLevel?: number;
}): Promise<WeeklyMissionServerResult> {
  const userId = params.userId ?? "weekly-mission-beta-user";
  const fallback: WeeklyMissionServerResult = {
    source: "local",
    status: "completion_ready",
    rewardPreviewStatus: "fallback",
    approvedPointsPreview: Math.max(0, params.mission.reward),
    approvedXpPreview: Math.max(0, params.mission.reward),
    projectedPoints: Math.max(0, params.currentPoints ?? 0) + Math.max(0, params.mission.reward),
    projectedXp: Math.max(0, params.currentXp ?? 0) + Math.max(0, params.mission.reward),
    buddySyncMessage: "Buddy-Sync lokal vorgemerkt.",
    draftCollections: [],
    message: "Wochenmission lokal vorgemerkt. Server-Pfade bleiben Zielpfad.",
  };

  try {
    const rewardPreview = await fetchWeeklyRewardPreview({ userId, mission: params.mission });
    if (!rewardPreview?.ok || rewardPreview.status === "blocked") {
      return rewardPreview?.status === "blocked"
        ? { ...fallback, source: "server", status: "completion_blocked", rewardPreviewStatus: "blocked", approvedPointsPreview: 0, approvedXpPreview: 0, message: "Reward-Preview blockiert diese Wochenmission." }
        : fallback;
    }

    if (rewardPreview.status === "manual_review") {
      return {
        ...fallback,
        source: "server",
        status: "manual_review_required",
        rewardPreviewStatus: "manual_review",
        approvedPointsPreview: 0,
        approvedXpPreview: 0,
        message: "Reward-Preview verlangt Review. Keine direkte Punktegutschrift.",
      };
    }

    const requestedPoints = Math.max(0, Math.floor(asNumber(rewardPreview.cappedPoints, params.mission.reward)));
    const completion = await fetchWeeklyCompletion({ userId, mission: params.mission, requestedPoints });
    if (!completion?.ok) return fallback;

    if (
      completion.status !== "completion_ready" &&
      completion.status !== "manual_review_required" &&
      completion.status !== "completion_blocked"
    ) {
      return fallback;
    }

    const approvedPointsPreview = Math.max(0, Math.floor(asNumber(completion.approvedPointsPreview, fallback.approvedPointsPreview)));
    const approvedXpPreview = Math.max(0, Math.floor(asNumber(completion.approvedXpPreview, fallback.approvedXpPreview)));
    const projectedPoints = Math.max(0, params.currentPoints ?? 0) + approvedPointsPreview;
    const projectedXp = Math.max(0, params.currentXp ?? 0) + approvedXpPreview;
    const projection = await fetchWeeklyUserProjection({
      userId,
      points: projectedPoints,
      xp: projectedXp,
      level: params.currentLevel ?? 1,
    });
    const buddySyncMessage = await fetchWeeklyBuddySync({ userId, mission: params.mission, rewardPoints: approvedPointsPreview });
    const draftCollections = [
      rewardPreview.serverDraft?.collection,
      ...(completion.serverDrafts ?? []).map((draft) => draft.collection),
      projection?.ok ? "userEconomyProjections" : undefined,
      "buddySyncPreview",
    ].filter((collection): collection is string => typeof collection === "string");

    return {
      source: "server",
      status: completion.status,
      rewardPreviewStatus: rewardPreview.status ?? "fallback",
      approvedPointsPreview,
      approvedXpPreview,
      projectedPoints,
      projectedXp,
      buddySyncMessage,
      draftCollections,
      message:
        completion.status === "completion_ready"
          ? "Wochenmission nutzt Reward-Preview, Completion, Projection und Buddy-Sync-Preview."
          : "Wochenmission wurde serverseitig bewertet.",
    };
  } catch {
    return fallback;
  }
}
