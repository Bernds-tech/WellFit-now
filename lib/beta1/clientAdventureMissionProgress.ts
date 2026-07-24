import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";
import { requestCurrentCoordinates } from "@/lib/beta1/clientUserContext";
import type { Beta1NearbyMissionLocation } from "@/lib/beta1/clientNearbyMissionLocations";
import {
  getDashboardMissionAttemptStatus,
  type Beta1MissionReviewStatus,
} from "@/lib/beta1/clientMissionCommands";
import {
  ADVENTURE_ACCESS_POLICY,
  ADVENTURE_CATALOG_ID,
  ADVENTURE_CATALOG_VERSION,
  ADVENTURE_COMPLETION_POLICY,
  ADVENTURE_LOCATION_POLICY,
  ADVENTURE_START_RADIUS_METERS,
  type Adventure,
} from "@/app/missionen/abenteuer/adventureData";

export type Beta1AdventureActiveAttempt = {
  missionId: string;
  attemptId: string;
  attemptStatus: string;
  accessAuthorized: true;
  accessCostWfxp: number;
  accessLedgerEventId: string | null;
  locationId: string;
  locationTitle: string | null;
  regionId: string | null;
  countryCode: string | null;
  locality: string | null;
  locationType: string | null;
  locationAuthority: "server-published-nearby";
  accessStartDistanceMeters: number;
  evidenceId: string | null;
  reviewStatus: Beta1MissionReviewStatus | null;
  serverValidationStatus: string | null;
  canRequestCompletion: boolean;
};

export type Beta1AdventureProgress = {
  catalogId: typeof ADVENTURE_CATALOG_ID;
  catalogVersion: typeof ADVENTURE_CATALOG_VERSION;
  completionPolicy: typeof ADVENTURE_COMPLETION_POLICY;
  accessPolicy: typeof ADVENTURE_ACCESS_POLICY;
  locationPolicy: typeof ADVENTURE_LOCATION_POLICY;
  startRadiusMeters: typeof ADVENTURE_START_RADIUS_METERS;
  startedMissionIds: string[];
  completedMissionIds: string[];
  activeAttempts: Beta1AdventureActiveAttempt[];
  walletBalance: number;
  lifetimeSpent: number;
  xp: number;
  level: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  walletAvailable: boolean;
  progressAuthority: "server-read";
  locationAuthority: "server-published-nearby";
  noMonetaryValue: true;
};

export type Beta1AdventureAccessResult = {
  kind: "accessed" | "already-accessed" | "already-completed";
  message: string;
  remainingWfxp: number;
  accessCostWfxp: number;
  locationId: string;
  locationTitle: string | null;
  regionId: string | null;
  idempotent: boolean;
};

export type Beta1AdventureActionResult = {
  kind: "submitted" | "resubmitted" | "pending" | "completed";
  message: string;
  rewardXp: number;
  remainingWfxp: number | null;
  reviewStatus: Beta1MissionReviewStatus | null;
};

type AuthorityEnvelope = {
  accepted?: boolean;
  noMonetaryValue?: boolean;
  tokenAuthorized?: boolean;
  cashoutAllowed?: boolean;
};

type RawProgressResponse = Partial<Beta1AdventureProgress> & AuthorityEnvelope;

type StartAdventureResponse = AuthorityEnvelope & {
  rejectionReason?: string;
  attemptId?: string;
  missionId?: string;
  accessLedgerEventId?: string;
  accessCostWfxp?: number;
  remainingWfxp?: number;
  accessAuthorized?: boolean;
  missionCompletionAuthorized?: boolean;
  xpAuthorized?: boolean;
  locationId?: string;
  locationTitle?: string | null;
  regionId?: string | null;
  locationAuthority?: unknown;
  accessStartDistanceMeters?: unknown;
  userLocationStored?: unknown;
  idempotent?: boolean;
};

type SubmitAdventureResponse = AuthorityEnvelope & {
  attemptId?: string;
  evidenceId?: string;
  attemptStatus?: string;
  reviewStatus?: unknown;
  accessAuthorized?: boolean;
  locationId?: string;
  regionId?: string | null;
  missionCompletionAuthorized?: boolean;
  xpAuthorized?: boolean;
  idempotent?: boolean;
};

