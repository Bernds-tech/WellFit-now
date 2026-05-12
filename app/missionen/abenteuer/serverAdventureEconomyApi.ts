export type AdventureEconomyMission = {
  id: number;
  title: string;
  shortLabel: string;
  category: string;
  description: string;
  reward: number;
  travelCost: number;
};

export type AdventureSpendResult = {
  source: "server" | "local";
  status: "spend_allowed" | "insufficient_points" | "blocked";
  spendPoints: number;
  remainingPoints: number;
  draftCollections: string[];
  message: string;
};

export type AdventureRewardResult = {
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

const asNumber = (value: unknown, fallback: number) => {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : fallback;
};

const getMissionType = (mission: AdventureEconomyMission) => {
  const text = `${mission.title} ${mission.shortLabel} ${mission.category} ${mission.description}`.toLowerCase();
  if (text.includes("museum") || text.includes("quiz") || text.includes("wissen")) return "learning";
  if (text.includes("city") || text.includes("sprint") || text.includes("park")) return "movement";
  if (text.includes("zoo") || text.includes("tier")) return "learning";
  return "ar_riddle";
};

export async function fetchAdventureTravelSpend(params: {
  userId: string;
  mission: AdventureEconomyMission;
  pointsBalance: number;
}): Promise<AdventureSpendResult> {
  const fallbackRemaining = Math.max(0, params.pointsBalance - params.mission.travelCost);
  const fallback: AdventureSpendResult = {
    source: "local",
    status: params.pointsBalance >= params.mission.travelCost ? "spend_allowed" : "insufficient_points",
    spendPoints: params.mission.travelCost,
    remainingPoints: fallbackRemaining,
    draftCollections: [],
    message: "Reise-Spend lokal vorgemerkt. Server-Spend bleibt Zielpfad.",
  };

  try {
    const response = await fetch("/api/economy/spend-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: params.userId,
        itemId: `adventure-travel-${params.mission.id}`,
        sourceId: `adventure-travel-${params.mission.id}`,
        pointsBalance: params.pointsBalance,
        customSpendPoints: params.mission.travelCost,
        customTitle: `Reise: ${params.mission.shortLabel}`,
        customType: "mission_hint",
        customDescription: `Interner Reise-/Abenteuer-Spend fuer ${params.mission.title}.`,
      }),
    });

    if (!response.ok) return fallback;
    const data = (await response.json()) as {
      ok?: boolean;
      status?: unknown;
      spendPoints?: unknown;
      remainingPoints?: unknown;
      serverDrafts?: Array<{ collection?: string }>;
      persistenceBundle?: { collections?: unknown };
    };

    if (!data.ok) return fallback;
    const status = data.status === "spend_allowed" ? "spend_allowed" : data.status === "insufficient_points" ? "insufficient_points" : "blocked";
    const bundleCollections = Array.isArray(data.persistenceBundle?.collections)
      ? data.persistenceBundle.collections.filter((item): item is string => typeof item === "string")
      : [];

    return {
      source: "server",
      status,
      spendPoints: Math.max(0, Math.floor(asNumber(data.spendPoints, fallback.spendPoints))),
      remainingPoints: Math.max(0, Math.floor(asNumber(data.remainingPoints, fallback.remainingPoints))),
      draftCollections: [
        ...(data.serverDrafts ?? []).map((draft) => draft.collection),
        ...bundleCollections,
      ].filter((collection): collection is string => typeof collection === "string"),
      message: "Reise-Spend nutzt Server-Preview und Sink-Draft-Vorstufe.",
    };
  } catch {
    return fallback;
  }
}

