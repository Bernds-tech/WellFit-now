const { FieldValue } = require("firebase-admin/firestore");
const {
  requireAuth,
  requiredString,
  optionalString,
} = require("./beta1Runtime");
const { CONSENT_VERSION } = require("./beta1UserOnboarding");
const { timestampToDate } = require("./beta1UserCalendar");

const SETTINGS_VERSION = "2026-07-24-v1";
const SESSION_WRITE_INTERVAL_MS = 5 * 60 * 1000;

const PROFILE_VISIBILITY = new Set(["Privat", "Freunde", "Community"]);
const HEALTH_DATA_USAGE = new Set(["Nicht verwenden", "Nicht aktiviert", "Nur Personalisierung", "Personalisierung & anonyme Verbesserung"]);
const LOCATION_SHARING = new Set(["Nie", "Nur Freunde", "Nur Team", "Community"]);
const ACTIVITY_LEVELS = new Set(["Kaum aktiv", "Gelegentlich aktiv", "Regelmäßig aktiv", "Sehr aktiv", "Sportlich ambitioniert"]);
const TRAINING_TIMES = new Set(["Morgens", "Mittags", "Nachmittags", "Abends", "Flexibel"]);
const COMMUNITY_MODES = new Set(["Alleine", "Alleine & gelegentlich gemeinsam", "Freunde & kleine Gruppen", "Community & Events", "Familie / Generationen-Tandem"]);
const SOCIAL_PREFERENCES = new Set(["Alleine", "Freunde & kleine Gruppen", "Familie", "Öffentliche Gruppen", "Gemischt"]);
const COMPETITION_MODES = new Set(["Aus", "Locker", "Motivierend", "Stark kompetitiv"]);
const AVATAR_TYPES = new Set(["Tierischer Begleiter", "Roboter / Cyborg", "Magisches Wesen", "Abenteuer-Begleiter", "Lese-Freund / Lern-Buddy", "Social Buddy"]);
const BUDDY_PERSONALITIES = new Set(["Sanft & motivierend", "Direkt & fordernd", "Spielerisch & lustig", "Ruhig & achtsam", "Wettbewerbsorientiert", "Beschützend / fürsorglich"]);
const RELATIONSHIP_MODES = new Set(["Begleiter", "Coach", "Haustier / Pflegewesen", "Mentor", "Freund", "Abenteuerpartner"]);
const BEHAVIOR_DYNAMICS = new Set(["Stabil", "Adaptiv", "Emotional reagierend", "Herausfordernd"]);
const MOTIVATION_STYLES = new Set(["Sanft", "Ausgewogen", "Stärker antreibend"]);
const BODY_TYPES = new Set(["Schlank", "Normal", "Kräftig"]);
const FITNESS_LEVELS = new Set(["Anfänger", "Fortgeschritten", "Aktiv"]);
const LEVEL_VALUES = new Set(["Niedrig", "Mittel", "Hoch"]);
const PAIN_LEVELS = new Set(["Keine", "Leicht", "Mittel", "Stark"]);
const NUTRITION_VALUES = new Set(["Ausgewogen", "Vegetarisch", "Vegan", "Low Carb", "High Protein", "Unregelmäßig"]);
const MEAL_RHYTHMS = new Set(["Regelmäßig", "Unregelmäßig", "Intervallfasten", "Viele kleine Mahlzeiten"]);
const REMINDER_LEVELS = new Set(["Niedrig", "Normal", "Hoch"]);
const ALCOHOL_VALUES = new Set(["Nie", "Selten", "Gelegentlich", "Regelmäßig"]);
const SLEEP_ROUTINES = new Set(["Regelmäßig", "Unregelmäßig", "Schicht / wechselnd"]);
const NATURE_MOVE_VALUES = new Set(["Selten", "Gelegentlich", "Häufig", "Täglich"]);
const STRESS_COPING_VALUES = new Set(["Spaziergang / Bewegung", "Musik", "Meditation / Atmung", "Gaming", "Freunde / Familie", "Noch keine Routine"]);

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
  return Number(number.toFixed(2));
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

