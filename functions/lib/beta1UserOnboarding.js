const { FieldValue } = require("firebase-admin/firestore");
const {
  requireAuth,
  requiredString,
  optionalString,
} = require("./beta1Runtime");
const {
  DEFAULT_TIME_ZONE,
  TIME_ZONE_CHANGE_COOLDOWN_HOURS,
  normalizeTimeZone,
} = require("./beta1UserCalendar");

const ONBOARDING_VERSION = "2026-07-24-v1";
const CONSENT_VERSION = "2026-07-24-v1";
const MINIMUM_SELF_REGISTRATION_AGE = 14;
const MAXIMUM_AGE = 110;

const ALLOWED_LANGUAGES = new Set(["de", "en"]);
const ALLOWED_BUDDIES = new Map([
  ["flammi", { id: "flammi", name: "Flammi", file: "flammi.png" }],
  ["luma", { id: "luma", name: "Luma", file: "luma.png" }],
  ["turt", { id: "turt", name: "Turt", file: "turt.png" }],
  ["king", { id: "king", name: "King", file: "king.png" }],
  ["ghost", { id: "ghost", name: "Ghost", file: "gohst.png" }],
]);
const ALLOWED_ACTIVITY_LEVELS = new Set(["low", "medium", "high"]);
const ALLOWED_TRAINING_TIMES = new Set(["morning", "afternoon", "evening", "flexible"]);
const ALLOWED_COMMUNITY_MODES = new Set(["solo", "private", "public"]);
const ALLOWED_FITNESS_LEVELS = new Set(["beginner", "medium", "pro"]);
const ALLOWED_SLEEP_HOURS = new Set(["<6", "6-8", ">8"]);
const ALLOWED_SLEEP_QUALITY = new Set(["poor", "okay", "good"]);
const ALLOWED_NUTRITION = new Set(["all", "vegetarian", "vegan", "light"]);
const LEGACY_ECONOMY_KEYS = [
  "points",
  "xp",
  "level",
  "energy",
  "stepsToday",
  "avatar",
  "lastMissionCompletedAt",
  "deviceLocation",
];

function safeDocIdPart(value) {
  return encodeURIComponent(String(value || "none")).replace(/\./g, "%2E");
}

function enumValue(value, allowed, fallback) {
  const normalized = optionalString(value, 80);
  return normalized && allowed.has(normalized) ? normalized : fallback;
}

function uniqueStringList(value, maxItems = 20, maxLength = 80) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value
    .map((item) => optionalString(item, maxLength))
    .filter(Boolean))]
    .slice(0, maxItems);
}

function finiteNumber(value, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < min || number > max) return null;
  return Number(number.toFixed(2));
}

function parseBirthDate(value, HttpsError) {
  const raw = requiredString(value, "birthDate", HttpsError, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    throw new HttpsError("invalid-argument", "birthDate muss im Format YYYY-MM-DD vorliegen.");
  }
  const [year, month, day] = raw.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(date.getTime())
    || date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) {
    throw new HttpsError("invalid-argument", "birthDate ist ungueltig.");
  }
  return date;
}

function ageAtDate(birthDate, now = new Date()) {
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDifference = now.getUTCMonth() - birthDate.getUTCMonth();
  if (monthDifference < 0 || (monthDifference === 0 && now.getUTCDate() < birthDate.getUTCDate())) age -= 1;
  return age;
}

function ageBand(age) {
  if (age < 18) return "14-17";
  if (age < 25) return "18-24";
  if (age < 35) return "25-34";
  if (age < 45) return "35-44";
  if (age < 55) return "45-54";
  if (age < 65) return "55-64";
  return "65+";
}

function normalizedBuddy(value) {
  const requestedId = optionalString(value && value.id, 80) || "flammi";
  return ALLOWED_BUDDIES.get(requestedId) || ALLOWED_BUDDIES.get("flammi");
}

