export type EconomyClientWriteRiskLevel = "mvp_allowed" | "server_only_target" | "blocked";

export type EconomyClientWriteRiskField = {
  field: string;
  collection: string;
  currentStatus: EconomyClientWriteRiskLevel;
  targetStatus: EconomyClientWriteRiskLevel;
  reason: string;
  serverPath: string;
};

export type EconomyServerCompletionStage = {
  id: string;
  title: string;
  owner: "client" | "server" | "firestore_rules" | "audit";
  finalAuthority: boolean;
  description: string;
};

export const userEconomyClientWriteRiskFields: EconomyClientWriteRiskField[] = [
  {
    collection: "users/{userId}",
    field: "points",
    currentStatus: "mvp_allowed",
    targetStatus: "server_only_target",
    reason: "User balance must be derived from server-authorized ledger events.",
    serverPath: "RewardPreview -> Completion -> LedgerEvent -> UserStats projection",
  },
  {
    collection: "users/{userId}",
    field: "xp",
    currentStatus: "mvp_allowed",
    targetStatus: "server_only_target",
    reason: "XP changes influence levels and rewards, so the client must not be final authority.",
    serverPath: "RewardPreview -> Completion -> LedgerEvent -> Level projection",
  },
  {
    collection: "users/{userId}",
    field: "level",
    currentStatus: "mvp_allowed",
    targetStatus: "server_only_target",
    reason: "Level unlocks and caps must be based on audited XP/ledger state.",
    serverPath: "LedgerEvent -> UserStats projection -> Level summary",
  },
  {
    collection: "users/{userId}",
    field: "avatar",
    currentStatus: "mvp_allowed",
    targetStatus: "server_only_target",
    reason: "Avatar state can contain energy, hunger, level and spend-preview summaries.",
    serverPath: "SpendPreview -> SpendCompletion -> LedgerEvent -> Avatar projection",
  },
  {
    collection: "users/{userId}",
    field: "energy",
    currentStatus: "mvp_allowed",
    targetStatus: "server_only_target",
    reason: "Energy can influence mission and buddy state, so it must become server-derived.",
    serverPath: "Completion -> LedgerEvent -> Buddy/UserStats projection",
  },
  {
    collection: "users/{userId}",
    field: "stepsToday",
    currentStatus: "mvp_allowed",
    targetStatus: "server_only_target",
    reason: "Steps are evidence/context for mission completion and should not authorize rewards directly.",
    serverPath: "Tracking evidence -> Completion validation -> LedgerEvent",
  },
  {
    collection: "users/{userId}",
    field: "lastMissionCompletedAt",
    currentStatus: "mvp_allowed",
    targetStatus: "server_only_target",
    reason: "Completion timestamps are audit-critical and must be written by the completion authority.",
    serverPath: "Completion validation -> Audit event -> UserStats projection",
  },
  {
    collection: "users/{userId}",
    field: "deviceLocation",
    currentStatus: "mvp_allowed",
    targetStatus: "server_only_target",
    reason: "Location is sensitive evidence/context and must remain consent-bound and non-authoritative on the client.",
    serverPath: "Consent -> Evidence summary -> Completion validation",
  },
];

export const serverOnlyEconomyCollections = [
  "missionRewardPreviews",
  "missionRewardEvents",
  "missionEvidenceReviews",
  "missionPatternReviews",
  "missionCooldownReviews",
  "missionCompletionEvaluations",
  "missionContextEvaluations",
  "systemReserveSnapshots",
  "trackingSessions",
  "trackingProofEvents",
  "userInventory",
  "buddyCapabilities",
  "capabilityUnlockEvents",
  "buddyItemUseEvents",
  "nfcScanEvents",
] as const;

export const economyServerCompletionStages: EconomyServerCompletionStage[] = [
  {
    id: "reward-preview",
    title: "Reward Preview",
    owner: "server",
    finalAuthority: false,
    description: "Server calculates an internal-points preview, cap decision and review/block status. No final grant.",
  },
  {
    id: "completion-validation",
    title: "Mission Completion Validation",
    owner: "server",
    finalAuthority: true,
    description: "Server validates evidence, cooldown, pattern risk, mission type caps and user/day caps.",
  },
  {
    id: "ledger-event",
    title: "Ledger Event",
    owner: "server",
    finalAuthority: true,
    description: "Server writes the immutable internal reward/spend/correction event.",
  },
  {
    id: "audit-review",
    title: "Audit and Manual Review",
    owner: "audit",
    finalAuthority: true,
    description: "Suspicious or blocked completions are traceable and can be corrected without client authority.",
  },
  {
    id: "rules-hardening",
    title: "Firestore Rules Hardening",
    owner: "firestore_rules",
    finalAuthority: true,
    description: "Client write access to economy-critical fields is removed after server completion is active.",
  },
];

export function isUserEconomyClientWriteRiskField(field: string) {
  return userEconomyClientWriteRiskFields.some((entry) => entry.field === field);
}

export function getEconomyClientWriteRiskField(field: string) {
  return userEconomyClientWriteRiskFields.find((entry) => entry.field === field) ?? null;
}

export function summarizeEconomyServerCompletionPlan() {
  return {
    mode: "internal_points_beta",
    tokenized: false,
    finalClientAuthority: false,
    riskFields: userEconomyClientWriteRiskFields.map((entry) => entry.field),
    serverOnlyCollections: [...serverOnlyEconomyCollections],
    stages: economyServerCompletionStages.map((stage) => ({
      id: stage.id,
      owner: stage.owner,
      finalAuthority: stage.finalAuthority,
    })),
  };
}
