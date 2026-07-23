import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";
import type {
  BuddyActionType,
  BuddyDailyMode,
  BuddyState,
  BuddyStatus,
} from "@/app/buddy/types";

export type Beta1ServerBuddyActionType = Exclude<BuddyActionType, "feed">;

export type Beta1BuddyActionPolicy = {
  actionType: Beta1ServerBuddyActionType;
  costWfxp: number;
  cooldownSeconds: number;
};

export type Beta1BuddyStateSnapshot = {
  buddy: BuddyState;
  actionPolicies: Partial<Record<Beta1ServerBuddyActionType, Beta1BuddyActionPolicy>>;
};

export type Beta1BuddyActionResult = {
  actionId: string;
  actionType: Beta1ServerBuddyActionType;
  costWfxp: number;
  remainingWfxp: number;
  idempotent: boolean;
  buddy: BuddyState;
};

type AuthorityEnvelope = {
  accepted?: boolean;
  message?: string;
  finalAuthority?: boolean;
  noMonetaryValue?: boolean;
  blockchainBacked?: boolean;
  tokenAuthorized?: boolean;
  cashoutAllowed?: boolean;
};

type CallableResult<T> = T & AuthorityEnvelope;

type BuddyProjectionResponse = CallableResult<{
  buddy?: unknown;
  actionPolicies?: unknown;
}>;

type BuddyActionResponse = CallableResult<{
  actionId?: string;
  actionType?: string;
  costWfxp?: number;
  remainingWfxp?: number;
  idempotent?: boolean;
  rejectionReason?: string;
  buddy?: unknown;
}>;

const BUDDY_STATUSES: BuddyStatus[] = [
  "active",
  "tired",
  "needsCare",
  "messy",
  "ranAway",
  "foundByOther",
  "recovered",
];

const BUDDY_DAILY_MODES: BuddyDailyMode[] = [
  "abenteuerlustig",
  "neugierig",
  "verspielt",
  "muede",
  "hungrig",
  "stolz",
  "chaotisch",
];

const SERVER_ACTION_TYPES: Beta1ServerBuddyActionType[] = ["care", "play", "clean", "call", "search"];

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function asNumber(value: unknown, fallback = 0): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function boundedInteger(value: unknown, min: number, max: number, fallback: number): number {
  return Math.floor(Math.min(max, Math.max(min, asNumber(value, fallback))));
}

function isStatus(value: string): value is BuddyStatus {
  return BUDDY_STATUSES.includes(value as BuddyStatus);
}

function isDailyMode(value: string): value is BuddyDailyMode {
  return BUDDY_DAILY_MODES.includes(value as BuddyDailyMode);
}

function isServerActionType(value: string): value is Beta1ServerBuddyActionType {
  return SERVER_ACTION_TYPES.includes(value as Beta1ServerBuddyActionType);
}

function mapBuddy(value: unknown): BuddyState | null {
  const data = asRecord(value);
  const serverValidationStatus = asString(data.serverValidationStatus);
  if (
    serverValidationStatus !== "server-projected"
    || data.finalAuthority !== true
    || data.noMonetaryValue !== true
    || data.blockchainBacked === true
    || data.tokenAuthorized === true
    || data.cashoutAllowed === true
  ) {
    return null;
  }

  const statusValue = asString(data.status, "active");
  const dailyModeValue = asString(data.dailyMode, "neugierig");
  const level = boundedInteger(data.level, 1, 1000, 1);

  return {
    name: asString(data.name, "Flammi"),
    title: asString(data.title, "Junger Feuerdrache"),
    level,
    xp: boundedInteger(data.xp, 0, Number.MAX_SAFE_INTEGER, 0),
    nextLevelXp: boundedInteger(data.nextLevelXp, 1, Number.MAX_SAFE_INTEGER, Math.max(100, level * 150)),
    points: boundedInteger(data.points, 0, Number.MAX_SAFE_INTEGER, 0),
    energy: boundedInteger(data.energy, 0, 100, 78),
    hunger: boundedInteger(data.hunger, 0, 100, 70),
    mood: boundedInteger(data.mood, 0, 100, 68),
    cleanliness: boundedInteger(data.cleanliness, 0, 100, 76),
    bond: boundedInteger(data.bond, 0, 100, 68),
    loyalty: boundedInteger(data.loyalty, 0, 100, 75),
    curiosity: boundedInteger(data.curiosity, 0, 100, 64),
    status: isStatus(statusValue) ? statusValue : "active",
    dailyMode: isDailyMode(dailyModeValue) ? dailyModeValue : "neugierig",
  };
}

function mapActionPolicies(value: unknown): Partial<Record<Beta1ServerBuddyActionType, Beta1BuddyActionPolicy>> {
  const source = asRecord(value);
  const result: Partial<Record<Beta1ServerBuddyActionType, Beta1BuddyActionPolicy>> = {};
  for (const [key, rawPolicy] of Object.entries(source)) {
    if (!isServerActionType(key)) continue;
    const policy = asRecord(rawPolicy);
    const actionType = asString(policy.actionType, key);
    if (!isServerActionType(actionType)) continue;
    result[actionType] = {
      actionType,
      costWfxp: boundedInteger(policy.costWfxp, 0, 100000, 0),
      cooldownSeconds: boundedInteger(policy.cooldownSeconds, 0, 86400, 0),
    };
  }
  return result;
}

