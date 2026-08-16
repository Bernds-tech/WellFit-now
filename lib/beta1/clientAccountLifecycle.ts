import { auth } from "@/lib/firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut,
} from "firebase/auth";
import { getFunctions, httpsCallable } from "firebase/functions";

export type AccountLifecycleStatus = {
  status: "active" | "deletion-pending" | "deletion-processing" | "deleted" | string;
  freezeMutations: boolean;
  deletionRequestedAt: string | null;
  deletionScheduledFor: string | null;
  deletionCancelledAt: string | null;
  deletionCompletedAt: string | null;
  lifecycleVersion: string;
  deletionCanBeRequested: boolean;
  gracePeriodDays?: number;
  dependencies?: {
    activeChildProfiles: number;
    soleGuardianChildProfiles: number;
    familyAccounts: number;
    guardianLinks: number;
  } | null;
  tokenAuthorized: false;
  cashoutAllowed: false;
  realMoney: false;
};

export type UserDataExportStatus = {
  jobId?: string | null;
  status: "not-requested" | "generating" | "ready" | "expired" | "failed" | string;
  ready: boolean;
  generatedAt?: string | null;
  expiresAt?: string | null;
  totalChunks: number;
  totalDocuments: number;
  sectionCounts?: Record<string, number>;
  truncatedSections?: string[];
  fileName?: string | null;
  exportVersion?: string;
  tokenAuthorized: false;
  cashoutAllowed: false;
  realMoney: false;
};

type RawCallableResult = Record<string, unknown> & { accepted?: unknown };

type ExportChunkPayload = {
  section: string;
  collection: string | null;
  partIndex: number;
  partCount: number;
  truncated: boolean;
  items: Array<{ documentId: string; data: unknown }>;
};

function requireCurrentUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("Für diese Account-Aktion ist eine aktive Anmeldung erforderlich.");
  return user;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function asNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function parseLifecycle(value: RawCallableResult): AccountLifecycleStatus {
  if (value.accepted !== true || typeof value.status !== "string") {
    throw new Error("Der Server hat keinen gültigen Accountstatus geliefert.");
  }
  const dependencies = value.dependencies && typeof value.dependencies === "object" && !Array.isArray(value.dependencies)
    ? value.dependencies as Record<string, unknown>
    : null;
  return {
    status: value.status,
    freezeMutations: value.freezeMutations === true,
    deletionRequestedAt: asString(value.deletionRequestedAt),
    deletionScheduledFor: asString(value.deletionScheduledFor),
    deletionCancelledAt: asString(value.deletionCancelledAt),
    deletionCompletedAt: asString(value.deletionCompletedAt),
    lifecycleVersion: asString(value.lifecycleVersion) || "unknown",
    deletionCanBeRequested: value.deletionCanBeRequested !== false,
    gracePeriodDays: asNumber(value.gracePeriodDays) || undefined,
    dependencies: dependencies ? {
      activeChildProfiles: asNumber(dependencies.activeChildProfiles),
      soleGuardianChildProfiles: asNumber(dependencies.soleGuardianChildProfiles),
      familyAccounts: asNumber(dependencies.familyAccounts),
      guardianLinks: asNumber(dependencies.guardianLinks),
    } : null,
    tokenAuthorized: false,
    cashoutAllowed: false,
    realMoney: false,
  };
}

function parseExportStatus(value: RawCallableResult): UserDataExportStatus {
  if (value.accepted !== true || typeof value.status !== "string") {
    throw new Error("Der Server hat keinen gültigen Exportstatus geliefert.");
  }
  const sectionCounts = value.sectionCounts && typeof value.sectionCounts === "object" && !Array.isArray(value.sectionCounts)
    ? Object.fromEntries(Object.entries(value.sectionCounts as Record<string, unknown>).map(([key, count]) => [key, asNumber(count)]))
    : {};
  return {
    jobId: asString(value.jobId),
    status: value.status,
    ready: value.ready === true,
    generatedAt: asString(value.generatedAt),
    expiresAt: asString(value.expiresAt),
    totalChunks: asNumber(value.totalChunks),
    totalDocuments: asNumber(value.totalDocuments),
    sectionCounts,
    truncatedSections: Array.isArray(value.truncatedSections)
      ? value.truncatedSections.filter((item): item is string => typeof item === "string").slice(0, 100)
      : [],
    fileName: asString(value.fileName),
    exportVersion: asString(value.exportVersion) || undefined,
    tokenAuthorized: false,
    cashoutAllowed: false,
    realMoney: false,
  };
}