type CompleteAdventureResponse = AuthorityEnvelope & {
  completionId?: string;
  xpLedgerEventId?: string;
  rewardXp?: number;
  evidenceId?: string;
  remainingWfxp?: number;
  locationId?: string;
  regionId?: string | null;
  xpAuthorized?: boolean;
  missionCompletionAuthorized?: boolean;
  idempotent?: boolean;
};

function requireSignedInUser() {
  if (!auth.currentUser) throw new Error("Bitte melde dich an, um Abenteuer sicher zu verwenden.");
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

  if (diagnostic.includes("unauthenticated")) return "Bitte melde dich erneut an, um Abenteuer zu verwenden.";
  if (diagnostic.includes("insufficient-wfxp-balance")) return "Dein WFXP-Guthaben reicht für diesen Abenteuerzugang nicht aus.";
  if (diagnostic.includes("standortfreigabe") || diagnostic.includes("standortdienste")) return message;
  if (diagnostic.includes("maximal 500 meter") || diagnostic.includes("naehe des veroeffentlichten orts")) return "Du musst dich höchstens 500 Meter vom veröffentlichten Startpunkt entfernt befinden.";
  if (diagnostic.includes("ort ist fuer diese mission nicht sicher")) return "Der ausgewählte Ort ist für dieses Abenteuer nicht mehr sicher veröffentlicht.";
  if (diagnostic.includes("bereits abgeschlossen") || diagnostic.includes("bereits belohnt")) return "Dieses Abenteuer wurde bereits serverseitig abgeschlossen.";
  if (diagnostic.includes("ortsgepruefter abenteuerzugang") || diagnostic.includes("bezahlter abenteuerzugang")) return "Bitte buche zuerst am veröffentlichten Startpunkt den einmaligen WFXP-Zugang.";
  if (diagnostic.includes("freigegebene abenteuer-evidence")) return "Das Abenteuer wartet noch auf eine serverseitige Evidence-Freigabe.";
  if (diagnostic.includes("permission-denied")) return "Dieser Abenteuer-Vorgang gehört nicht zu deinem Konto.";
  if (diagnostic.includes("not-found")) return "Der Abenteuer-Vorgang oder Startort wurde nicht gefunden.";
  if (diagnostic.includes("nicht sicher veroeffentlicht")) return "Der Abenteuerkatalog ist serverseitig noch nicht veröffentlicht.";
  if (diagnostic.includes("invalid adventure projection")) return "Die Abenteuer-Projektion war unvollständig und wurde verworfen.";
  if (diagnostic.includes("failed-precondition")) return "Das Abenteuer kann in seinem aktuellen Zugangs-, Orts- oder Prüfstatus nicht fortgesetzt werden.";
  if (diagnostic.includes("network") || diagnostic.includes("unavailable")) return "Der sichere Abenteuerdienst ist gerade nicht erreichbar.";
  return message || "Das Abenteuer konnte nicht sicher verarbeitet werden.";
}

function parseActiveAttempts(value: unknown): Beta1AdventureActiveAttempt[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;
    if (
      typeof item.missionId !== "string"
      || typeof item.attemptId !== "string"
      || item.accessAuthorized !== true
      || typeof item.locationId !== "string"
      || item.locationAuthority !== "server-published-nearby"
    ) {
      return [];
    }
    return [{
      missionId: item.missionId,
      attemptId: item.attemptId,
      attemptStatus: typeof item.attemptStatus === "string" ? item.attemptStatus : "started",
      accessAuthorized: true,
      accessCostWfxp: asNonNegativeInteger(item.accessCostWfxp),
      accessLedgerEventId: asNullableString(item.accessLedgerEventId),
      locationId: item.locationId,
      locationTitle: asNullableString(item.locationTitle),
      regionId: asNullableString(item.regionId),
      countryCode: asNullableString(item.countryCode),
      locality: asNullableString(item.locality),
      locationType: asNullableString(item.locationType),
      locationAuthority: "server-published-nearby",
      accessStartDistanceMeters: asNonNegativeInteger(item.accessStartDistanceMeters),
      evidenceId: asNullableString(item.evidenceId),
      reviewStatus: isReviewStatus(item.reviewStatus) ? item.reviewStatus : null,
      serverValidationStatus: asNullableString(item.serverValidationStatus),
      canRequestCompletion: item.canRequestCompletion === true,
    }];
  });
}

