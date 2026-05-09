import type { EconomyServerLedgerDraft } from "./serverLedgerDraft";

export type EconomyServerPersistenceMode = "draft_only" | "server_write_ready";
export type EconomyServerPersistenceRequestStatus =
  | "dry_run_ready"
  | "blocked_persistence_disabled"
  | "blocked_collection_not_allowed"
  | "blocked_invalid_document_id";

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

export type EconomyServerPersistenceRequest = {
  status: EconomyServerPersistenceRequestStatus;
  draft: EconomyServerLedgerDraft;
  mode: EconomyServerPersistenceMode;
  writeEnabled: false;
  finalAuthority: false;
  tokenized: false;
  collection: string;
  documentId: string;
  path: string;
  reasons: string[];
  nextServerStep: string;
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

const validDocumentIdPattern = /^[a-z0-9_-]{1,180}$/;

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

export function isEconomyServerPersistenceCollectionAllowed(collection: string) {
  return allowedCollectionsWhenEnabled.includes(collection);
}

export function isEconomyServerPersistenceDocumentIdValid(documentId: string) {
  return validDocumentIdPattern.test(documentId);
}

export function createEconomyServerPersistenceRequest(
  draft: EconomyServerLedgerDraft
): EconomyServerPersistenceRequest {
  const status = assertEconomyServerPersistenceDisabled();
  const collectionAllowed = isEconomyServerPersistenceCollectionAllowed(draft.collection);
  const documentIdValid = isEconomyServerPersistenceDocumentIdValid(draft.documentId);
  const reasons: string[] = [];

  if (!collectionAllowed) {
    reasons.push("collection_not_in_allowed_future_server_write_set");
  }

  if (!documentIdValid) {
    reasons.push("invalid_document_id_for_future_firestore_write");
  }

  if (!draft.writeNow) {
    reasons.push("draft_write_now_false");
  }

  reasons.push("economy_server_persistence_currently_draft_only");

  const requestStatus: EconomyServerPersistenceRequestStatus = !collectionAllowed
    ? "blocked_collection_not_allowed"
    : !documentIdValid
      ? "blocked_invalid_document_id"
      : status.writeEnabled
        ? "dry_run_ready"
        : "blocked_persistence_disabled";

  return {
    status: requestStatus,
    draft,
    mode: status.mode,
    writeEnabled: false,
    finalAuthority: false,
    tokenized: false,
    collection: draft.collection,
    documentId: draft.documentId,
    path: `${draft.collection}/${draft.documentId}`,
    reasons,
    nextServerStep:
      requestStatus === "dry_run_ready"
        ? "When guardrails are complete, persist this draft through server-only Firestore/Admin code."
        : "Keep returning this as a dry-run persistence request until Auth, Admin SDK, emulator tests and rules hardening are complete.",
  };
}

export function createEconomyServerPersistenceRequests(drafts: EconomyServerLedgerDraft[]) {
  return drafts.map((draft) => createEconomyServerPersistenceRequest(draft));
}
