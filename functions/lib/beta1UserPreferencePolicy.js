const { FieldValue } = require("firebase-admin/firestore");
const { optionalString } = require("./beta1Runtime");
const { CONSENT_VERSION } = require("./beta1UserOnboarding");

const SETTINGS_VERSION = "2026-07-24-v1";
const SESSION_WRITE_INTERVAL_MS = 5 * 60 * 1000;

const SESSION_SOURCES = new Set(["login", "dashboard", "settings"]);
const PROFILE_VISIBILITY = new Set(["Privat", "Freunde", "Community"]);
const HEALTH_DATA_USAGE = new Set([
  "Nicht verwenden",
  "Nicht aktiviert",
  "Nur Personalisierung",
  "Personalisierung & anonyme Verbesserung",
]);
const LOCATION_SHARING = new Set(["Nie", "Nur Freunde", "Nur Team", "Community"]);
const ACTIVITY_LEVELS = new Set([
  "Kaum aktiv",
  "Gelegentlich aktiv",
  "Regelmäßig aktiv",
  "Sehr aktiv",
  "Sportlich ambitioniert",
]);
const TRAINING_TIMES = new Set(["Morgens", "Mittags", "Nachmittags", "Abends", "Flexibel"]);
const COMMUNITY_MODES = new Set([
  "Alleine",
  "Alleine & gelegentlich gemeinsam",
  "Freunde & kleine Gruppen",
  "Community & Events",
  "Familie / Generationen-Tandem",
]);
const SOCIAL_PREFERENCES = new Set([
  "Alleine",
  "Freunde & kleine Gruppen",
  "Familie",
  "Öffentliche Gruppen",
  "Gemischt",
]);
const COMPETITION_MODES = new Set(["Aus", "Locker", "Motivierend", "Stark kompetitiv"]);
const AVATAR_TYPES = new Set([
  "Tierischer Begleiter",
  "Roboter / Cyborg",
  "Magisches Wesen",
  "Abenteuer-Begleiter",
  "Lese-Freund / Lern-Buddy",
  "Social Buddy",
]);
const BUDDY_PERSONALITIES = new Set([
  "Sanft & motivierend",
  "Direkt & fordernd",
  "Spielerisch & lustig",
  "Ruhig & achtsam",
  "Wettbewerbsorientiert",
  "Beschützend / fürsorglich",
]);
const RELATIONSHIP_MODES = new Set([
  "Begleiter",
  "Coach",
  "Haustier / Pflegewesen",
  "Mentor",
  "Freund",
  "Abenteuerpartner",
]);
const BEHAVIOR_DYNAMICS = new Set(["Stabil", "Adaptiv", "Emotional reagierend", "Herausfordernd"]);
const MOTIVATION_STYLES = new Set(["Sanft", "Ausgewogen", "Stärker antreibend"]);
const BODY_TYPES = new Set(["Schlank", "Normal", "Kräftig"]);
const FITNESS_LEVELS = new Set(["Anfänger", "Fortgeschritten", "Aktiv"]);
const LEVEL_VALUES = new Set(["Niedrig", "Mittel", "Hoch"]);
const PAIN_LEVELS = new Set(["Keine", "Leicht", "Mittel", "Stark"]);
const NUTRITION_VALUES = new Set([
  "Ausgewogen",
  "Vegetarisch",
  "Vegan",
  "Low Carb",
  "High Protein",
  "Unregelmäßig",
]);
const MEAL_RHYTHMS = new Set(["Regelmäßig", "Unregelmäßig", "Intervallfasten", "Viele kleine Mahlzeiten"]);
const REMINDER_LEVELS = new Set(["Niedrig", "Normal", "Hoch"]);
const ALCOHOL_VALUES = new Set(["Nie", "Selten", "Gelegentlich", "Regelmäßig"]);
const SLEEP_ROUTINES = new Set(["Regelmäßig", "Unregelmäßig", "Schicht / wechselnd"]);
const NATURE_MOVE_VALUES = new Set(["Selten", "Gelegentlich", "Häufig", "Täglich"]);
const STRESS_COPING_VALUES = new Set([
  "Spaziergang / Bewegung",
  "Musik",
  "Meditation / Atmung",
  "Gaming",
  "Freunde / Familie",
  "Noch keine Routine",
]);

function asObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function safeDocIdPart(value) {
  return encodeURIComponent(String(value || "none")).replace(/\./g, "%2E");
}

function strictEnum(value, allowed, fieldName, HttpsError, fallback = null) {
  const normalized = optionalString(value, 120);
  if (!normalized) {
    if (fallback !== null) return fallback;
    throw new HttpsError("invalid-argument", `${fieldName} fehlt.`);
  }
  if (!allowed.has(normalized)) {
    throw new HttpsError("invalid-argument", `${fieldName} ist nicht freigegeben.`);
  }
  return normalized;
}

function optionalNumber(value, min, max, fieldName, HttpsError) {
  if (value === undefined || value === null || String(value).trim() === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) {
    throw new HttpsError("invalid-argument", `${fieldName} liegt ausserhalb des erlaubten Bereichs.`);
  }
  return Math.round((number + Number.EPSILON) * 100) / 100;
}

function uniqueStringList(value, maxItems = 20, maxLength = 80) {
  const source = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? value.split(",")
      : [];
  return [...new Set(source
    .map((item) => optionalString(item, maxLength))
    .filter(Boolean))]
    .slice(0, maxItems);
}

function booleanSettings(source, keys) {
  return Object.fromEntries(keys.map((key) => [key, source[key] === true]));
}

function rejectFreeText(source, fields, HttpsError, message) {
  if (fields.some((field) => Boolean(optionalString(source[field], 10)))) {
    throw new HttpsError("invalid-argument", message);
  }
}

function normalizedNotifications(value) {
  return booleanSettings(asObject(value), [
    "missionReminder",
    "sleepReminder",
    "weeklyReport",
    "glitchAlert",
  ]);
}

function normalizedPermissions(value) {
  return booleanSettings(asObject(value), [
    "location",
    "locationTracking",
    "camera",
    "microphone",
    "backgroundTracking",
  ]);
}

function normalizedActivity(value, HttpsError) {
  const source = asObject(value);
  rejectFreeText(
    source,
    ["notes"],
    HttpsError,
    "Freie Missionsnotizen werden in Beta 1 nicht gespeichert.",
  );
  return {
    activityLevel: strictEnum(source.activityLevel, ACTIVITY_LEVELS, "activityLevel", HttpsError),
    trainingTime: strictEnum(source.trainingTime, TRAINING_TIMES, "trainingTime", HttpsError),
    communityMode: strictEnum(source.communityMode, COMMUNITY_MODES, "communityMode", HttpsError),
    interests: uniqueStringList(source.interests),
    activities: uniqueStringList(source.activities),
    goals: uniqueStringList(source.goals),
    preferredMissionTypes: uniqueStringList(source.preferredMissionTypes),
    socialPreference: strictEnum(source.socialPreference, SOCIAL_PREFERENCES, "socialPreference", HttpsError),
    competitionMode: strictEnum(source.competitionMode, COMPETITION_MODES, "competitionMode", HttpsError),
    freeTextNotesStored: false,
  };
}

function normalizedBuddy(value, HttpsError) {
  const source = asObject(value);
  return {
    avatarType: strictEnum(source.avatarType, AVATAR_TYPES, "avatarType", HttpsError),
    personality: strictEnum(source.personality, BUDDY_PERSONALITIES, "personality", HttpsError),
    relationshipMode: strictEnum(source.relationshipMode, RELATIONSHIP_MODES, "relationshipMode", HttpsError),
    behaviorDynamics: strictEnum(source.behaviorDynamics, BEHAVIOR_DYNAMICS, "behaviorDynamics", HttpsError),
    motivationStyle: strictEnum(source.motivationStyle, MOTIVATION_STYLES, "motivationStyle", HttpsError),
    reactsToStress: source.reactsToStress === true,
    reactsToSleep: source.reactsToSleep === true,
    reactsToActivity: source.reactsToActivity === true,
    reactsToMood: source.reactsToMood === true,
  };
}