function normalizedPreferences(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    activityLevel: enumValue(source.activityLevel, ALLOWED_ACTIVITY_LEVELS, "low"),
    trainingTime: enumValue(source.trainingTime, ALLOWED_TRAINING_TIMES, "flexible"),
    communityMode: enumValue(source.communityMode, ALLOWED_COMMUNITY_MODES, "solo"),
    interests: uniqueStringList(source.interests),
    goals: uniqueStringList(source.goals),
    activities: uniqueStringList(source.activities),
  };
}

function hasSubmittedHealthProfile(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length > 0);
}

function normalizedHealthProfile(value, enabled, HttpsError) {
  if (!enabled) {
    if (hasSubmittedHealthProfile(value)) {
      throw new HttpsError(
        "failed-precondition",
        "Gesundheitsnahe Profildaten duerfen nur mit separater Health-Personalisierungszustimmung uebermittelt werden.",
      );
    }
    return {};
  }
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const heightCm = finiteNumber(source.heightCm, 100, 250);
  const weightKg = finiteNumber(source.weightKg, 25, 400);
  const stressLevel = finiteNumber(source.stressLevel, 1, 5);
  const result = {
    fitnessLevel: enumValue(source.fitnessLevel, ALLOWED_FITNESS_LEVELS, "beginner"),
    sleepHours: enumValue(source.sleepHours, ALLOWED_SLEEP_HOURS, null),
    sleepQuality: enumValue(source.sleepQuality, ALLOWED_SLEEP_QUALITY, null),
    nutrition: enumValue(source.nutrition, ALLOWED_NUTRITION, null),
    limitations: uniqueStringList(source.limitations, 10, 80),
    medicationDeclared: source.medicationDeclared === true,
  };
  if (heightCm !== null) result.heightCm = heightCm;
  if (weightKg !== null) result.weightKg = weightKg;
  if (stressLevel !== null) result.stressLevel = Math.round(stressLevel);
  return Object.fromEntries(Object.entries(result).filter(([, entry]) => entry !== null));
}

function buddyAvatarId(userId) {
  return `${safeDocIdPart(userId)}_self_default`;
}

function consentEventId(userId, consentType) {
  return `onboarding_${safeDocIdPart(userId)}_${safeDocIdPart(consentType)}_${safeDocIdPart(CONSENT_VERSION)}`;
}

function consentEvent({ userId, consentType, accepted, nowIso }) {
  return {
    consentEventId: consentEventId(userId, consentType),
    ownerUserId: userId,
    userId,
    consentType,
    version: CONSENT_VERSION,
    status: accepted ? "active" : "declined",
    grantedAt: accepted ? nowIso : null,
    declinedAt: accepted ? null : nowIso,
    revokedAt: null,
    source: "web-onboarding",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };
}

function publicOnboardingState(onboarding, privateProfile, consentSummary) {
  return {
    onboardingCompleted: onboarding.status === "completed",
    onboardingVersion: onboarding.onboardingVersion || ONBOARDING_VERSION,
    ageBand: onboarding.ageBand || null,
    timeZone: onboarding.timeZone || DEFAULT_TIME_ZONE,
    language: onboarding.language || "de",
    buddy: onboarding.buddy || ALLOWED_BUDDIES.get("flammi"),
    emailVerified: onboarding.emailVerified === true,
    requiresEmailVerification: onboarding.emailVerified !== true,
    healthPersonalizationEnabled: privateProfile.healthPersonalizationEnabled === true,
    healthProfileStored: privateProfile.healthProfileStored === true,
    healthDataCategories: Array.isArray(privateProfile.healthDataCategories)
      ? privateProfile.healthDataCategories.slice(0, 20)
      : [],
    rawBirthDateStored: false,
    legacyEconomyFieldsDetected: onboarding.legacyEconomyFieldsDetected === true,
    consentSummary,
    serverValidationStatus: "server-initialized",
    tokenAuthorized: false,
    cashoutAllowed: false,
    realMoney: false,
  };
}

