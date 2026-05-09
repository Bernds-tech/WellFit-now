export type EconomyServerPersistenceMode = "draft_only" | "server_write_ready";

export type EconomyServerPersistenceStatus = {
  mode: EconomyServerPersistenceMode;
  writeEnabled: false;
  finalAuthority: false;
  tokenized: false;
  firestoreWritesEnabled: false;
  reason: string;
  requiredBeforeEnable: string[];
  allowedCollectionsWhenEnabled: string[];
};

const requiredBeforeEnable = [
  "Firebase Admin SDK or server-only Firestore access configured outside the client bundle.",
  "Authentication and user ownership checks enforced server-side.",
  "Mission completion, spend completion, ledger and audit records persisted atomically.",
  "Dashboard and Tagesmissionen no longer rely on direct client writes for points, xp, level or avatar economy fields.",
  "Firestore emulator tests cover allow/deny cases before rules hardening.",
  "No token, NFT, wallet, payout, transfer, staking, trading or purchase flow is active.",
];

const allowedCollectionsWhenEnabled = [
  "missionRewardPreviews",
  "missionCompletionEvaluations",
  "missionRewardEvents",
  "missionContextEvaluations",
  "systemReserveSnapshots",
];

export function getEconomyServerPersistenceStatus(): EconomyServerPersistenceStatus {
  return {
    mode: "draft_only",
    writeEnabled: false,
    finalAuthority: false,
    tokenized: false,
    firestoreWritesEnabled: false,
    reason:
      "WellFit is still in internal-points beta. Economy APIs may return serverDraft records, but they must not persist final ledger/audit records yet.",
    requiredBeforeEnable,
    allowedCollectionsWhenEnabled,
  };
}

export function assertEconomyServerPersistenceDisabled() {
  const status = getEconomyServerPersistenceStatus();

  if (status.writeEnabled || status.firestoreWritesEnabled || status.finalAuthority || status.tokenized) {
    throw new Error("Economy server persistence must remain disabled until beta ledger guardrails are complete.");
  }

  return status;
}
