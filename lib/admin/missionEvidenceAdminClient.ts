import { getFunctions, httpsCallable } from "firebase/functions";
import { beta1AdminClient } from "./beta1AdminClient";

export type MissionEvidenceReviewStatus =
  | "pending-server-review"
  | "approved"
  | "rejected"
  | "needs-more-evidence";

export type MissionEvidenceReviewDecision = "approved" | "rejected" | "needs-more-evidence";

export type MissionEvidencePoseSummary = {
  schemaVersion: string;
  exercise: string;
  targetReps: number;
  validReps: number;
  invalidReps: number;
  qualityScore: number;
  confidence: number;
  moodSignal?: string | null;
  rawMediaStored: boolean;
  rawMediaUploaded: boolean;
  onDeviceAnalysis: boolean;
};

export type MissionEvidenceQueueItem = {
  evidenceId: string;
  attemptId?: string | null;
  missionId?: string | null;
  ownerUserId?: string | null;
  childProfileId?: string | null;
  evidenceType: string;
  status: string;
  reviewStatus: MissionEvidenceReviewStatus;
  serverValidationStatus: string;
  storageRefPresent: boolean;
  metadataKeys: string[];
  poseProofStatus?:
    | "not-applicable"
    | "missing-server-record"
    | "mismatched-server-record"
    | "invalid-server-summary"
    | "verified-server-record";
  poseSummary?: MissionEvidencePoseSummary | null;
  createdAt?: string | null;
  reviewedAt?: string | null;
};

type EvidenceListResponse = {
  accepted?: boolean;
  reviewStatus?: MissionEvidenceReviewStatus;
  evidence?: MissionEvidenceQueueItem[];
  count?: number;
  rawMetadataIncluded?: boolean;
  storageContentIncluded?: boolean;
  poseSummaryIncluded?: boolean;
  message?: string;
};

type EvidenceReviewResponse = {
  accepted?: boolean;
  evidenceId?: string;
  decision?: MissionEvidenceReviewDecision;
  serverValidationStatus?: string;
  idempotent?: boolean;
  message?: string;
};

export type MissionEvidenceListResult = {
  accepted: boolean;
  evidence: MissionEvidenceQueueItem[];
  message?: string;
};

export type MissionEvidenceReviewResult = {
  accepted: boolean;
  evidenceId?: string;
  decision?: MissionEvidenceReviewDecision;
  message?: string;
};

function errorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${message}`.toLowerCase();
  if (diagnostic.includes("unauthenticated")) return "Admin-Login erforderlich.";
  if (diagnostic.includes("permission-denied")) return "Die Admin-Rolle fehlt oder ist nicht aktuell.";
  if (diagnostic.includes("not-found")) return "Mission Evidence wurde nicht gefunden.";
  if (diagnostic.includes("failed-precondition")) return "Evidence kann in ihrem aktuellen Status nicht geändert werden.";
  if (diagnostic.includes("invalid-argument")) return "Bitte Evidence, Entscheidung und Begründung vollständig prüfen.";
  return "Die Mission-Evidence-Aktion konnte nicht sicher ausgeführt werden.";
}

async function requireAdminGuard(): Promise<{ ok: true } | { ok: false; message: string }> {
  const guard = await beta1AdminClient.assertAdminCallableAuthReady();
  if (guard.ok) return { ok: true };
  return { ok: false, message: guard.result.message || "Admin-Login erforderlich." };
}

export const missionEvidenceAdminClient = {
  async list(reviewStatus: MissionEvidenceReviewStatus = "pending-server-review"): Promise<MissionEvidenceListResult> {
    const guard = await requireAdminGuard();
    if (!guard.ok) return { accepted: false, evidence: [], message: guard.message };
    try {
      const callable = httpsCallable<
        { reviewStatus: MissionEvidenceReviewStatus; limit: number },
        EvidenceListResponse
      >(getFunctions(), "adminListMissionEvidence");
      const result = await callable({ reviewStatus, limit: 50 });
      return {
        accepted: Boolean(result.data.accepted),
        evidence: Array.isArray(result.data.evidence) ? result.data.evidence : [],
        message: result.data.accepted ? undefined : result.data.message || "Evidence Queue konnte nicht geladen werden.",
      };
    } catch (error) {
      return { accepted: false, evidence: [], message: errorMessage(error) };
    }
  },

  async review(input: {
    evidenceId: string;
    decision: MissionEvidenceReviewDecision;
    reviewNote: string;
  }): Promise<MissionEvidenceReviewResult> {
    const guard = await requireAdminGuard();
    if (!guard.ok) return { accepted: false, message: guard.message };
    const evidenceId = input.evidenceId.trim();
    const reviewNote = input.reviewNote.trim();
    if (!evidenceId || !reviewNote) {
      return { accepted: false, message: "Evidence ID und nachvollziehbare Begründung sind erforderlich." };
    }
    try {
      const callable = httpsCallable<typeof input, EvidenceReviewResponse>(getFunctions(), "adminReviewMissionEvidence");
      const result = await callable({ evidenceId, decision: input.decision, reviewNote });
      return {
        accepted: Boolean(result.data.accepted),
        evidenceId: result.data.evidenceId,
        decision: result.data.decision,
        message: result.data.accepted ? undefined : result.data.message || "Evidence Review wurde nicht angenommen.",
      };
    } catch (error) {
      return { accepted: false, message: errorMessage(error) };
    }
  },
};
