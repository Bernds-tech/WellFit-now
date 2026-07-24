const { FieldValue } = require("firebase-admin/firestore");
const {
  requireAuth,
  requiredString,
} = require("./beta1Runtime");
const { CONSENT_VERSION } = require("./beta1UserOnboarding");
const { timestampToDate } = require("./beta1UserCalendar");
const {
  SETTINGS_VERSION,
  SESSION_WRITE_INTERVAL_MS,
  SESSION_SOURCES,
  strictEnum,
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
} = require("./beta1UserPreferencePolicy");
const { buildUserSettingsState } = require("./beta1UserSettingsProjection");

const SETTINGS_SECTIONS = new Set([
  "notifications",
  "permissions",
  "activity",
  "buddy",
  "biometrics",
  "vitals",
  "lifestyle",
]);

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

function normalizeSection(section, value, HttpsError) {
  if (section === "notifications") return { storage: "users", value: normalizedNotifications(value) };
  if (section === "permissions") return { storage: "users", value: normalizedPermissions(value) };
  if (section === "activity") return { storage: "users", value: normalizedActivity(value, HttpsError) };
  if (section === "buddy") return { storage: "users", value: normalizedBuddy(value, HttpsError) };
  if (section === "biometrics") return { storage: "private", value: normalizedBiometrics(value, HttpsError) };
  if (section === "vitals") return { storage: "private", value: normalizedVitals(value, HttpsError) };
  if (section === "lifestyle") return { storage: "private", value: normalizedLifestyle(value, HttpsError) };
  throw new HttpsError("invalid-argument", "Unbekannter Settings-Bereich.");
}

