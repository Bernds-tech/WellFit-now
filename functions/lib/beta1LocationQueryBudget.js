const { FieldValue } = require("firebase-admin/firestore");

const NEARBY_QUERY_WINDOW_MS = 5 * 60 * 1000;
const MAX_NEARBY_QUERIES_PER_WINDOW = 30;
const CLOCK_SKEW_TOLERANCE_MS = 60 * 1000;

function safeDocIdPart(value) {
  return encodeURIComponent(String(value || "none")).replace(/\./g, "%2E");
}

function timestampToMillis(value) {
  if (!value) return 0;
  if (typeof value.toDate === "function") return value.toDate().getTime();
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function locationQueryBudgetId(userId) {
  return `nearby_query__${safeDocIdPart(userId)}`;
}

async function consumeNearbyLocationQueryBudget(db, userId, HttpsError, value = new Date()) {
  const now = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(now.getTime())) {
    throw new HttpsError("internal", "Umgebungssuch-Zeitfenster konnte nicht bestimmt werden.");
  }

  const ref = db.collection("locationQueryBudgets").doc(locationQueryBudgetId(userId));
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const current = snapshot.exists ? snapshot.data() || {} : {};
    const currentWindowStartedAt = timestampToMillis(current.windowStartedAt);
    const activeWindow = currentWindowStartedAt > 0
      && now.getTime() >= currentWindowStartedAt - CLOCK_SKEW_TOLERANCE_MS
      && now.getTime() < currentWindowStartedAt + NEARBY_QUERY_WINDOW_MS;
    const currentCount = activeWindow ? Math.max(0, Math.floor(Number(current.queryCount || 0))) : 0;

    if (currentCount >= MAX_NEARBY_QUERIES_PER_WINDOW) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((currentWindowStartedAt + NEARBY_QUERY_WINDOW_MS - now.getTime()) / 1000),
      );
      throw new HttpsError(
        "resource-exhausted",
        `Zu viele Umgebungssuchen. Bitte in etwa ${retryAfterSeconds} Sekunden erneut versuchen.`,
        {
          retryAfterSeconds,
          queryWindowSeconds: Math.floor(NEARBY_QUERY_WINDOW_MS / 1000),
          rawCoordinatesStored: false,
        },
      );
    }

    const windowStartedAt = activeWindow ? new Date(currentWindowStartedAt) : now;
    const nextCount = currentCount + 1;
    const windowExpiresAt = new Date(windowStartedAt.getTime() + NEARBY_QUERY_WINDOW_MS);
    transaction.set(ref, {
      budgetId: ref.id,
      ownerUserId: userId,
      userId,
      queryCount: nextCount,
      maxQueriesPerWindow: MAX_NEARBY_QUERIES_PER_WINDOW,
      windowSeconds: Math.floor(NEARBY_QUERY_WINDOW_MS / 1000),
      windowStartedAt: windowStartedAt.toISOString(),
      windowExpiresAt: windowExpiresAt.toISOString(),
      lastRequestedAt: now.toISOString(),
      rawCoordinatesStored: false,
      locationAuthority: "rate-limit-only",
      createdAt: current.createdAt || FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    return {
      queryCount: nextCount,
      remainingQueries: MAX_NEARBY_QUERIES_PER_WINDOW - nextCount,
      maxQueriesPerWindow: MAX_NEARBY_QUERIES_PER_WINDOW,
      queryWindowSeconds: Math.floor(NEARBY_QUERY_WINDOW_MS / 1000),
      windowExpiresAt: windowExpiresAt.toISOString(),
      rawCoordinatesStored: false,
    };
  });
}

module.exports = {
  NEARBY_QUERY_WINDOW_MS,
  MAX_NEARBY_QUERIES_PER_WINDOW,
  locationQueryBudgetId,
  timestampToMillis,
  consumeNearbyLocationQueryBudget,
};
