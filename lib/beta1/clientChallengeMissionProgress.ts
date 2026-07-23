import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";
import { requestCurrentCoordinates } from "@/lib/beta1/clientUserContext";
import type { Beta1NearbyMissionLocation } from "@/lib/beta1/clientNearbyMissionLocations";
import {
  getDashboardMissionAttemptStatus,
  type Beta1MissionReviewStatus,
} from "@/lib/beta1/clientMissionCommands";
import {
  CHALLENGE_CATALOG_ID,
  CHALLENGE_CATALOG_VERSION,
  CHALLENGE_COMPLETION_POLICY,
  CHALLENGE_LOCATION_POLICY,
  CHALLENGE_START_RADIUS_METERS,
  type Challenge,
} from "@/app/missionen/challenge/challengeData";

export type Beta1ChallengeActiveAttempt = {
  missionId: string;
  attemptId: string;
  attemptStatus: string;
  locationId: string;
  locationTitle: string | null;
  regionId: string | null;
  countryCode: string | null;
  locality: string | null;
  locationType: string | null;
  locationAuthority: "server-published-nearby";
  challengeStartDistanceMeters: number;
  evidenceId: string | null;
  reviewStatus: Beta1MissionReviewStatus | null;
  serverValidationStatus: string | null;
  canRequestCompletion: boolean;
};

export type Beta1ChallengeProgress = {
  catalogId: typeof CHALLENGE_CATALOG_ID;
  catalogVersion: typeof CHALLENGE_CATALOG_VERSION;
  completionPolicy: typeof CHALLENGE_COMPLETION_POLICY;
  locationPolicy: typeof CHALLENGE_LOCATION_POLICY;
  startRadiusMeters: typeof CHALLENGE_START_RADIUS_METERS;
  startedMissionIds: string[];
  completedMissionIds: string[];
  activeAttempts: Beta1ChallengeActiveAttempt[];
  walletBalance: number;
  xp: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  walletAvailable: boolean;
  progressAuthority: "server-read";
  locationAuthority: "server-published-nearby";
  noMonetaryValue: true;
};

export type Beta1ChallengeActionResult = {
  kind: "submitted" | "resubmitted" | "pending" | "completed";
  message: string;
  rewardXp: number;
  reviewStatus: Beta1MissionReviewStatus | null;
  locationId: string | null;
  locationTitle: string | null;
};

type AuthorityEnvelope = {
  accepted?: boolean;
  noMonetaryValue?: boolean;
  tokenAuthorized?: boolean;
  cashoutAllowed?: boolean;
};

type RawProgressResponse = Partial<Beta1ChallengeProgress> & AuthorityEnvelope;

type SubmitChallengeResponse = AuthorityEnvelope & {
  attemptId?: string;
  evidenceId?: string;
  attemptStatus?: string;
  reviewStatus?: unknown;
  locationId?: string;
  locationTitle?: string | null;
  regionId?: string | null;
  locationAuthority?: unknown;
  challengeStartDistanceMeters?: unknown;
  userLocationStored?: unknown;
  missionCompletionAuthorized?: boolean;
  xpAuthorized?: boolean;
  idempotent?: boolean;
};

type CompleteChallengeResponse = AuthorityEnvelope & {
  completionId?: string;
  xpLedgerEventId?: string;
  rewardXp?: number;
  evidenceId?: string;
  locationId?: string;
  locationTitle?: string | null;
  xpAuthorized?: boolean;
  missionCompletionAuthorized?: boolean;
  idempotent?: boolean;
};

function requireSignedInUser() {
  if (!auth.currentUser) throw new Error("Bitte melde dich an, um Challenges sicher zu verwenden.");
}

function isReviewStatus(value: unknown): value is Beta1MissionReviewStatus {
  return value === "pending-server-review"
    || value === "approved"
    || value === "rejected"
    || value === "needs-more-evidence";
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

function asNonNegativeInteger(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.floor(number)) : fallback;
}