function requireSignedInUser() {
  if (!auth.currentUser) throw new Error("Bitte melde dich erneut an, um Flammi sicher zu verwalten.");
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

  if (diagnostic.includes("unauthenticated")) return "Bitte melde dich erneut an, um Flammi sicher zu verwalten.";
  if (diagnostic.includes("permission-denied")) return "Dieses Buddy-Profil gehört nicht zu deinem Konto oder die Familienfreigabe fehlt.";
  if (diagnostic.includes("resource-exhausted")) {
    const cooldownMessage = details || message;
    return cooldownMessage.toLowerCase().includes("cooldown") ? cooldownMessage : "Diese Buddy-Aktion hat noch eine kurze Abklingzeit.";
  }
  if (diagnostic.includes("flammi muss zuerst")) return "Flammi ist auf Abenteuer. Starte zuerst die sichere Rückholsuche.";
  if (diagnostic.includes("nicht verschwunden")) return "Flammi ist bereits bei dir; eine Rückholsuche ist nicht nötig.";
  if (diagnostic.includes("aufraeumen")) return "Aufräumen wird erst aktiv, wenn Flammis Zuhause wirklich chaotisch ist.";
  if (diagnostic.includes("futter oder ruhe")) return "Flammi braucht zuerst Futter oder Ruhe, bevor ihr spielen könnt.";
  if (diagnostic.includes("invalid buddy projection authority")) return "Die Buddy-Serverprojektion war unvollständig und wurde aus Sicherheitsgründen verworfen.";
  if (diagnostic.includes("invalid buddy action authority")) return "Die Buddy-Serverbuchung war unvollständig und wurde aus Sicherheitsgründen verworfen.";
  if (diagnostic.includes("failed-precondition")) return "Diese Buddy-Aktion ist im aktuellen Zustand nicht zulässig.";
  if (diagnostic.includes("invalid-argument")) return "Die Buddy-Aktion konnte nicht eindeutig verarbeitet werden.";
  if (diagnostic.includes("network") || diagnostic.includes("unavailable")) return "Der sichere Buddy-Server ist gerade nicht erreichbar.";
  return "Die Buddy-Aktion konnte nicht sicher serverseitig ausgeführt werden.";
}

function validateAuthority(data: AuthorityEnvelope) {
  return data.accepted === true
    && data.finalAuthority === true
    && data.noMonetaryValue === true
    && data.blockchainBacked !== true
    && data.tokenAuthorized !== true
    && data.cashoutAllowed !== true;
}

export function createBuddyActionRequestId(actionType: Beta1ServerBuddyActionType): string {
  const randomId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  return `${actionType}_${randomId}`;
}

export async function getServerBuddyState(childProfileId?: string): Promise<Beta1BuddyStateSnapshot> {
  requireSignedInUser();
  try {
    const callable = httpsCallable<
      { childProfileId?: string },
      BuddyProjectionResponse
    >(getFunctions(), "getBuddyStateProjection");
    const result = await callable(childProfileId ? { childProfileId } : {});
    const buddy = mapBuddy(result.data.buddy);
    if (!validateAuthority(result.data) || !buddy) {
      throw new Error("failed-precondition: invalid Buddy projection authority");
    }
    return {
      buddy,
      actionPolicies: mapActionPolicies(result.data.actionPolicies),
    };
  } catch (error) {
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}

export async function performServerBuddyAction(input: {
  actionType: Beta1ServerBuddyActionType;
  requestId: string;
  childProfileId?: string;
}): Promise<Beta1BuddyActionResult> {
  requireSignedInUser();
  const requestId = input.requestId.trim();
  if (!requestId || !isServerActionType(input.actionType)) {
    throw new Error("Die Buddy-Aktion konnte nicht eindeutig vorbereitet werden.");
  }

  try {
    const callable = httpsCallable<
      { actionType: Beta1ServerBuddyActionType; requestId: string; childProfileId?: string },
      BuddyActionResponse
    >(getFunctions(), "performBuddyCareAction");
    const result = await callable({
      actionType: input.actionType,
      requestId,
      ...(input.childProfileId ? { childProfileId: input.childProfileId } : {}),
    });

    if (result.data.accepted !== true) {
      if (result.data.rejectionReason === "insufficient-wfxp-balance") {
        throw new Error("Dein WFXP-Guthaben reicht für diese Buddy-Aktion nicht aus.");
      }
      if (result.data.rejectionReason === "buddy-action-no-effect") {
        throw new Error("Diese Aktion würde Flammis Zustand derzeit nicht verändern. Es wurden keine WFXP abgezogen.");
      }
      throw new Error("Die Buddy-Aktion wurde vom Server nicht freigegeben.");
    }

    const buddy = mapBuddy(result.data.buddy);
    const actionType = asString(result.data.actionType);
    const actionId = asString(result.data.actionId);
    if (
      !validateAuthority(result.data)
      || !buddy
      || !actionId
      || !isServerActionType(actionType)
    ) {
      throw new Error("failed-precondition: invalid Buddy action authority");
    }

    return {
      actionId,
      actionType,
      costWfxp: boundedInteger(result.data.costWfxp, 0, 100000, 0),
      remainingWfxp: boundedInteger(result.data.remainingWfxp, 0, Number.MAX_SAFE_INTEGER, buddy.points),
      idempotent: result.data.idempotent === true,
      buddy,
    };
  } catch (error) {
    if (error instanceof Error && (
      error.message.includes("WFXP-Guthaben")
      || error.message.includes("Zustand derzeit nicht verändern")
      || error.message.includes("nicht freigegeben")
      || error.message.includes("eindeutig vorbereitet")
    )) {
      throw error;
    }
    throw new Error(callableErrorMessage(error), { cause: error });
  }
}