async function updatePublicSettingsSection(context, section, value) {
  if (section === "notifications") {
    await context.userRef.update({
      "settings.reminders": value,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return;
  }
  if (section === "permissions") {
    await context.userRef.update({
      "settings.permissions": value,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return;
  }
  if (section === "activity") {
    await context.userRef.update({
      "profile.activity": value,
      updatedAt: FieldValue.serverTimestamp(),
    });
    return;
  }
  await context.userRef.update({
    "profile.aiBuddy.avatarType": value.avatarType,
    "profile.aiBuddy.personality": value.personality,
    "profile.aiBuddy.relationshipMode": value.relationshipMode,
    "profile.aiBuddy.behaviorDynamics": value.behaviorDynamics,
    "profile.aiBuddy.motivationStyle": value.motivationStyle,
    "profile.aiBuddy.reactsToStress": value.reactsToStress,
    "profile.aiBuddy.reactsToSleep": value.reactsToSleep,
    "profile.aiBuddy.reactsToActivity": value.reactsToActivity,
    "profile.aiBuddy.reactsToMood": value.reactsToMood,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

async function updatePrivateSettingsSection(context, userId, section, value) {
  const existingCategories = Array.isArray(context.privateProfile.healthDataCategories)
    ? context.privateProfile.healthDataCategories
    : [];
  const categories = [...new Set([...existingCategories, section])].slice(0, 20);
  const common = {
    healthPersonalizationEnabled: true,
    healthProfileStored: true,
    healthDataCategories: categories,
    rawBirthDateStored: false,
    medicationDetailsStored: false,
    freeTextHealthNotesStored: false,
    consentVersion: CONSENT_VERSION,
    serverValidationStatus: "server-private-settings",
    updatedAt: FieldValue.serverTimestamp(),
  };
  if (context.privateProfileExists) {
    await context.privateProfileRef.update({
      [`healthSettings.${section}`]: value,
      ...common,
    });
  } else {
    await context.privateProfileRef.set({
      privateProfileId: context.privateProfileRef.id,
      ownerUserId: userId,
      userId,
      healthSettings: { [section]: value },
      createdAt: FieldValue.serverTimestamp(),
      ...common,
    });
  }
  await context.userRef.update({
    "profile.healthPersonalizationEnabled": true,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

function hasPrivateHealthData(privateProfile) {
  return privateProfile.healthProfileStored === true
    || Object.keys(privateProfile.healthProfile || {}).length > 0
    || Object.keys(privateProfile.healthSettings || {}).length > 0
    || Object.keys(privateProfile.lifestyleSettings || {}).length > 0;
}

function registerBeta1UserPreferences(exportsTarget, { db, onCall, HttpsError }) {
  exportsTarget.getUserSettingsState = onCall(async (request) => {
    const userId = requireAuth(request, HttpsError);
    const context = await requireInitializedContext(db, userId, HttpsError);
    return {
      accepted: true,
      requiresInitialization: false,
      settingsVersion: SETTINGS_VERSION,
      state: buildUserSettingsState({
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
    const source = strictEnum(
      (request.data || {}).source,
      SESSION_SOURCES,
      "source",
      HttpsError,
      "dashboard",
    );
    const userRef = db.collection("users").doc(userId);
    const snapshot = await userRef.get();
    if (!snapshot.exists) {
      return {
        accepted: true,
        recorded: false,
        idempotent: true,
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
    if (!SETTINGS_SECTIONS.has(section)) {
      throw new HttpsError("invalid-argument", "Unbekannter Settings-Bereich.");
    }
    const context = await requireInitializedContext(db, userId, HttpsError);
    const normalized = normalizeSection(section, data.value, HttpsError);
    if (normalized.storage === "private" && !healthConsentEnabled(context.onboarding)) {
      throw new HttpsError(
        "failed-precondition",
        "Health-Personalisierung muss zuerst freiwillig aktiviert werden.",
      );
    }

    if (normalized.storage === "private") {
      await updatePrivateSettingsSection(context, userId, section, normalized.value);
    } else {
      await updatePublicSettingsSection(context, section, normalized.value);
    }

    const auditEventId = await writeUserAudit(db, {
      userId,
      actionType: `user-settings-${section}-updated`,
      targetType: normalized.storage === "private" ? "userPrivateProfile" : "user",
      targetId: userId,
      metadata: {
        settingsVersion: SETTINGS_VERSION,
        section,
        storage: normalized.storage,
        fieldNames: Object.keys(normalized.value),
        rawBirthDateStored: false,
        medicationDetailsStored: false,
        freeTextHealthNotesStored: false,
        economyFieldsChanged: false,
      },
    });

    return {
      accepted: true,
      section,
      value: normalized.value,
      storage: normalized.storage,
      auditEventId,
      serverValidationStatus: "server-settings-updated",
      rawBirthDateStored: false,
      medicationDetailsStored: false,
      freeTextHealthNotesStored: false,
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
    const healthPersonalization = !["Nicht verwenden", "Nicht aktiviert"].includes(privacy.healthDataUsage);
    const healthImprovement = privacy.healthDataUsage === "Personalisierung & anonyme Verbesserung";
    const nextConsents = {
      healthPersonalization,
      healthImprovement,
      anonymousAnalytics: privacy.anonymousAnalytics,
    };
    const changedConsentTypes = Object.entries(nextConsents)
      .filter(([consentType, accepted]) => (currentSummary[consentType] === true) !== accepted)
      .map(([consentType, accepted]) => ({
        consentType,
        accepted,
        previousAccepted: currentSummary[consentType] === true,
      }));
    const consentRefs = changedConsentTypes.map(() => db.collection("userConsentEvents").doc());
    const nowIso = new Date().toISOString();
    const healthDataDeleted = !healthPersonalization && hasPrivateHealthData(context.privateProfile);

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

      const commonPrivateUpdate = {
        healthPersonalizationEnabled: healthPersonalization,
        healthImprovementEnabled: healthImprovement,
        consentVersion: CONSENT_VERSION,
        rawBirthDateStored: false,
        medicationDetailsStored: false,
        freeTextHealthNotesStored: false,
        serverValidationStatus: "server-private-settings",
        updatedAt: FieldValue.serverTimestamp(),
      };
      if (context.privateProfileExists) {
        transaction.update(context.privateProfileRef, healthPersonalization
          ? commonPrivateUpdate
          : {
              ...commonPrivateUpdate,
              healthProfileStored: false,
              healthDataCategories: [],
              healthProfile: FieldValue.delete(),
              healthSettings: FieldValue.delete(),
              lifestyleSettings: FieldValue.delete(),
            });
      } else {
        transaction.set(context.privateProfileRef, {
          privateProfileId: context.privateProfileRef.id,
          ownerUserId: userId,
          userId,
          healthProfileStored: false,
          healthDataCategories: [],
          createdAt: FieldValue.serverTimestamp(),
          ...commonPrivateUpdate,
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
  registerBeta1UserPreferences,
};