function normalizedBiometrics(value, HttpsError) {
  const source = asObject(value);
  const heightCm = optionalNumber(source.heightCm, 100, 250, "heightCm", HttpsError);
  const weightKg = optionalNumber(source.weightKg, 25, 400, "weightKg", HttpsError);
  const targetWeightEnabled = source.targetWeightEnabled === true;
  const targetWeightKg = targetWeightEnabled
    ? optionalNumber(source.targetWeightKg, 25, 400, "targetWeightKg", HttpsError)
    : null;
  const result = {
    targetWeightEnabled,
    bodyType: strictEnum(source.bodyType, BODY_TYPES, "bodyType", HttpsError),
    fitnessLevel: strictEnum(source.fitnessLevel, FITNESS_LEVELS, "fitnessLevel", HttpsError),
    limitations: uniqueStringList(source.limitations, 10, 80),
    freeTextHealthNotesStored: false,
  };
  if (heightCm !== null) result.heightCm = heightCm;
  if (weightKg !== null) result.weightKg = weightKg;
  if (targetWeightKg !== null) result.targetWeightKg = targetWeightKg;
  return result;
}

function parseBloodPressure(value, HttpsError) {
  const normalized = optionalString(value, 20);
  if (!normalized) return null;
  const match = normalized.match(/^(\d{2,3})\s*\/\s*(\d{2,3})$/);
  if (!match) {
    throw new HttpsError("invalid-argument", "bloodPressure muss im Format 120/80 vorliegen.");
  }
  const systolic = Number(match[1]);
  const diastolic = Number(match[2]);
  if (systolic < 60 || systolic > 250 || diastolic < 30 || diastolic > 150 || systolic <= diastolic) {
    throw new HttpsError(
      "invalid-argument",
      "bloodPressure liegt ausserhalb des erlaubten Plausibilitaetsbereichs.",
    );
  }
  return { systolic, diastolic };
}

function normalizedVitals(value, HttpsError) {
  const source = asObject(value);
  rejectFreeText(
    source,
    ["medicationNote", "healthNotes"],
    HttpsError,
    "Medikamentennamen und freie Gesundheitsnotizen werden in Beta 1 nicht gespeichert.",
  );
  const bodyFatPercent = optionalNumber(source.bodyFatPercent, 1, 75, "bodyFatPercent", HttpsError);
  const restingPulseBpm = optionalNumber(source.restingPulseBpm, 25, 250, "restingPulseBpm", HttpsError);
  const averagePulseBpm = optionalNumber(source.averagePulseBpm, 25, 250, "averagePulseBpm", HttpsError);
  const sleepHours = optionalNumber(source.sleepHours, 0, 24, "sleepHours", HttpsError);
  const bloodPressure = parseBloodPressure(source.bloodPressure, HttpsError);
  const result = {
    sleepQuality: strictEnum(source.sleepQuality, LEVEL_VALUES, "sleepQuality", HttpsError),
    stressLevel: strictEnum(source.stressLevel, LEVEL_VALUES, "stressLevel", HttpsError),
    energyLevel: strictEnum(source.energyLevel, LEVEL_VALUES, "energyLevel", HttpsError),
    painLevel: strictEnum(source.painLevel, PAIN_LEVELS, "painLevel", HttpsError),
    medicationDeclared: source.medicationDeclared === true,
    medicationDetailsStored: false,
    freeTextHealthNotesStored: false,
  };
  if (bodyFatPercent !== null) result.bodyFatPercent = bodyFatPercent;
  if (restingPulseBpm !== null) result.restingPulseBpm = Math.round(restingPulseBpm);
  if (averagePulseBpm !== null) result.averagePulseBpm = Math.round(averagePulseBpm);
  if (sleepHours !== null) result.sleepHours = sleepHours;
  if (bloodPressure) result.bloodPressure = bloodPressure;
  return result;
}