async function fetchAdventureRewardPreview(params: { userId: string; mission: AdventureEconomyMission }) {
  const response = await fetch("/api/economy/reward-preview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: params.userId,
      missionId: `adventure-${params.mission.id}`,
      sourceId: `adventure-${params.mission.id}`,
      sourceType: "mission",
      missionType: getMissionType(params.mission),
      requestedPoints: params.mission.reward,
      requestedXp: params.mission.reward,
      usage: { emittedToday: 0, userEarnedToday: 0, missionTypeEarnedToday: 0 },
      evidenceSummary: `Adventure reward preview: ${params.mission.title}.`,
      riskSummary: {
        proofQuality: "unknown",
        cooldownRisk: "unknown",
        patternRisk: "unknown",
        notes: ["Adventure reward preview before completion draft."],
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

async function fetchAdventureCompletion(params: { userId: string; mission: AdventureEconomyMission; requestedPoints: number }) {
  const response = await fetch("/api/economy/complete-mission", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: params.userId,
      missionId: `adventure-${params.mission.id}`,
      sourceId: `adventure-${params.mission.id}`,
      sourceType: "mission",
      missionType: getMissionType(params.mission),
      requestedPoints: params.requestedPoints,
      requestedXp: params.requestedPoints,
      usage: { emittedToday: 0, userEarnedToday: 0, missionTypeEarnedToday: 0 },
      evidenceSummary: `Adventure beta completion: ${params.mission.title}.`,
      completionEvidenceSummary: "Adventure beta bridge. Final server writes are not active yet.",
      riskSummary: {
        proofQuality: "unknown",
        cooldownRisk: "unknown",
        patternRisk: "unknown",
        notes: ["Adventure uses completion draft before final persistence."],
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
  };
}

async function fetchAdventureUserProjection(params: { userId: string; points: number; xp: number; level: number }) {
  try {
    const response = await fetch("/api/economy/user-projection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: params.userId, points: params.points, xp: params.xp, level: params.level }),
    });
    if (!response.ok) return null;
    return (await response.json()) as { ok?: boolean };
  } catch {
    return null;
  }
}

async function fetchAdventureBuddySync(params: { userId: string; mission: AdventureEconomyMission; rewardPoints: number }) {
  try {
    const response = await fetch("/api/economy/buddy-sync-preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: params.userId,
        missionId: `adventure-${params.mission.id}`,
        missionTitle: params.mission.title,
        missionType: "Abenteuer",
        rewardPoints: params.rewardPoints,
        source: "dailyMission",
      }),
    });
    if (!response.ok) return "Buddy-Sync-Draft nicht erreichbar.";
    const data = (await response.json()) as { ok?: boolean };
    return data.ok ? "Buddy-Sync-Preview serverseitig vorgemerkt." : "Buddy-Sync-Preview nicht bestaetigt.";
  } catch {
    return "Buddy-Sync-Preview im lokalen Fallback.";
  }
}

export async function fetchAdventureRewardCompletion(params: {
  userId: string;
  mission: AdventureEconomyMission;
  currentPoints: number;
  currentXp: number;
  currentLevel: number;
}): Promise<AdventureRewardResult> {
  const fallback: AdventureRewardResult = {
    source: "local",
    status: "completion_ready",
    rewardPreviewStatus: "fallback",
    approvedPointsPreview: Math.max(0, params.mission.reward),
    approvedXpPreview: Math.max(0, params.mission.reward),
    projectedPoints: Math.max(0, params.currentPoints) + Math.max(0, params.mission.reward),
    projectedXp: Math.max(0, params.currentXp) + Math.max(0, params.mission.reward),
    buddySyncMessage: "Buddy-Sync lokal vorgemerkt.",
    draftCollections: [],
    message: "Abenteuer lokal vorgemerkt. Server-Pfade bleiben Zielpfad.",
  };

  try {
    const rewardPreview = await fetchAdventureRewardPreview({ userId: params.userId, mission: params.mission });
    if (!rewardPreview?.ok || rewardPreview.status === "blocked") {
      return rewardPreview?.status === "blocked"
        ? { ...fallback, source: "server", status: "completion_blocked", rewardPreviewStatus: "blocked", approvedPointsPreview: 0, approvedXpPreview: 0, message: "Reward-Preview blockiert dieses Abenteuer." }
        : fallback;
    }

    if (rewardPreview.status === "manual_review") {
      return { ...fallback, source: "server", status: "manual_review_required", rewardPreviewStatus: "manual_review", approvedPointsPreview: 0, approvedXpPreview: 0, message: "Reward-Preview verlangt Review. Keine direkte Punktegutschrift." };
    }

    const requestedPoints = Math.max(0, Math.floor(asNumber(rewardPreview.cappedPoints, params.mission.reward)));
    const completion = await fetchAdventureCompletion({ userId: params.userId, mission: params.mission, requestedPoints });
    if (!completion?.ok) return fallback;

    if (completion.status !== "completion_ready" && completion.status !== "manual_review_required" && completion.status !== "completion_blocked") return fallback;

    const approvedPointsPreview = Math.max(0, Math.floor(asNumber(completion.approvedPointsPreview, fallback.approvedPointsPreview)));
    const approvedXpPreview = Math.max(0, Math.floor(asNumber(completion.approvedXpPreview, fallback.approvedXpPreview)));
    const projectedPoints = Math.max(0, params.currentPoints) + approvedPointsPreview;
    const projectedXp = Math.max(0, params.currentXp) + approvedXpPreview;
    const projection = await fetchAdventureUserProjection({ userId: params.userId, points: projectedPoints, xp: projectedXp, level: params.currentLevel });
    const buddySyncMessage = await fetchAdventureBuddySync({ userId: params.userId, mission: params.mission, rewardPoints: approvedPointsPreview });
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
      message: "Abenteuer nutzt Reward-Preview, Completion, Projection und Buddy-Sync-Preview.",
    };
  } catch {
    return fallback;
  }
}