function parseProgress(data: RawProgressResponse): Beta1AdventureProgress {
  if (
    !validateAuthority(data)
    || data.catalogId !== ADVENTURE_CATALOG_ID
    || data.catalogVersion !== ADVENTURE_CATALOG_VERSION
    || data.completionPolicy !== ADVENTURE_COMPLETION_POLICY
    || data.accessPolicy !== ADVENTURE_ACCESS_POLICY
    || data.locationPolicy !== ADVENTURE_LOCATION_POLICY
    || Number(data.startRadiusMeters) !== ADVENTURE_START_RADIUS_METERS
    || data.progressAuthority !== "server-read"
    || data.locationAuthority !== "server-published-nearby"
  ) {
    throw new Error("invalid adventure projection");
  }

  return {
    catalogId: ADVENTURE_CATALOG_ID,
    catalogVersion: ADVENTURE_CATALOG_VERSION,
    completionPolicy: ADVENTURE_COMPLETION_POLICY,
    accessPolicy: ADVENTURE_ACCESS_POLICY,
    locationPolicy: ADVENTURE_LOCATION_POLICY,
    startRadiusMeters: ADVENTURE_START_RADIUS_METERS,
    startedMissionIds: asStringArray(data.startedMissionIds),
    completedMissionIds: asStringArray(data.completedMissionIds),
    activeAttempts: parseActiveAttempts(data.activeAttempts),
    walletBalance: asNonNegativeInteger(data.walletBalance),
    lifetimeSpent: asNonNegativeInteger(data.lifetimeSpent),
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

export async function fetchAdventureProgress(): Promise<Beta1AdventureProgress> {
  requireSignedInUser();
  try {
    const callable = httpsCallable<Record<string, never>, RawProgressResponse>(getFunctions(), "getAdventureProgress");
    const result = await callable({});
    return parseProgress(result.data);
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

export async function startAdventureAccess(
  adventure: Adventure,
  location: Pick<Beta1NearbyMissionLocation, "locationId" | "title">,
): Promise<Beta1AdventureAccessResult> {
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
      StartAdventureResponse
    >(getFunctions(), "startAdventureMission");
    const appSessionId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `adventure-access-${Date.now()}`;
    const result = await callable({
      missionId: adventure.missionId,
      locationId: location.locationId,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      clientVersion: "adventure-beta1-runtime-v2",
      appSessionId,
    });
    const data = result.data;
    if (data.accepted !== true) {
      if (data.rejectionReason === "insufficient-wfxp-balance") {
        throw new Error("insufficient-wfxp-balance");
      }
      throw new Error("failed-precondition: adventure access rejected");
    }
    if (
      !validateAuthority(data)
      || typeof data.attemptId !== "string"
      || typeof data.missionId !== "string"
      || typeof data.accessLedgerEventId !== "string"
      || data.accessAuthorized !== true
      || typeof data.locationId !== "string"
      || data.locationAuthority !== "server-published-nearby"
      || data.userLocationStored !== false
    ) {
      throw new Error("failed-precondition: invalid adventure access authority");
    }
    const completed = data.missionCompletionAuthorized === true && data.xpAuthorized === true;
    const locationTitle = asNullableString(data.locationTitle) ?? location.title;
    return {
      kind: completed ? "already-completed" : data.idempotent === true ? "already-accessed" : "accessed",
      message: completed
        ? "Dieses Abenteuer wurde bereits serverseitig abgeschlossen."
        : data.idempotent === true
          ? `Der Zugang bei „${locationTitle}“ war bereits serverseitig gebucht; es gab keinen zweiten WFXP-Abzug.`
          : `Abenteuerzugang bei „${locationTitle}“ gebucht: ${asNonNegativeInteger(data.accessCostWfxp)} WFXP wurden atomar aus Wallet und Ledger abgezogen.`,
      remainingWfxp: asNonNegativeInteger(data.remainingWfxp),
      accessCostWfxp: asNonNegativeInteger(data.accessCostWfxp),
      locationId: data.locationId,
      locationTitle,
      regionId: asNullableString(data.regionId),
      idempotent: data.idempotent === true,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

export async function submitAdventureForReview(adventure: Adventure): Promise<Beta1AdventureActionResult> {
  requireSignedInUser();
  try {
    const callable = httpsCallable<
      { missionId: string; clientVersion: string; appSessionId: string },
      SubmitAdventureResponse
    >(getFunctions(), "submitAdventureForReview");
    const appSessionId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `adventure-review-${Date.now()}`;
    const result = await callable({
      missionId: adventure.missionId,
      clientVersion: "adventure-beta1-runtime-v2",
      appSessionId,
    });
    const data = result.data;
    if (
      !validateAuthority(data)
      || typeof data.attemptId !== "string"
      || typeof data.evidenceId !== "string"
      || !isReviewStatus(data.reviewStatus)
      || data.accessAuthorized !== true
      || typeof data.locationId !== "string"
      || data.missionCompletionAuthorized === true
      || data.xpAuthorized === true
    ) {
      throw new Error("failed-precondition: invalid adventure submission");
    }
    return {
      kind: data.reviewStatus === "pending-server-review" ? "submitted" : "pending",
      message: data.reviewStatus === "approved"
        ? "Die vorhandene Abenteuer-Evidence ist bereits freigegeben. Bitte den Abschluss erneut prüfen."
        : "Abenteuerbestätigung wurde mit dem serverseitigen Startort verknüpft. Der Vorgang wartet auf Admin-Prüfung; es wurden noch keine WFXP gutgeschrieben.",
      rewardXp: 0,
      remainingWfxp: null,
      reviewStatus: data.reviewStatus,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

async function completeAdventure(attemptId: string): Promise<{
  rewardXp: number;
  remainingWfxp: number;
  idempotent: boolean;
}> {
  const callable = httpsCallable<{ attemptId: string }, CompleteAdventureResponse>(
    getFunctions(),
    "completeAdventureAttempt",
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
    throw new Error("failed-precondition: adventure completion was not authorized");
  }
  return {
    rewardXp: asNonNegativeInteger(data.rewardXp),
    remainingWfxp: asNonNegativeInteger(data.remainingWfxp),
    idempotent: data.idempotent === true,
  };
}

export async function reconcileAdventureAttempt(
  adventure: Adventure,
  activeAttempt: Beta1AdventureActiveAttempt,
): Promise<Beta1AdventureActionResult> {
  requireSignedInUser();
  try {
    if (
      !activeAttempt.evidenceId
      || activeAttempt.reviewStatus === "rejected"
      || activeAttempt.reviewStatus === "needs-more-evidence"
    ) {
      const result = await submitAdventureForReview(adventure);
      return {
        ...result,
        kind: "resubmitted",
        message: "Eine neue sichere Abenteuerbestätigung wurde eingereicht. Der Vorgang wartet wieder auf Admin-Prüfung.",
      };
    }

    const status = await getDashboardMissionAttemptStatus({
      attemptId: activeAttempt.attemptId,
      evidenceId: activeAttempt.evidenceId,
    });
    if (status.completionStatus === "completed") {
      return {
        kind: "completed",
        message: `Abenteuer ist abgeschlossen. +${status.rewardXp} WFXP wurden serverseitig verbucht.`,
        rewardXp: status.rewardXp,
        remainingWfxp: null,
        reviewStatus: status.reviewStatus,
      };
    }
    if (status.reviewStatus === "rejected" || status.reviewStatus === "needs-more-evidence") {
      const result = await submitAdventureForReview(adventure);
      return {
        ...result,
        kind: "resubmitted",
        message: "Eine neue sichere Abenteuerbestätigung wurde eingereicht. Der Vorgang wartet wieder auf Admin-Prüfung.",
      };
    }
    if (status.canRequestCompletion) {
      const completion = await completeAdventure(activeAttempt.attemptId);
      return {
        kind: "completed",
        message: `Abenteuer abgeschlossen: +${completion.rewardXp} WFXP wurden im serverseitigen Ledger verbucht${completion.idempotent ? " (bereits vorhanden)" : ""}.`,
        rewardXp: completion.rewardXp,
        remainingWfxp: completion.remainingWfxp,
        reviewStatus: status.reviewStatus,
      };
    }
    return {
      kind: "pending",
      message: "Das Abenteuer wartet weiterhin auf Admin-Prüfung. Es wurden noch keine WFXP gutgeschrieben.",
      rewardXp: 0,
      remainingWfxp: null,
      reviewStatus: status.reviewStatus,
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}