function normalizedNotifications(value) {
  const source = asObject(value);
  return booleanSettings(source, ["missionReminder", "sleepReminder", "weeklyReport", "glitchAlert"]);
}

function normalizedPermissions(value) {
  const source = asObject(value);
  return booleanSettings(source, ["location", "locationTracking", "camera", "microphone", "backgroundTracking"]);
}

function normalizedActivity(value, HttpsError) {
  const source = asObject(value);
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
  if (!match) throw new HttpsError("invalid-argument", "bloodPressure muss im Format 120/80 vorliegen.");
  const systolic = Number(match[1]);
  const diastolic = Number(match[2]);
  if (systolic < 60 || systolic > 250 || diastolic < 30 || diastolic > 150 || systolic <= diastolic) {
    throw new HttpsError("invalid-argument", "bloodPressure liegt ausserhalb des erlaubten Plausibilitaetsbereichs.");
  }
  return { systolic, diastolic };
}

function normalizedVitals(value, HttpsError) {
  const source = asObject(value);
  if (optionalString(source.medicationNote, 10) || optionalString(source.healthNotes, 10)) {
    throw new HttpsError("invalid-argument", "Medikamentennamen und freie Gesundheitsnotizen werden in Beta 1 nicht gespeichert.");
  }
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
  if (optionalString(source.notes, 10)) {
    throw new HttpsError("invalid-argument", "Freie Lebensstilnotizen werden in Beta 1 nicht gespeichert.");
  }
  const drinkAmountLiters = optionalNumber(source.drinkAmountLiters, 0.2, 10, "drinkAmountLiters", HttpsError);
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
    ...booleanSettings(source, ["leaderboardVisible", "buddySharing", "anonymousAnalytics", "friendRequests", "teamInvitations", "localUsersVisible", "pvpAllowed"]),
    profileVisibility: strictEnum(source.profileVisibility, PROFILE_VISIBILITY, "profileVisibility", HttpsError),
    healthDataUsage: strictEnum(source.healthDataUsage, HEALTH_DATA_USAGE, "healthDataUsage", HttpsError),
    locationSharing: strictEnum(source.locationSharing, LOCATION_SHARING, "locationSharing", HttpsError),
  };
}

async function requireInitializedContext(db, userId, HttpsError) {
  const userRef = db.collection("users").doc(userId);
  const onboardingRef = db.collection("userOnboardingRecords").doc(userId);
  const privateProfileRef = db.collection("userPrivateProfiles").doc(userId);
  const calendarRef = db.collection("userCalendarSettings").doc(userId);
  const [userSnapshot, onboardingSnapshot, privateProfileSnapshot, calendarSnapshot] = await Promise.all([
    userRef.get(),
    onboardingRef.get(),
    privateProfileRef.get(),
    calendarRef.get(),
  ]);
  if (!userSnapshot.exists || !onboardingSnapshot.exists || (onboardingSnapshot.data() || {}).status !== "completed") {
    throw new HttpsError("failed-precondition", "Sichere Konto-Initialisierung ist erforderlich.");
  }
  return {
    userRef,
    onboardingRef,
    privateProfileRef,
    calendarRef,
    user: userSnapshot.data() || {},
    onboarding: onboardingSnapshot.data() || {},
    privateProfile: privateProfileSnapshot.exists ? privateProfileSnapshot.data() || {} : {},
    privateProfileExists: privateProfileSnapshot.exists,
    calendar: calendarSnapshot.exists ? calendarSnapshot.data() || {} : {},
  };
}

function currentConsentSummary(onboarding) {
  return asObject(onboarding.consentSummary);
}

function healthConsentEnabled(onboarding) {
  return currentConsentSummary(onboarding).healthPersonalization === true;
}

