import { createHash, randomBytes } from "node:crypto";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/server/firebaseAdmin";

export const WEB_SESSION_COOKIE = "wellfit_session";
export const WEB_SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;
export const WEB_SESSION_MAX_ACTIVE_PER_USER = 10;

const collection = () => adminDb.collection("webSessions");
const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

function deviceLabel(userAgent?: string | null) {
  const value = userAgent || "";
  const platform = /Android/i.test(value) ? "Android" : /iPhone|iPad/i.test(value) ? "iPhone/iPad" : /Windows/i.test(value) ? "Windows" : /Macintosh/i.test(value) ? "Mac" : /Linux/i.test(value) ? "Linux" : "Unbekanntes Gerät";
  const browser = /Edg\//i.test(value) ? "Edge" : /Chrome\//i.test(value) ? "Chrome" : /Firefox\//i.test(value) ? "Firefox" : /Safari\//i.test(value) ? "Safari" : "Browser";
  return `${platform} · ${browser}`;
}

export async function createWebSession(input: { userId: string; admin: boolean; userAgent?: string | null }) {
  const existing = await collection().where("userId", "==", input.userId).limit(50).get();
  const active = existing.docs
    .filter((doc) => {
      const data = doc.data() || {};
      const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toMillis() : 0;
      return data.status === "active" && expiresAt > Date.now();
    })
    .sort((left, right) => {
      const leftCreated = left.data().createdAt instanceof Timestamp ? left.data().createdAt.toMillis() : 0;
      const rightCreated = right.data().createdAt instanceof Timestamp ? right.data().createdAt.toMillis() : 0;
      return leftCreated - rightCreated;
    });
  const stale = existing.docs.filter((doc) => {
    const data = doc.data() || {};
    const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toMillis() : 0;
    return data.status === "active" && expiresAt <= Date.now();
  });
  const overLimit = active.slice(0, Math.max(0, active.length - WEB_SESSION_MAX_ACTIVE_PER_USER + 1));
  const toRevoke = [...new Map([...stale, ...overLimit].map((doc) => [doc.id, doc])).values()];
  if (toRevoke.length > 0) {
    const batch = adminDb.batch();
    toRevoke.forEach((doc) => batch.update(doc.ref, { status: "revoked", revokedAt: FieldValue.serverTimestamp() }));
    await batch.commit();
  }
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Timestamp.fromMillis(Date.now() + WEB_SESSION_MAX_AGE_SECONDS * 1000);
  await collection().doc(hashToken(token)).set({
    userId: input.userId,
    admin: input.admin,
    status: "active",
    userAgentHash: input.userAgent ? hashToken(input.userAgent).slice(0, 24) : null,
    deviceLabel: deviceLabel(input.userAgent),
    createdAt: FieldValue.serverTimestamp(),
    expiresAt,
    revokedAt: null,
  });
  return { token, expiresAt: expiresAt.toDate() };
}

export async function readWebSession(token: string | undefined) {
  if (!token || token.length < 32 || token.length > 256) return null;
  const snapshot = await collection().doc(hashToken(token)).get();
  if (!snapshot.exists) return null;
  const data = snapshot.data() || {};
  const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toMillis() : 0;
  if (data.status !== "active" || !data.userId || expiresAt <= Date.now()) return null;
  const userId = String(data.userId);
  const lifecycleSnapshot = await adminDb.collection("accountLifecycleRecords").doc(userId).get();
  const lifecycle = lifecycleSnapshot.data() || {};
  const blocked = new Set(["suspended", "disabled", "deletion-pending", "deletion-processing", "deleted"]);
  if (lifecycle.freezeMutations === true || blocked.has(String(lifecycle.status || "active"))) return null;
  return { userId, admin: data.admin === true, expiresAt };
}

export async function revokeWebSession(token: string | undefined) {
  if (!token || token.length < 32 || token.length > 256) return;
  const ref = collection().doc(hashToken(token));
  const snapshot = await ref.get();
  if (!snapshot.exists) return;
  await ref.update({ status: "revoked", revokedAt: FieldValue.serverTimestamp() });
}

export async function revokeAllWebSessions(userId: string) {
  const snapshot = await collection().where("userId", "==", userId).get();
  const batches = [];
  let batch = adminDb.batch();
  let count = 0;
  for (const doc of snapshot.docs) {
    if ((doc.data() || {}).status !== "active") continue;
    batch.update(doc.ref, { status: "revoked", revokedAt: FieldValue.serverTimestamp() });
    count += 1;
    if (count % 400 === 0) {
      batches.push(batch.commit());
      batch = adminDb.batch();
    }
  }
  if (count % 400 !== 0) batches.push(batch.commit());
  await Promise.all(batches);
  return count;
}

export async function requireRequestWebSession(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${WEB_SESSION_COOKIE}=`))?.slice(WEB_SESSION_COOKIE.length + 1);
  return readWebSession(token ? decodeURIComponent(token) : undefined);
}

export async function listWebSessionsForRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const token = cookieHeader.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${WEB_SESSION_COOKIE}=`))?.slice(WEB_SESSION_COOKIE.length + 1);
  const decodedToken = token ? decodeURIComponent(token) : undefined;
  const session = await readWebSession(decodedToken);
  if (!session || !decodedToken) return null;
  const currentId = hashToken(decodedToken);
  const snapshot = await collection().where("userId", "==", session.userId).limit(50).get();
  const sessions = snapshot.docs.map((doc) => {
    const data = doc.data() || {};
    const expiresAt = data.expiresAt instanceof Timestamp ? data.expiresAt.toDate().toISOString() : null;
    const createdAt = data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : null;
    return { id: doc.id, deviceLabel: String(data.deviceLabel || "Unbekanntes Gerät"), status: String(data.status || "unknown"), createdAt, expiresAt, current: doc.id === currentId };
  }).filter((entry) => entry.status === "active" && entry.expiresAt && Date.parse(entry.expiresAt) > Date.now())
    .sort((left, right) => Date.parse(right.createdAt || "1970-01-01") - Date.parse(left.createdAt || "1970-01-01"));
  return { userId: session.userId, currentId, sessions };
}

export async function revokeOwnedWebSession(userId: string, sessionId: string) {
  if (!/^[a-f0-9]{64}$/.test(sessionId)) return false;
  const ref = collection().doc(sessionId);
  const snapshot = await ref.get();
  const data = snapshot.data() || {};
  if (!snapshot.exists || data.userId !== userId || data.status !== "active") return false;
  await ref.update({ status: "revoked", revokedAt: FieldValue.serverTimestamp() });
  return true;
}
