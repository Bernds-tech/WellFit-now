const { optionalString, serverTimestamps, updatedTimestamp } = require("./beta1Runtime");

const DEFAULT_TIME_ZONE = "UTC";
const TIME_ZONE_CHANGE_COOLDOWN_HOURS = 20;
const TIME_ZONE_CHANGE_COOLDOWN_MS = TIME_ZONE_CHANGE_COOLDOWN_HOURS * 60 * 60 * 1000;

function timestampToDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function normalizeTimeZone(value) {
  const candidate = optionalString(value, 120);
  if (!candidate) return null;
  try {
    return new Intl.DateTimeFormat("en-US", { timeZone: candidate }).resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

function dateKeyInTimeZone(value = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const normalizedTimeZone = normalizeTimeZone(timeZone) || DEFAULT_TIME_ZONE;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: normalizedTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

function dateKeyToUtcDate(dateKey) {
  const [year, month, day] = String(dateKey).split("-").map(Number);
  if (!year || !month || !day) return null;
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return Number.isNaN(date.getTime()) ? null : date;
}

function utcDateKey(date) {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(dateKey, delta) {
  const date = dateKeyToUtcDate(dateKey);
  if (!date) return null;
  date.setUTCDate(date.getUTCDate() + delta);
  return utcDateKey(date);
}

function weekRangeFromDateKey(dateKey) {
  const date = dateKeyToUtcDate(dateKey);
  if (!date) return null;
  const isoDayIndex = (date.getUTCDay() + 6) % 7;
  const start = new Date(date);
  start.setUTCDate(start.getUTCDate() - isoDayIndex);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);

  const thursday = new Date(start);
  thursday.setUTCDate(thursday.getUTCDate() + 3);
  const weekYear = thursday.getUTCFullYear();
  const januaryFourth = new Date(Date.UTC(weekYear, 0, 4, 12, 0, 0));
  const januaryFourthDayIndex = (januaryFourth.getUTCDay() + 6) % 7;
  const firstWeekMonday = new Date(januaryFourth);
  firstWeekMonday.setUTCDate(firstWeekMonday.getUTCDate() - januaryFourthDayIndex);
  const weekNumber = 1 + Math.round((start.getTime() - firstWeekMonday.getTime()) / (7 * 86400000));

  return {
    weekKey: `${weekYear}-W${String(weekNumber).padStart(2, "0")}`,
    weekStartDateKey: utcDateKey(start),
    weekEndDateKey: utcDateKey(end),
  };
}

function weekRangeInTimeZone(value = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const dateKey = dateKeyInTimeZone(value, timeZone);
  return dateKey ? weekRangeFromDateKey(dateKey) : null;
}

function documentDateKey(data, preferredFields, timeZone = DEFAULT_TIME_ZONE) {
  for (const field of preferredFields) {
    const date = timestampToDate(data[field]);
    const key = date ? dateKeyInTimeZone(date, timeZone) : null;
    if (key) return key;
  }
  return null;
}

async function resolveUserCalendarContext(db, userId, requestedTimeZoneValue, HttpsError, value = new Date()) {
  const rawRequestedTimeZone = optionalString(requestedTimeZoneValue, 120);
  const requestedTimeZone = normalizeTimeZone(rawRequestedTimeZone);
  if (rawRequestedTimeZone && !requestedTimeZone) {
    throw new HttpsError("invalid-argument", "timeZone muss eine gueltige IANA-Zeitzone sein.");
  }

  const ref = db.collection("userCalendarSettings").doc(userId);
  const snapshot = await ref.get();
  const existing = snapshot.exists ? snapshot.data() || {} : {};
  const storedTimeZone = normalizeTimeZone(existing.timeZone);
  let timeZone = storedTimeZone || requestedTimeZone || DEFAULT_TIME_ZONE;
  let timeZoneChanged = false;
  let timeZoneChangeDeferred = false;
  let nextTimeZoneChangeAt = null;
  const now = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(now.getTime())) {
    throw new HttpsError("invalid-argument", "Ungueltiger Kalenderzeitpunkt.");
  }

  if (!snapshot.exists && requestedTimeZone) {
    timeZone = requestedTimeZone;
    const changedAt = now.toISOString();
    await ref.set({
      ownerUserId: userId,
      userId,
      timeZone,
      previousTimeZone: null,
      timeZoneChangedAt: changedAt,
      calendarAuthority: "server-user-time-zone",
      timeZoneChangePolicy: "minimum-20-hours",
      changeCooldownHours: TIME_ZONE_CHANGE_COOLDOWN_HOURS,
      ...serverTimestamps(),
    });
    timeZoneChanged = true;
  } else if (snapshot.exists && requestedTimeZone && requestedTimeZone !== storedTimeZone) {
    const changedAt = timestampToDate(existing.timeZoneChangedAt)
      || timestampToDate(existing.createdAt)
      || timestampToDate(existing.updatedAt);
    const nextChangeMillis = changedAt ? changedAt.getTime() + TIME_ZONE_CHANGE_COOLDOWN_MS : 0;
    if (storedTimeZone && nextChangeMillis > now.getTime()) {
      timeZone = storedTimeZone;
      timeZoneChangeDeferred = true;
      nextTimeZoneChangeAt = new Date(nextChangeMillis).toISOString();
    } else {
      timeZone = requestedTimeZone;
      const changedAtIso = now.toISOString();
      await ref.set({
        ownerUserId: userId,
        userId,
        timeZone,
        previousTimeZone: storedTimeZone || null,
        timeZoneChangedAt: changedAtIso,
        calendarAuthority: "server-user-time-zone",
        timeZoneChangePolicy: "minimum-20-hours",
        changeCooldownDays: null,
        changeCooldownHours: TIME_ZONE_CHANGE_COOLDOWN_HOURS,
        ...updatedTimestamp(),
      }, { merge: true });
      timeZoneChanged = true;
    }
  }

  const dateKey = dateKeyInTimeZone(now, timeZone);
  const weekRange = weekRangeFromDateKey(dateKey);
  if (!dateKey || !weekRange) {
    throw new HttpsError("internal", "Nutzerlokaler Kalenderzeitraum konnte nicht bestimmt werden.");
  }

  return {
    timeZone,
    dateKey,
    ...weekRange,
    calendarAuthority: "server-user-time-zone",
    timeZoneChangePolicy: "minimum-20-hours",
    timeZoneChangeCooldownHours: TIME_ZONE_CHANGE_COOLDOWN_HOURS,
    configured: snapshot.exists || Boolean(requestedTimeZone),
    timeZoneChanged,
    timeZoneChangeDeferred,
    nextTimeZoneChangeAt,
  };
}

module.exports = {
  DEFAULT_TIME_ZONE,
  TIME_ZONE_CHANGE_COOLDOWN_HOURS,
  TIME_ZONE_CHANGE_COOLDOWN_MS,
  timestampToDate,
  normalizeTimeZone,
  dateKeyInTimeZone,
  dateKeyToUtcDate,
  utcDateKey,
  addUtcDays,
  weekRangeFromDateKey,
  weekRangeInTimeZone,
  documentDateKey,
  resolveUserCalendarContext,
};