function normalizedLifestyle(value, HttpsError) {
  const source = asObject(value);
  rejectFreeText(
    source,
    ["notes"],
    HttpsError,
    "Freie Lebensstilnotizen werden in Beta 1 nicht gespeichert.",
  );
  const drinkAmountLiters = optionalNumber(
    source.drinkAmountLiters,
    0.2,
    10,
    "drinkAmountLiters",
    HttpsError,
  );
  const result = {
    nutrition: strictEnum(source.nutrition, NUTRITION_VALUES, "nutrition", HttpsError),
    mealRhythm: strictEnum(source.mealRhythm, MEAL_RHYTHMS, "mealRhythm", HttpsError),
    drinkReminder: strictEnum(source.drinkReminder, REMINDER_LEVELS, "drinkReminder", HttpsError),
    caffeineIntake: strictEnum(source.caffeineIntake, LEVEL_VALUES, "caffeineIntake", HttpsError),
    alcoholFrequency: strictEnum(source.alcoholFrequency, ALCOHOL_VALUES, "alcoholFrequency", HttpsError),
    sleepRoutine: strictEnum(source.sleepRoutine, SLEEP_ROUTINES, "sleepRoutine", HttpsError),
    natureMove: strictEnum(source.natureMove, NATURE_MOVE_VALUES, "natureMove", HttpsError),
    stressCoping: strictEnum(source.stressCoping, STRESS_COPING_VALUES, "stressCoping", HttpsError),
    screenTime: strictEnum(source.screenTime, LEVEL_VALUES, "screenTime", HttpsError),
    freeTextNotesStored: false,
  };
  if (drinkAmountLiters !== null) result.drinkAmountLiters = drinkAmountLiters;
  return result;
}

function normalizedPrivacy(value, HttpsError) {
  const source = asObject(value);
  return {
    ...booleanSettings(source, [
      "leaderboardVisible",
      "buddySharing",
      "anonymousAnalytics",
      "friendRequests",
      "teamInvitations",
      "localUsersVisible",
      "pvpAllowed",
    ]),
    profileVisibility: strictEnum(source.profileVisibility, PROFILE_VISIBILITY, "profileVisibility", HttpsError),
    healthDataUsage: strictEnum(source.healthDataUsage, HEALTH_DATA_USAGE, "healthDataUsage", HttpsError),
    locationSharing: strictEnum(source.locationSharing, LOCATION_SHARING, "locationSharing", HttpsError),
  };
}

function currentConsentSummary(onboarding) {
  return asObject(onboarding && onboarding.consentSummary);
}

function healthConsentEnabled(onboarding) {
  return currentConsentSummary(onboarding).healthPersonalization === true;
}

function consentEventPayload({ ref, userId, consentType, accepted, previousAccepted, nowIso }) {
  return {
    consentEventId: ref.id,
    ownerUserId: userId,
    userId,
    consentType,
    version: CONSENT_VERSION,
    status: accepted ? "active" : previousAccepted ? "revoked" : "declined",
    grantedAt: accepted ? nowIso : null,
    declinedAt: !accepted && !previousAccepted ? nowIso : null,
    revokedAt: !accepted && previousAccepted ? nowIso : null,
    source: "web-settings",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

module.exports = {
  SETTINGS_VERSION,
  SESSION_WRITE_INTERVAL_MS,
  SESSION_SOURCES,
  asObject,
  safeDocIdPart,
  strictEnum,
  uniqueStringList,
  normalizedNotifications,
  normalizedPermissions,
  normalizedActivity,
  normalizedBuddy,
  normalizedBiometrics,
  normalizedVitals,
  normalizedLifestyle,
  normalizedPrivacy,
  currentConsentSummary,
  healthConsentEnabled,
  consentEventPayload,
};