function validateAuthority(data: AuthorityEnvelope) {
  return data.accepted === true
    && data.noMonetaryValue === true
    && data.tokenAuthorized !== true
    && data.cashoutAllowed !== true;
}

function callableErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const details = typeof error === "object" && error && "details" in error
    ? String((error as { details?: unknown }).details ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${details} ${message}`.toLowerCase();

  if (diagnostic.includes("unauthenticated")) return "Bitte melde dich erneut an, um Challenges zu verwenden.";
  if (diagnostic.includes("standortfreigabe") || diagnostic.includes("standortdienste")) return message;
  if (diagnostic.includes("maximal 500 meter") || diagnostic.includes("naehe des veroeffentlichten orts")) return "Du musst dich höchstens 500 Meter vom veröffentlichten Challenge-Ort entfernt befinden.";
  if (diagnostic.includes("ort ist fuer diese mission nicht sicher")) return "Der ausgewählte Ort ist für diese Challenge nicht mehr sicher veröffentlicht.";
  if (diagnostic.includes("anderen ort gebunden")) return "Diese Challenge ist bereits an einen anderen veröffentlichten Ort gebunden.";
  if (diagnostic.includes("bereits abgeschlossen") || diagnostic.includes("bereits belohnt")) return "Diese Challenge wurde bereits serverseitig abgeschlossen.";
  if (diagnostic.includes("ortsgebundene challenge-evidence")) return "Die Challenge wartet noch auf eine serverseitige Freigabe ihrer ortsgebundenen Evidence.";
  if (diagnostic.includes("permission-denied")) return "Dieser Challenge-Vorgang gehört nicht zu deinem Konto.";
  if (diagnostic.includes("not-found")) return "Der Challenge-Vorgang oder Challenge-Ort wurde nicht gefunden.";
  if (diagnostic.includes("nicht sicher veroeffentlicht")) return "Der Challenge-Katalog ist serverseitig noch nicht veröffentlicht.";
  if (diagnostic.includes("invalid challenge projection")) return "Die Challenge-Projektion war unvollständig und wurde verworfen.";
  if (diagnostic.includes("failed-precondition")) return "Die Challenge kann in ihrem aktuellen Orts- oder Prüfstatus nicht fortgesetzt werden.";
  if (diagnostic.includes("network") || diagnostic.includes("unavailable")) return "Der sichere Challenge-Dienst ist gerade nicht erreichbar.";
  return message || "Die Challenge konnte nicht sicher verarbeitet werden.";
}

function parseActiveAttempts(value: unknown): Beta1ChallengeActiveAttempt[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    if (
      typeof item.missionId !== "string"
      || typeof item.attemptId !== "string"
      || typeof item.locationId !== "string"
      || item.locationAuthority !== "server-published-nearby"
    ) {
      return [];
    }
    return [{
      missionId: item.missionId,
      attemptId: item.attemptId,
      attemptStatus: typeof item.attemptStatus === "string" ? item.attemptStatus : "started",
      locationId: item.locationId,
      locationTitle: asNullableString(item.locationTitle),
      regionId: asNullableString(item.regionId),
      countryCode: asNullableString(item.countryCode),
      locality: asNullableString(item.locality),
      locationType: asNullableString(item.locationType),
      locationAuthority: "server-published-nearby",
      challengeStartDistanceMeters: asNonNegativeInteger(item.challengeStartDistanceMeters),
      evidenceId: asNullableString(item.evidenceId),
      reviewStatus: isReviewStatus(item.reviewStatus) ? item.reviewStatus : null,
      serverValidationStatus: asNullableString(item.serverValidationStatus),
      canRequestCompletion: item.canRequestCompletion === true,
    }];
  });
}

function parseProgress(data: RawProgressResponse): Beta1ChallengeProgress {
  if (
    !validateAuthority(data)
    || data.catalogId !== CHALLENGE_CATALOG_ID
    || data.catalogVersion !== CHALLENGE_CATALOG_VERSION
    || data.completionPolicy !== CHALLENGE_COMPLETION_POLICY
    || data.locationPolicy !== CHALLENGE_LOCATION_POLICY
    || Number(data.startRadiusMeters) !== CHALLENGE_START_RADIUS_METERS
    || data.progressAuthority !== "server-read"
    || data.locationAuthority !== "server-published-nearby"
  ) {
    throw new Error("invalid challenge projection");
  }

  return {
    catalogId: CHALLENGE_CATALOG_ID,
    catalogVersion: CHALLENGE_CATALOG_VERSION,
    completionPolicy: CHALLENGE_COMPLETION_POLICY,
    locationPolicy: CHALLENGE_LOCATION_POLICY,
    startRadiusMeters: CHALLENGE_START_RADIUS_METERS,
    startedMissionIds: asStringArray(data.startedMissionIds),
    completedMissionIds: asStringArray(data.completedMissionIds),
    activeAttempts: parseActiveAttempts(data.activeAttempts),
    walletBalance: asNonNegativeInteger(data.walletBalance),
    xp: asNonNegativeInteger(data.xp),
    level: Math.max(1, asNonNegativeInteger(data.level, 1)),
    xpForCurrentLevel: asNonNegativeInteger(data.xpForCurrentLevel),
    xpForNextLevel: Math.max(1, asNonNegativeInteger(data.xpForNextLevel, 100)),
    walletAvailable: data.walletAvailable === true,
    progressAuthority: "server-read",
    locationAuthority: "server-published-nearby",
    noMonetaryValue: true,
  };
}

export async function fetchChallengeProgress(): Promise<Beta1ChallengeProgress> {
  requireSignedInUser();
  try {
    const callable = httpsCallable<Record<string, never>, RawProgressResponse>(getFunctions(), "getChallengeProgress");
    const result = await callable({});
    return parseProgress(result.data);
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

export async function submitChallengeForReview(
  challenge: Challenge,
  location: Pick<Beta1NearbyMissionLocation, "locationId" | "title">,
): Promise<Beta1ChallengeActionResult> {
  requireSignedInUser();
  try {
    const coordinates = await requestCurrentCoordinates({ enableHighAccuracy: true, maximumAge: 15000 });
    const callable = httpsCallable<
      {
        missionId: string;
        locationId: string;
        latitude: number;
        longitude: number;
        clientVersion: string;
        appSessionId: string;
      },
      SubmitChallengeResponse
    >(getFunctions(), "submitChallengeForReview");
    const appSessionId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `challenge-${Date.now()}`;
    const result = await callable({
      missionId: challenge.missionId,
      locationId: location.locationId,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      clientVersion: "challenge-beta1-runtime-v2",
      appSessionId,
    });
    const data = result.data;
    if (
      !validateAuthority(data)
      || typeof data.attemptId !== "string"
      || typeof data.evidenceId !== "string"
      || !isReviewStatus(data.reviewStatus)
      || typeof data.locationId !== "string"
      || data.locationAuthority !== "server-published-nearby"
      || data.userLocationStored !== false
      || data.missionCompletionAuthorized === true
      || data.xpAuthorized === true
    ) {
      throw new Error("failed-precondition: invalid challenge submission");
    }
    const locationTitle = asNullableString(data.locationTitle) ?? location.title;
    return {
      kind: data.reviewStatus === "pending-server-review" ? "submitted" : "pending",
      message: data.reviewStatus === "approved"
        ? `Die vorhandene Challenge-Evidence bei „${locationTitle}“ ist bereits freigegeben. Bitte den Abschluss erneut prüfen.`
        : `Challenge bei „${locationTitle}“ wurde ortsgebunden eingereicht. Die Evidence wartet auf Admin-Prüfung; es wurden noch keine WFXP gutgeschrieben.`,
      rewardXp: 0,
      reviewStatus: data.reviewStatus,
      locationId: data.locationId,
      locationTitle,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

async function completeChallenge(attemptId: string): Promise<{
  rewardXp: number;
  locationId: string;
  locationTitle: string | null;
  idempotent: boolean;
}> {
  const callable = httpsCallable<{ attemptId: string }, CompleteChallengeResponse>(
    getFunctions(),
    "completeChallengeAttempt",
  );
  const result = await callable({ attemptId });
  const data = result.data;
  if (
    !validateAuthority(data)
    || data.xpAuthorized !== true
    || data.missionCompletionAuthorized !== true
    || typeof data.completionId !== "string"
    || typeof data.xpLedgerEventId !== "string"
    || typeof data.evidenceId !== "string"
    || typeof data.locationId !== "string"
  ) {
    throw new Error("failed-precondition: challenge completion was not authorized");
  }
  return {
    rewardXp: asNonNegativeInteger(data.rewardXp),
    locationId: data.locationId,
    locationTitle: asNullableString(data.locationTitle),
    idempotent: data.idempotent === true,
  };
}

export async function reconcileChallengeAttempt(
  challenge: Challenge,
  activeAttempt: Beta1ChallengeActiveAttempt,
  location: Pick<Beta1NearbyMissionLocation, "locationId" | "title"> | null,
): Promise<Beta1ChallengeActionResult> {
  requireSignedInUser();
  try {
    if (
      !activeAttempt.evidenceId
      || activeAttempt.reviewStatus === "rejected"
      || activeAttempt.reviewStatus === "needs-more-evidence"
    ) {
      if (!location || location.locationId !== activeAttempt.locationId) {
        throw new Error("failed-precondition: challenge is bound to another location");
      }
      const result = await submitChallengeForReview(challenge, location);
      return {
        ...result,
        kind: "resubmitted",
        message: `Eine neue ortsgebundene Challenge-Bestätigung bei „${result.locationTitle ?? location.title}“ wurde eingereicht. Der Vorgang wartet wieder auf Admin-Prüfung.`,
      };
    }

    const status = await getDashboardMissionAttemptStatus({
      attemptId: activeAttempt.attemptId,
      evidenceId: activeAttempt.evidenceId,
    });
    if (status.completionStatus === "completed") {
      return {
        kind: "completed",
        message: `Challenge ist abgeschlossen. +${status.rewardXp} WFXP wurden serverseitig verbucht.`,
        rewardXp: status.rewardXp,
        reviewStatus: status.reviewStatus,
        locationId: activeAttempt.locationId,
        locationTitle: activeAttempt.locationTitle,
      };
    }
    if (status.reviewStatus === "rejected" || status.reviewStatus === "needs-more-evidence") {
      if (!location || location.locationId !== activeAttempt.locationId) {
        throw new Error("failed-precondition: challenge is bound to another location");
      }
      const result = await submitChallengeForReview(challenge, location);
      return {
        ...result,
        kind: "resubmitted",
        message: `Eine neue ortsgebundene Challenge-Bestätigung bei „${result.locationTitle ?? location.title}“ wurde eingereicht. Der Vorgang wartet wieder auf Admin-Prüfung.`,
      };
    }
    if (status.canRequestCompletion) {
      const completion = await completeChallenge(activeAttempt.attemptId);
      return {
        kind: "completed",
        message: `Challenge abgeschlossen: +${completion.rewardXp} WFXP wurden im serverseitigen Ledger verbucht${completion.idempotent ? " (bereits vorhanden)" : ""}.`,
        rewardXp: completion.rewardXp,
        reviewStatus: status.reviewStatus,
        locationId: completion.locationId,
        locationTitle: completion.locationTitle ?? activeAttempt.locationTitle,
      };
    }
    return {
      kind: "pending",
      message: "Die ortsgebundene Challenge wartet weiterhin auf Admin-Prüfung. Es wurden noch keine WFXP gutgeschrieben.",
      rewardXp: 0,
      reviewStatus: status.reviewStatus,
      locationId: activeAttempt.locationId,
      locationTitle: activeAttempt.locationTitle,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}