async function callAccountFunction<TInput extends Record<string, unknown>>(
  functionName: string,
  input: TInput,
): Promise<RawCallableResult> {
  const user = requireCurrentUser();
  await user.getIdToken(true);
  const callable = httpsCallable<TInput, RawCallableResult>(getFunctions(), functionName);
  const response = await callable(input);
  if (!response.data || response.data.accepted !== true) {
    throw new Error("Die Account-Aktion wurde vom Server nicht bestätigt.");
  }
  return response.data;
}

export async function reauthenticateAccount(password: string): Promise<void> {
  const user = requireCurrentUser();
  const email = user.email;
  if (!email) throw new Error("Für dieses Konto ist keine E-Mail-Adresse hinterlegt.");
  const hasPasswordProvider = user.providerData.some((provider) => provider.providerId === "password");
  if (!hasPasswordProvider) {
    throw new Error("Diese Sicherheitsaktion benötigt künftig die erneute Anmeldung über den verwendeten Login-Anbieter.");
  }
  if (!password) throw new Error("Bitte gib dein aktuelles Passwort ein.");
  await reauthenticateWithCredential(user, EmailAuthProvider.credential(email, password));
  await user.getIdToken(true);
}

export async function getAccountLifecycleStatus(): Promise<AccountLifecycleStatus> {
  return parseLifecycle(await callAccountFunction("getAccountLifecycleStatus", {}));
}

export async function requestAccountDeletion(input: {
  email: string;
  confirmation: string;
  reasonCategory?: string;
}): Promise<AccountLifecycleStatus> {
  return parseLifecycle(await callAccountFunction("requestAccountDeletion", {
    ...input,
    source: "web-settings",
  }));
}

export async function cancelAccountDeletion(reason = "user-cancelled-in-settings"): Promise<AccountLifecycleStatus> {
  return parseLifecycle(await callAccountFunction("cancelAccountDeletion", { reason }));
}

export async function revokeAllUserSessions(): Promise<void> {
  await callAccountFunction("revokeUserSessions", {});
  await fetch("/api/auth/logout?all=true", { method: "POST", credentials: "same-origin" });
  await signOut(auth);
}

export async function requestUserDataExport(): Promise<UserDataExportStatus> {
  return parseExportStatus(await callAccountFunction("requestUserDataExport", {}));
}

export async function getUserDataExportStatus(): Promise<UserDataExportStatus> {
  return parseExportStatus(await callAccountFunction("getUserDataExportStatus", {}));
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function downloadExportChunk(index: number): Promise<{
  payload: ExportChunkPayload;
  totalChunks: number;
  fileName: string;
}> {
  const result = await callAccountFunction("downloadUserDataExportChunk", { index });
  const payloadJson = asString(result.payloadJson);
  const expectedSha256 = asString(result.payloadSha256);
  if (!payloadJson || !expectedSha256) throw new Error("Ein Exportteil ist unvollständig.");
  const actualSha256 = await sha256Hex(payloadJson);
  if (actualSha256 !== expectedSha256) throw new Error("Die Integrität eines Exportteils konnte nicht bestätigt werden.");
  const payload = JSON.parse(payloadJson) as ExportChunkPayload;
  if (!payload || typeof payload.section !== "string" || !Array.isArray(payload.items)) {
    throw new Error("Ein Exportteil besitzt ein ungültiges Format.");
  }
  return {
    payload,
    totalChunks: asNumber(result.totalChunks),
    fileName: asString(result.fileName) || "wellfit-data-export.json",
  };
}

export async function buildAndDownloadUserDataExport(): Promise<UserDataExportStatus> {
  const requested = await requestUserDataExport();
  if (!requested.ready || requested.totalChunks <= 0) {
    throw new Error("Der Datenexport ist noch nicht bereit.");
  }
  const sections: Record<string, Array<{ documentId: string; data: unknown }>> = {};
  let manifest: unknown = null;
  let fileName = requested.fileName || "wellfit-data-export.json";
  for (let index = 0; index < requested.totalChunks; index += 1) {
    const chunk = await downloadExportChunk(index);
    if (chunk.totalChunks !== requested.totalChunks) {
      throw new Error("Die Exportteile gehören nicht zum selben Auftrag.");
    }
    fileName = chunk.fileName || fileName;
    if (chunk.payload.section === "manifest") {
      manifest = chunk.payload.items[0]?.data ?? null;
    } else {
      sections[chunk.payload.section] = [
        ...(sections[chunk.payload.section] || []),
        ...chunk.payload.items,
      ];
    }
  }
  const exportDocument = {
    format: "wellfit-user-data-export-json-v1",
    manifest,
    sections,
  };
  const blob = new Blob([JSON.stringify(exportDocument, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return requested;
}