async function writeUserAudit(db, { userId, actionType, targetType, targetId, metadata }) {
  const ref = db.collection("auditEvents").doc();
  await ref.set({
    auditEventId: ref.id,
    actorUserId: userId,
    ownerUserId: userId,
    userId,
    childProfileId: null,
    actionType,
    targetType,
    targetId: targetId || userId,
    reason: "authenticated-user-settings",
    metadata: metadata || {},
    source: "beta1-user-settings",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
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

function defaultSettingsState({ user, onboarding, privateProfile, calendar, authEmail }) {
  const profile = asObject(user.profile);
  const settings = asObject(user.settings);
  const reminders = asObject(settings.reminders);
  const privacy = asObject(settings.privacy);
  const permissions = asObject(settings.permissions);
  const activity = asObject(profile.activity);
  const aiBuddy = asObject(profile.aiBuddy);
  const healthSettings = asObject(privateProfile.healthSettings);
  const biometrics = asObject(healthSettings.biometrics);
  const vitals = asObject(healthSettings.vitals);
  const legacyHealth = asObject(privateProfile.healthProfile);
  const lifestyle = asObject(privateProfile.lifestyleSettings);
  const summary = currentConsentSummary(onboarding);
  const healthEnabled = summary.healthPersonalization === true;
  const healthImprovement = summary.healthImprovement === true;
  const bloodPressure = asObject(vitals.bloodPressure);

  return {
    profile: {
      displayName: optionalString(settings.displayName, 160) || optionalString(user.displayName, 160) || `${optionalString(user.firstName, 80) || ""} ${optionalString(user.lastName, 80) || ""}`.trim(),
      email: optionalString(authEmail, 320) || optionalString(user.email, 320) || "",
      phone: optionalString(settings.phone, 40) || "",
      language: optionalString(settings.language, 40) || "Deutsch",
      birthDate: "",
      gender: "",
      timezone: optionalString(calendar.timeZone, 120) || optionalString(settings.timeZone, 120) || "UTC",
      units: optionalString(settings.units, 40) || "kg / km",
    },
    notifications: {
      missionReminder: reminders.missionReminder === true,
      sleepReminder: reminders.sleepReminder === true,
      weeklyReport: reminders.weeklyReport === true,
      glitchAlert: reminders.glitchAlert === true,
    },
    permissions: {
      location: permissions.location === true,
      locationTracking: permissions.locationTracking === true,
      camera: permissions.camera === true,
      microphone: permissions.microphone === true,
      backgroundTracking: permissions.backgroundTracking === true,
    },
    activity: {
      activityLevel: optionalString(activity.activityLevel, 120) || "Gelegentlich aktiv",
      trainingTime: optionalString(activity.trainingTime, 120) || "Abends",
      communityMode: optionalString(activity.communityMode, 120) || "Alleine",
      interests: Array.isArray(activity.interests) ? activity.interests : [],
      activities: Array.isArray(activity.activities) ? activity.activities : [],
      goals: Array.isArray(activity.goals) ? activity.goals : [],
      preferredMissionTypes: Array.isArray(activity.preferredMissionTypes) ? activity.preferredMissionTypes : [],
      socialPreference: optionalString(activity.socialPreference, 120) || "Alleine",
      competitionMode: optionalString(activity.competitionMode, 120) || "Aus",
      notes: "",
    },
    aiBuddy: {
      avatarType: optionalString(aiBuddy.avatarType, 120) || "Tierischer Begleiter",
      personality: optionalString(aiBuddy.personality, 120) || "Spielerisch & lustig",
      relationshipMode: optionalString(aiBuddy.relationshipMode, 120) || "Begleiter",
      behaviorDynamics: optionalString(aiBuddy.behaviorDynamics, 120) || "Adaptiv",
      motivationStyle: optionalString(aiBuddy.motivationStyle, 120) || "Ausgewogen",
      reactsToStress: aiBuddy.reactsToStress === true,
      reactsToSleep: aiBuddy.reactsToSleep === true,
      reactsToActivity: aiBuddy.reactsToActivity !== false,
      reactsToMood: aiBuddy.reactsToMood === true,
    },
    privacy: {
      leaderboardVisible: privacy.leaderboardVisible === true,
      buddySharing: privacy.buddySharing === true,
      anonymousAnalytics: summary.anonymousAnalytics === true,
      friendRequests: privacy.friendRequests === true,
      teamInvitations: privacy.teamInvitations === true,
      localUsersVisible: privacy.localUsersVisible === true,
      pvpAllowed: privacy.pvpAllowed === true,
      profileVisibility: optionalString(privacy.profileVisibility, 80) || "Privat",
      healthDataUsage: !healthEnabled ? "Nicht verwenden" : healthImprovement ? "Personalisierung & anonyme Verbesserung" : "Nur Personalisierung",
      locationSharing: optionalString(privacy.locationSharing, 80) || "Nie",
    },
    biometrics: healthEnabled ? {
      height: String(biometrics.heightCm ?? legacyHealth.heightCm ?? ""),
      weight: String(biometrics.weightKg ?? legacyHealth.weightKg ?? ""),
      targetWeightEnabled: biometrics.targetWeightEnabled === true,
      targetWeight: String(biometrics.targetWeightKg ?? ""),
      bodyType: optionalString(biometrics.bodyType, 80) || "Schlank",
      fitnessLevel: optionalString(biometrics.fitnessLevel, 80) || "Anfänger",
      limitations: Array.isArray(biometrics.limitations)
        ? biometrics.limitations.join(", ")
        : Array.isArray(legacyHealth.limitations)
          ? legacyHealth.limitations.join(", ")
          : "",
    } : null,
    vitalValues: healthEnabled ? {
      bodyFat: String(vitals.bodyFatPercent ?? ""),
      restingPulse: String(vitals.restingPulseBpm ?? ""),
      averagePulse: String(vitals.averagePulseBpm ?? ""),
      bloodPressure: bloodPressure.systolic && bloodPressure.diastolic ? `${bloodPressure.systolic}/${bloodPressure.diastolic}` : "",
      sleepHours: String(vitals.sleepHours ?? ""),
      sleepQuality: optionalString(vitals.sleepQuality, 80) || "Mittel",
      stressLevel: optionalString(vitals.stressLevel, 80) || "Mittel",
      energyLevel: optionalString(vitals.energyLevel, 80) || "Mittel",
      painLevel: optionalString(vitals.painLevel, 80) || "Keine",
      medicationNote: vitals.medicationDeclared === true ? "Medikamenteneinnahme angegeben (keine Details gespeichert)" : "",
      healthNotes: "",
    } : null,
    lifestyle: healthEnabled ? {
      nutrition: optionalString(lifestyle.nutrition, 120) || "Ausgewogen",
      mealRhythm: optionalString(lifestyle.mealRhythm, 120) || "Regelmäßig",
      drinkReminder: optionalString(lifestyle.drinkReminder, 120) || "Normal",
      drinkAmount: String(lifestyle.drinkAmountLiters ?? ""),
      caffeineIntake: optionalString(lifestyle.caffeineIntake, 120) || "Mittel",
      alcoholFrequency: optionalString(lifestyle.alcoholFrequency, 120) || "Selten",
      sleepRoutine: optionalString(lifestyle.sleepRoutine, 120) || "Unregelmäßig",
      natureMove: optionalString(lifestyle.natureMove, 120) || "Gelegentlich",
      stressCoping: optionalString(lifestyle.stressCoping, 120) || "Spaziergang / Bewegung",
      screenTime: optionalString(lifestyle.screenTime, 120) || "Mittel",
      notes: "",
    } : null,
    healthConsentActive: healthEnabled,
    healthImprovementConsentActive: healthImprovement,
    healthProfileStored: privateProfile.healthProfileStored === true,
    healthDataCategories: Array.isArray(privateProfile.healthDataCategories) ? privateProfile.healthDataCategories.slice(0, 20) : [],
  };
}

function registerBeta1UserPreferences(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.getUserSettingsState = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const context = await requireInitializedContext(db, userId, HttpsError);
    return {
      accepted: true,
      requiresInitialization: false,
      settingsVersion: SETTINGS_VERSION,
      state: defaultSettingsState({
        ...context,
        authEmail: request.auth.token && request.auth.token.email,
      }),
      serverValidationStatus: "server-settings-projection",
      rawBirthDateStored: false,
      medicationDetailsStored: false,
      freeTextHealthNotesStored: false,
      economyFieldsChanged: false,
      tokenAuthorized: false,
      cashoutAllowed: false,
      realMoney: false,
    };
  });

  exportsTarget.recordUserSessionActivity = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const source = strictEnum((request.data || {}).source, new Set(["login", "dashboard", "settings"]), "source", HttpsError, "dashboard");
    const userRef = db.collection("users").doc(userId);
    const snapshot = await userRef.get();
    if (!snapshot.exists) {
      return {
        accepted: true,
        recorded: false,
        requiresInitialization: true,
        serverValidationStatus: "server-session-no-profile",
      };
    }
    const data = snapshot.data() || {};
    const lastLoginAt = timestampToDate(data.lastLoginAt);
    const nowDate = new Date();
    if (lastLoginAt && nowDate.getTime() - lastLoginAt.getTime() < SESSION_WRITE_INTERVAL_MS) {
      return {
        accepted: true,
        recorded: false,
        idempotent: true,
        requiresInitialization: data.onboardingCompleted !== true,
        serverValidationStatus: "server-session-rate-limited",
      };
    }
    await userRef.update({
      lastLoginAt: FieldValue.serverTimestamp(),
      lastSessionSource: source,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return {
      accepted: true,
      recorded: true,
      idempotent: false,
      requiresInitialization: data.onboardingCompleted !== true,
      serverValidationStatus: "server-session-recorded",
    };
  });

  exportsTarget.updateUserSettingsSection = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const section = requiredString(data.section, "section", HttpsError, 80);
    const context = await requireInitializedContext(db, userId, HttpsError);
    let normalized;
    let storage = "users";

    if (section === "notifications") normalized = normalizedNotifications(data.value);
    else if (section === "permissions") normalized = normalizedPermissions(data.value);
    else if (section === "activity") normalized = normalizedActivity(data.value, HttpsError);
    else if (section === "buddy") normalized = normalizedBuddy(data.value, HttpsError);
    else if (section === "biometrics") {
      if (!healthConsentEnabled(context.onboarding)) throw new HttpsError("failed-precondition", "Health-Personalisierung muss zuerst freiwillig aktiviert werden.");
      normalized = normalizedBiometrics(data.value, HttpsError);
      storage = "private";
    } else if (section === "vitals") {
      if (!healthConsentEnabled(context.onboarding)) throw new HttpsError("failed-precondition", "Health-Personalisierung muss zuerst freiwillig aktiviert werden.");
      normalized = normalizedVitals(data.value, HttpsError);
      storage = "private";
    } else if (section === "lifestyle") {
      if (!healthConsentEnabled(context.onboarding)) throw new HttpsError("failed-precondition", "Health-Personalisierung muss zuerst freiwillig aktiviert werden.");
      normalized = normalizedLifestyle(data.value, HttpsError);
      storage = "private";
    } else {
      throw new HttpsError("invalid-argument", "Unbekannter Settings-Bereich.");
    }

    if (storage === "users") {
      if (section === "notifications") {
        await context.userRef.update({
          "settings.reminders": normalized,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else if (section === "permissions") {
        await context.userRef.update({
          "settings.permissions": normalized,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else if (section === "activity") {
        await context.userRef.update({
          "profile.activity": normalized,
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else if (section === "buddy") {
        await context.userRef.update({
          "profile.aiBuddy.avatarType": normalized.avatarType,
          "profile.aiBuddy.personality": normalized.personality,
          "profile.aiBuddy.relationshipMode": normalized.relationshipMode,
          "profile.aiBuddy.behaviorDynamics": normalized.behaviorDynamics,
          "profile.aiBuddy.motivationStyle": normalized.motivationStyle,
          "profile.aiBuddy.reactsToStress": normalized.reactsToStress,
          "profile.aiBuddy.reactsToSleep": normalized.reactsToSleep,
          "profile.aiBuddy.reactsToActivity": normalized.reactsToActivity,
          "profile.aiBuddy.reactsToMood": normalized.reactsToMood,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } else {
      if (!context.privateProfileExists) {
        throw new HttpsError("failed-precondition", "Privates Profil muss serverseitig migriert werden.");
      }
      const existingCategories = Array.isArray(context.privateProfile.healthDataCategories)
        ? context.privateProfile.healthDataCategories
        : [];
      const categories = [...new Set([...existingCategories, section])].slice(0, 20);
      await context.privateProfileRef.update({
        [`healthSettings.${section}`]: normalized,
        healthPersonalizationEnabled: true,
        healthProfileStored: true,
        healthDataCategories: categories,
        rawBirthDateStored: false,
        medicationDetailsStored: false,
        freeTextHealthNotesStored: false,
        consentVersion: CONSENT_VERSION,
        serverValidationStatus: "server-private-settings",
        updatedAt: FieldValue.serverTimestamp(),
      });
      await context.userRef.update({
        "profile.healthPersonalizationEnabled": true,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    const auditEventId = await writeUserAudit(db, {
      userId,
      actionType: `user-settings-${section}-updated`,
      targetType: storage === "private" ? "userPrivateProfile" : "user",
      targetId: userId,
      metadata: {
        settingsVersion: SETTINGS_VERSION,
        section,
        storage,
        fieldNames: Object.keys(normalized),
        rawBirthDateStored: false,
        medicationDetailsStored: false,
        freeTextHealthNotesStored: false,
        economyFieldsChanged: false,
      },
    });

    return {
      accepted: true,
      section,
      value: normalized,
      storage,
      auditEventId,
      serverValidationStatus: "server-settings-updated",
      economyFieldsChanged: false,
      tokenAuthorized: false,
      cashoutAllowed: false,
      realMoney: false,
    };
  });

  exportsTarget.updateUserPrivacyConsents = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const privacy = normalizedPrivacy((request.data || {}).privacy, HttpsError);
    const context = await requireInitializedContext(db, userId, HttpsError);
    const currentSummary = currentConsentSummary(context.onboarding);
    const healthPersonalization = privacy.healthDataUsage !== "Nicht verwenden" && privacy.healthDataUsage !== "Nicht aktiviert";
    const healthImprovement = privacy.healthDataUsage === "Personalisierung & anonyme Verbesserung";
    const nextConsents = {
      healthPersonalization,
      healthImprovement,
      anonymousAnalytics: privacy.anonymousAnalytics,
    };
    const changedConsentTypes = Object.entries(nextConsents)
      .filter(([consentType, accepted]) => currentSummary[consentType] === true !== accepted)
      .map(([consentType, accepted]) => ({ consentType, accepted, previousAccepted: currentSummary[consentType] === true }));
    const consentRefs = changedConsentTypes.map(() => db.collection("userConsentEvents").doc());
    const nowIso = new Date().toISOString();
    const healthDataDeleted = currentSummary.healthPersonalization === true && !healthPersonalization;

    await db.runTransaction(async (transaction) => {
      transaction.update(context.userRef, {
        "settings.privacy.leaderboardVisible": privacy.leaderboardVisible,
        "settings.privacy.buddySharing": privacy.buddySharing,
        "settings.privacy.anonymousAnalytics": privacy.anonymousAnalytics,
        "settings.privacy.friendRequests": privacy.friendRequests,
        "settings.privacy.teamInvitations": privacy.teamInvitations,
        "settings.privacy.localUsersVisible": privacy.localUsersVisible,
        "settings.privacy.pvpAllowed": privacy.pvpAllowed,
        "settings.privacy.profileVisibility": privacy.profileVisibility,
        "settings.privacy.healthDataUsage": healthPersonalization
          ? healthImprovement
            ? "Personalisierung & anonyme Verbesserung"
            : "Nur Personalisierung"
          : "Nicht verwenden",
        "settings.privacy.locationSharing": privacy.locationSharing,
        "settings.consents.healthPersonalization": healthPersonalization,
        "settings.consents.healthImprovement": healthImprovement,
        "settings.consents.anonymousAnalytics": privacy.anonymousAnalytics,
        "settings.consents.version": CONSENT_VERSION,
        "profile.healthPersonalizationEnabled": healthPersonalization,
        updatedAt: FieldValue.serverTimestamp(),
      });
      transaction.update(context.onboardingRef, {
        "consentSummary.healthPersonalization": healthPersonalization,
        "consentSummary.healthImprovement": healthImprovement,
        "consentSummary.anonymousAnalytics": privacy.anonymousAnalytics,
        "consentSummary.version": CONSENT_VERSION,
        updatedAt: FieldValue.serverTimestamp(),
      });

      const privateUpdate = {
        healthPersonalizationEnabled: healthPersonalization,
        healthImprovementEnabled: healthImprovement,
        consentVersion: CONSENT_VERSION,
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (!healthPersonalization) {
        privateUpdate.healthProfileStored = false;
        privateUpdate.healthDataCategories = [];
        privateUpdate.healthProfile = FieldValue.delete();
        privateUpdate.healthSettings = FieldValue.delete();
        privateUpdate.lifestyleSettings = FieldValue.delete();
        privateUpdate.medicationDetailsStored = false;
        privateUpdate.freeTextHealthNotesStored = false;
      }
      if (context.privateProfileExists) {
        transaction.update(context.privateProfileRef, privateUpdate);
      } else {
        transaction.set(context.privateProfileRef, {
          privateProfileId: context.privateProfileRef.id,
          ownerUserId: userId,
          userId,
          rawBirthDateStored: false,
          medicationDetailsStored: false,
          freeTextHealthNotesStored: false,
          serverValidationStatus: "server-private-settings",
          createdAt: FieldValue.serverTimestamp(),
          ...privateUpdate,
        });
      }

      changedConsentTypes.forEach((change, index) => {
        transaction.set(consentRefs[index], consentEventPayload({
          ref: consentRefs[index],
          userId,
          ...change,
          nowIso,
        }));
      });
    });

    const auditEventId = await writeUserAudit(db, {
      userId,
      actionType: "user-privacy-consents-updated",
      targetType: "userOnboardingRecord",
      targetId: userId,
      metadata: {
        settingsVersion: SETTINGS_VERSION,
        changedConsentTypes: changedConsentTypes.map((change) => change.consentType),
        healthPersonalization,
        healthImprovement,
        anonymousAnalytics: privacy.anonymousAnalytics,
        healthDataDeleted,
        rawBirthDateStored: false,
        economyFieldsChanged: false,
      },
    });

    return {
      accepted: true,
      privacy: {
        ...privacy,
        healthDataUsage: healthPersonalization
          ? healthImprovement
            ? "Personalisierung & anonyme Verbesserung"
            : "Nur Personalisierung"
          : "Nicht verwenden",
      },
      consentSummary: {
        healthPersonalization,
        healthImprovement,
        anonymousAnalytics: privacy.anonymousAnalytics,
        version: CONSENT_VERSION,
      },
      changedConsentTypes: changedConsentTypes.map((change) => change.consentType),
      healthDataDeleted,
      auditEventId,
      serverValidationStatus: "server-privacy-consents-updated",
      tokenAuthorized: false,
      cashoutAllowed: false,
      realMoney: false,
    };
  });
}

module.exports = {
  SETTINGS_VERSION,
  SESSION_WRITE_INTERVAL_MS,
  normalizedBiometrics,
  normalizedVitals,
  normalizedLifestyle,
  normalizedPrivacy,
  registerBeta1UserPreferences,
};