function registerBeta1UserOnboarding(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.initializeUserAccount = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const data = request.data || {};
    const firstName = requiredString(data.firstName, "firstName", HttpsError, 80);
    const lastName = requiredString(data.lastName, "lastName", HttpsError, 80);
    const displayName = optionalString(data.displayName, 160) || `${firstName} ${lastName}`;
    const tokenEmail = optionalString(request.auth.token && request.auth.token.email, 320);
    const submittedEmail = optionalString(data.email, 320);
    const email = tokenEmail || submittedEmail;
    if (!email) throw new HttpsError("failed-precondition", "Firebase-Auth-E-Mail fehlt.");
    if (tokenEmail && submittedEmail && tokenEmail.toLowerCase() !== submittedEmail.toLowerCase()) {
      throw new HttpsError("permission-denied", "E-Mail stimmt nicht mit dem authentifizierten Konto ueberein.");
    }

    const termsAccepted = data.consents && data.consents.termsAccepted === true;
    const privacyAccepted = data.consents && data.consents.privacyAccepted === true;
    if (!termsAccepted || !privacyAccepted) {
      throw new HttpsError("failed-precondition", "AGB und Datenschutz muessen separat bestaetigt werden.");
    }
    const healthPersonalizationEnabled = data.consents && data.consents.healthPersonalization === true;
    const anonymousAnalyticsEnabled = data.consents && data.consents.anonymousAnalytics === true;
    const marketingEnabled = data.consents && data.consents.marketing === true;

    const birthDate = parseBirthDate(data.birthDate, HttpsError);
    const age = ageAtDate(birthDate);
    if (age < MINIMUM_SELF_REGISTRATION_AGE) {
      throw new HttpsError(
        "failed-precondition",
        `Selbstregistrierung ist in dieser Beta erst ab ${MINIMUM_SELF_REGISTRATION_AGE} Jahren erlaubt.`,
      );
    }
    if (age > MAXIMUM_AGE) throw new HttpsError("invalid-argument", "Geburtsdatum liegt ausserhalb des erlaubten Bereichs.");
    const resolvedAgeBand = ageBand(age);

    const requestedTimeZone = optionalString(data.timeZone, 120);
    const timeZone = normalizeTimeZone(requestedTimeZone) || (requestedTimeZone ? null : DEFAULT_TIME_ZONE);
    if (!timeZone) throw new HttpsError("invalid-argument", "timeZone muss eine gueltige IANA-Zeitzone sein.");
    const language = enumValue(data.language, ALLOWED_LANGUAGES, "de");
    const buddy = normalizedBuddy(data.buddy);
    const preferences = normalizedPreferences(data.preferences);
    const healthProfile = normalizedHealthProfile(data.healthProfile, healthPersonalizationEnabled, HttpsError);
    const healthDataCategories = Object.keys(healthProfile);
    const nowIso = new Date().toISOString();
    const emailVerified = request.auth.token && request.auth.token.email_verified === true;

    const userRef = db.collection("users").doc(userId);
    const onboardingRef = db.collection("userOnboardingRecords").doc(userId);
    const privateProfileRef = db.collection("userPrivateProfiles").doc(userId);
    const calendarRef = db.collection("userCalendarSettings").doc(userId);
    const avatarRef = db.collection("userAvatars").doc(buddyAvatarId(userId));
    const auditRef = db.collection("auditEvents").doc(`onboarding_${safeDocIdPart(userId)}`);
    const consentTypes = [
      ["terms", true],
      ["privacy", true],
      ["healthPersonalization", healthPersonalizationEnabled],
      ["anonymousAnalytics", anonymousAnalyticsEnabled],
      ["marketing", marketingEnabled],
    ];
    const consentRefs = consentTypes.map(([consentType]) => db.collection("userConsentEvents").doc(consentEventId(userId, consentType)));

    const result = await db.runTransaction(async (transaction) => {
      const [onboardingSnapshot, userSnapshot, avatarSnapshot] = await Promise.all([
        transaction.get(onboardingRef),
        transaction.get(userRef),
        transaction.get(avatarRef),
      ]);
      if (onboardingSnapshot.exists && (onboardingSnapshot.data() || {}).status === "completed") {
        const onboarding = onboardingSnapshot.data() || {};
        const privateSnapshot = await transaction.get(privateProfileRef);
        const privateProfileData = privateSnapshot.exists ? privateSnapshot.data() || {} : {};
        const storedConsentSummary = onboarding.consentSummary || {};
        return {
          accepted: true,
          idempotent: true,
          ...publicOnboardingState(onboarding, privateProfileData, storedConsentSummary),
        };
      }

      const existingUser = userSnapshot.exists ? userSnapshot.data() || {} : {};
      const legacyEconomyFieldsDetected = LEGACY_ECONOMY_KEYS.some((key) => Object.prototype.hasOwnProperty.call(existingUser, key));
      const consentSummary = {
        termsAccepted: true,
        privacyAccepted: true,
        healthPersonalization: healthPersonalizationEnabled,
        anonymousAnalytics: anonymousAnalyticsEnabled,
        marketing: marketingEnabled,
        version: CONSENT_VERSION,
      };

      transaction.set(userRef, {
        userId,
        firstName,
        lastName,
        displayName,
        email: email.toLowerCase(),
        role: "user",
        profile: {
          ageBand: resolvedAgeBand,
          activity: preferences,
          aiBuddy: {
            selectedBuddy: buddy,
            avatarType: "Tierischer Begleiter",
            relationshipMode: "Begleiter",
          },
          healthPersonalizationEnabled,
        },
        settings: {
          displayName,
          email: email.toLowerCase(),
          language: language === "de" ? "Deutsch" : "English",
          timeZone,
          units: "kg / km",
          reminders: {
            missionReminder: false,
            sleepReminder: false,
            weeklyReport: false,
            glitchAlert: false,
          },
          privacy: {
            profileVisibility: "Privat",
            leaderboardVisible: false,
            buddySharing: false,
            friendRequests: false,
            teamInvitations: false,
            localUsersVisible: false,
            pvpAllowed: false,
            anonymousAnalytics: anonymousAnalyticsEnabled,
            healthDataUsage: healthPersonalizationEnabled ? "Nur Personalisierung" : "Nicht aktiviert",
            locationSharing: "Nie",
          },
          permissions: {
            location: false,
            camera: false,
            microphone: false,
            backgroundTracking: false,
          },
          consents: consentSummary,
        },
        onboardingCompleted: true,
        onboardingStep: 4,
        onboardingVersion: ONBOARDING_VERSION,
        onboardingAuthority: "server-initialized",
        registrationSource: optionalString(data.registrationSource, 80) || "web",
        legacyEconomyFieldsInitialized: false,
        serverValidationStatus: "server-initialized",
        updatedAt: FieldValue.serverTimestamp(),
        createdAt: existingUser.createdAt || FieldValue.serverTimestamp(),
      }, { merge: true });

      transaction.set(onboardingRef, {
        onboardingRecordId: onboardingRef.id,
        ownerUserId: userId,
        userId,
        status: "completed",
        onboardingVersion: ONBOARDING_VERSION,
        language,
        timeZone,
        ageBand: resolvedAgeBand,
        minimumAgePassed: true,
        rawBirthDateStored: false,
        buddy,
        emailVerified,
        consentSummary,
        legacyEconomyFieldsDetected,
        legacyEconomyFieldsInitialized: false,
        serverValidationStatus: "server-initialized",
        completedAt: nowIso,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      transaction.set(privateProfileRef, {
        privateProfileId: privateProfileRef.id,
        ownerUserId: userId,
        userId,
        ageBand: resolvedAgeBand,
        healthPersonalizationEnabled,
        healthProfileStored: healthPersonalizationEnabled && healthDataCategories.length > 0,
        healthDataCategories,
        healthProfile,
        rawBirthDateStored: false,
        medicationDetailsStored: false,
        freeTextHealthNotesStored: false,
        consentVersion: CONSENT_VERSION,
        serverValidationStatus: "server-private-profile",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      transaction.set(calendarRef, {
        ownerUserId: userId,
        userId,
        timeZone,
        previousTimeZone: null,
        timeZoneChangedAt: nowIso,
        calendarAuthority: "server-user-time-zone",
        timeZoneChangePolicy: "minimum-20-hours",
        changeCooldownHours: TIME_ZONE_CHANGE_COOLDOWN_HOURS,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }, { merge: true });

      if (!avatarSnapshot.exists) {
        transaction.set(avatarRef, {
          userAvatarId: avatarRef.id,
          ownerUserId: userId,
          userId,
          childProfileId: null,
          buddyId: buddy.id,
          buddyName: buddy.name,
          buddyFile: buddy.file,
          equippedItemIds: [],
          level: 1,
          xpTotal: 0,
          energy: 78,
          hunger: 70,
          mood: 68,
          cleanliness: 76,
          bond: 68,
          loyalty: 75,
          curiosity: 64,
          status: "active",
          dailyMode: "neugierig",
          serverValidationStatus: "server-projected",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      }

      consentTypes.forEach(([consentType, accepted], index) => {
        transaction.set(consentRefs[index], consentEvent({ userId, consentType, accepted, nowIso }));
      });

      transaction.set(auditRef, {
        auditEventId: auditRef.id,
        actorUserId: userId,
        actionType: "user-onboarding-completed",
        targetType: "userOnboardingRecord",
        targetId: onboardingRef.id,
        ownerUserId: userId,
        userId,
        childProfileId: null,
        reason: "server-initialized",
        metadata: {
          onboardingVersion: ONBOARDING_VERSION,
          consentVersion: CONSENT_VERSION,
          healthPersonalizationEnabled,
          healthDataCategories,
          rawBirthDateStored: false,
          legacyEconomyFieldsDetected,
        },
        source: "beta1-runtime",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        accepted: true,
        idempotent: false,
        ...publicOnboardingState({
          status: "completed",
          onboardingVersion: ONBOARDING_VERSION,
          ageBand: resolvedAgeBand,
          timeZone,
          language,
          buddy,
          emailVerified,
          legacyEconomyFieldsDetected,
        }, {
          healthPersonalizationEnabled,
          healthProfileStored: healthPersonalizationEnabled && healthDataCategories.length > 0,
          healthDataCategories,
        }, consentSummary),
      };
    });

    return result;
  });

  exportsTarget.getUserOnboardingState = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const [onboardingSnapshot, privateProfileSnapshot] = await Promise.all([
      db.collection("userOnboardingRecords").doc(userId).get(),
      db.collection("userPrivateProfiles").doc(userId).get(),
    ]);
    if (!onboardingSnapshot.exists) {
      return {
        accepted: true,
        onboardingCompleted: false,
        onboardingVersion: ONBOARDING_VERSION,
        requiresInitialization: true,
        tokenAuthorized: false,
        cashoutAllowed: false,
        realMoney: false,
      };
    }
    const onboarding = onboardingSnapshot.data() || {};
    const privateProfile = privateProfileSnapshot.exists ? privateProfileSnapshot.data() || {} : {};
    return {
      accepted: true,
      requiresInitialization: false,
      ...publicOnboardingState(onboarding, privateProfile, onboarding.consentSummary || {}),
    };
  });
}

module.exports = {
  ONBOARDING_VERSION,
  CONSENT_VERSION,
  MINIMUM_SELF_REGISTRATION_AGE,
  ageAtDate,
  ageBand,
  normalizedHealthProfile,
  registerBeta1UserOnboarding,
};
