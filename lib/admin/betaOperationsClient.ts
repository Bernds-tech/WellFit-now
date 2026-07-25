import { getFunctions, httpsCallable } from "firebase/functions";
import { beta1AdminClient } from "./beta1AdminClient";

export type OperationsWindowDays = 7 | 14 | 30;

export type RetentionMetric = {
  day: number;
  eligibleAccounts: number;
  retainedAccounts: number | null;
  ratePercent: number | null;
  suppressed: boolean;
  minimumCohortSize: number;
  definition: string;
};

export type BetaOperationsDailyMetric = {
  dateKey: string;
  engagedUsers: number;
  missionStarts: number;
  evidenceSubmitted: number;
  completions: number;
  approvedEvidence: number;
  rejectedEvidence: number;
  needsMoreEvidence: number;
};

export type BetaOperationsSnapshot = {
  accepted: boolean;
  snapshotVersion: string;
  generatedAt: string;
  window: {
    days: OperationsWindowDays;
    startAt: string;
    endAt: string;
    calendarAuthority: string;
  };
  privacy: {
    aggregateOnly: boolean;
    returnsUserIdentifiers: boolean;
    returnsEmailAddresses: boolean;
    returnsHealthData: boolean;
    returnsCoordinates: boolean;
    returnsEvidenceContent: boolean;
    minimumRetentionCohortSize: number;
    engagementDefinition: string;
  };
  accounts: {
    initializedTotal: number;
    newInWindow: number;
    analyticsOptInTotal: number;
    analyticsOptInRatePercent: number | null;
    engagedInWindow: number;
    activationEligibleAccounts: number;
    activatedWithin24Hours: number;
    activationRatePercent: number | null;
    activationDefinition: string;
  };
  retention: {
    d1: RetentionMetric;
    d7: RetentionMetric;
  };
  missions: {
    starts: number;
    uniqueStarters: number;
    evidenceSubmissions: number;
    attemptsWithEvidence: number;
    evidenceSubmissionRatePercent: number | null;
    completions: number;
    uniqueCompleters: number;
    completionRatePercent: number | null;
    rateDefinition: string;
  };
  evidence: {
    pendingTotal: number;
    reviewedInWindow: number;
    approvedInWindow: number;
    rejectedInWindow: number;
    needsMoreEvidenceInWindow: number;
    approvalRatePercent: number | null;
    medianReviewHours: number | null;
    p90ReviewHours: number | null;
    measuredReviewCount: number;
  };
  economy: {
    currency: "WFXP";
    grantedInWindow: number;
    uniqueEarners: number;
    noMonetaryValue: boolean;
    blockchainBacked: boolean;
    cashoutAllowed: boolean;
    tokenAuthorized: boolean;
    realMoney: boolean;
  };
  operations: {
    openSafetyReports: number;
    safetyReportsCreatedInWindow: number;
    failedDataExportsInWindow: number;
    blockedAccountDeletions: number;
    knownFailureSignals: number;
    manualPatternReviewsInWindow: number;
    patternWatchlistSignalsInWindow: number;
    hardCooldownSignalsInWindow: number;
    softCooldownSignalsInWindow: number;
    riskSignalsInWindow: number;
  };
  daily: BetaOperationsDailyMetric[];
  scan: {
    maxDocumentsPerCollection: number;
    truncatedCollections: string[];
    complete: boolean;
  };
  tokenAuthorized: boolean;
  cashoutAllowed: boolean;
  realMoney: boolean;
};

type OperationsCallableResponse = Partial<BetaOperationsSnapshot> & {
  accepted?: boolean;
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
  if (diagnostic.includes("resource-exhausted")) return "Die Betriebsdatenabfrage ist momentan zu groß. Bitte Scan-Grenzen prüfen.";
  if (diagnostic.includes("unavailable")) return "Firebase Functions sind derzeit nicht erreichbar.";
  return "Das Beta-Betriebscockpit konnte nicht sicher geladen werden.";
}

function validSnapshot(value: OperationsCallableResponse): value is BetaOperationsSnapshot {
  return Boolean(
    value.accepted === true
    && value.window
    && value.accounts
    && value.retention
    && value.missions
    && value.evidence
    && value.economy
    && value.operations
    && Array.isArray(value.daily)
    && value.scan,
  );
}

export async function getBetaOperationsSnapshot(windowDays: OperationsWindowDays): Promise<BetaOperationsSnapshot> {
  const guard = await beta1AdminClient.assertAdminCallableAuthReady();
  if (!guard.ok) throw new Error(guard.result.message || "Admin-Login erforderlich.");
  try {
    const callable = httpsCallable<{ windowDays: OperationsWindowDays }, OperationsCallableResponse>(
      getFunctions(),
      "getBetaOperationsSnapshot",
    );
    const result = await callable({ windowDays });
    if (!validSnapshot(result.data)) {
      throw new Error(result.data.message || "Die Betriebsprojektion ist unvollständig.");
    }
    return result.data;
  } catch (error) {
    throw new Error(errorMessage(error));
  }
}
