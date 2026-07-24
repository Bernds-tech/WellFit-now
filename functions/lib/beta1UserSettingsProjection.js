const { optionalString } = require("./beta1Runtime");
const {
  asObject,
  currentConsentSummary,
} = require("./beta1UserPreferencePolicy");

function asString(value, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function safeList(value, maxItems = 20, maxLength = 80) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim().slice(0, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

function mappedValue(value, mapping, fallback) {
  const normalized = asString(value);
  return mapping[normalized] || normalized || fallback;
}

function activityLevelLabel(value) {
  return mappedValue(value, {
    low: "Kaum aktiv",
    medium: "Gelegentlich aktiv",
    high: "Sehr aktiv",
  }, "Gelegentlich aktiv");
}

function trainingTimeLabel(value) {
  return mappedValue(value, {
    morning: "Morgens",
    afternoon: "Nachmittags",
    evening: "Abends",
    flexible: "Flexibel",
  }, "Abends");
}

function communityModeLabel(value) {
  return mappedValue(value, {
    solo: "Alleine",
    private: "Freunde & kleine Gruppen",
    public: "Community & Events",
  }, "Alleine");
}

function fitnessLevelLabel(value) {
  return mappedValue(value, {
    beginner: "Anfänger",
    medium: "Fortgeschritten",
    pro: "Aktiv",
  }, "Anfänger");
}

function sleepQualityLabel(value) {
  return mappedValue(value, {
    poor: "Niedrig",
    okay: "Mittel",
    good: "Hoch",
  }, "Mittel");
}

function nutritionLabel(value) {
  return mappedValue(value, {
    all: "Ausgewogen",
    vegetarian: "Vegetarisch",
    vegan: "Vegan",
    light: "Ausgewogen",
  }, "Ausgewogen");
}

function stressLevelLabel(value) {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    if (numeric <= 2) return "Niedrig";
    if (numeric >= 4) return "Hoch";
    return "Mittel";
  }
  return asString(value, "Mittel");
}

function legacySleepHours(value) {
  const normalized = asString(value);
  if (normalized === "<6") return "5.5";
  if (normalized === "6-8") return "7";
  if (normalized === ">8") return "8.5";
  return normalized;
}

function buildProfileState({ user, settings, calendar, authEmail }) {
  const displayName = optionalString(settings.displayName, 160)
    || optionalString(user.displayName, 160)
    || `${optionalString(user.firstName, 80) || ""} ${optionalString(user.lastName, 80) || ""}`.trim();
  return {
    displayName,
    email: optionalString(authEmail, 320) || optionalString(user.email, 320) || "",
    phone: optionalString(settings.phone, 40) || "",
    language: optionalString(settings.language, 40) || "Deutsch",
    timezone: optionalString(calendar.timeZone, 120) || optionalString(settings.timeZone, 120) || "UTC",
    units: optionalString(settings.units, 40) || "kg / km",
  };
}

function buildPublicSettingsState({ user, onboarding, calendar, authEmail }) {
  const profile = asObject(user.profile);
  const settings = asObject(user.settings);
  const reminders = asObject(settings.reminders);
  const privacy = asObject(settings.privacy);
  const permissions = asObject(settings.permissions);
  const activity = asObject(profile.activity);
  const aiBuddy = asObject(profile.aiBuddy);
  const consentSummary = currentConsentSummary(onboarding);
  const healthConsentActive = consentSummary.healthPersonalization === true;
  const healthImprovementConsentActive = consentSummary.healthImprovement === true;

  return {
    profile: buildProfileState({ user, settings, calendar, authEmail }),
    notifications: {
      missionReminder: asBoolean(reminders.missionReminder),
      sleepReminder: asBoolean(reminders.sleepReminder),
      weeklyReport: asBoolean(reminders.weeklyReport),
      glitchAlert: asBoolean(reminders.glitchAlert),
    },
    permissions: {
      location: asBoolean(permissions.location),
      locationTracking: asBoolean(permissions.locationTracking),
      camera: asBoolean(permissions.camera),
      microphone: asBoolean(permissions.microphone),
      backgroundTracking: asBoolean(permissions.backgroundTracking),
    },
    activity: {
      activityLevel: activityLevelLabel(activity.activityLevel),
      trainingTime: trainingTimeLabel(activity.trainingTime),
      communityMode: communityModeLabel(activity.communityMode),
      interests: safeList(activity.interests),
      activities: safeList(activity.activities),
      goals: safeList(activity.goals),
      preferredMissionTypes: safeList(activity.preferredMissionTypes),
      socialPreference: asString(activity.socialPreference, "Alleine"),
      competitionMode: asString(activity.competitionMode, "Aus"),
      notes: "",
    },
    aiBuddy: {
      avatarType: asString(aiBuddy.avatarType, "Tierischer Begleiter"),
      personality: asString(aiBuddy.personality, "Spielerisch & lustig"),
      relationshipMode: asString(aiBuddy.relationshipMode, "Begleiter"),
      behaviorDynamics: asString(aiBuddy.behaviorDynamics, "Adaptiv"),
      motivationStyle: asString(aiBuddy.motivationStyle, "Ausgewogen"),
      reactsToStress: asBoolean(aiBuddy.reactsToStress),
      reactsToSleep: asBoolean(aiBuddy.reactsToSleep),
      reactsToActivity: aiBuddy.reactsToActivity !== false,
      reactsToMood: asBoolean(aiBuddy.reactsToMood),
    },
    privacy: {
      leaderboardVisible: asBoolean(privacy.leaderboardVisible),
      buddySharing: asBoolean(privacy.buddySharing),
      anonymousAnalytics: consentSummary.anonymousAnalytics === true,
      friendRequests: asBoolean(privacy.friendRequests),
      teamInvitations: asBoolean(privacy.teamInvitations),
      localUsersVisible: asBoolean(privacy.localUsersVisible),
      pvpAllowed: asBoolean(privacy.pvpAllowed),
      profileVisibility: asString(privacy.profileVisibility, "Privat"),
      healthDataUsage: !healthConsentActive
        ? "Nicht verwenden"
        : healthImprovementConsentActive
          ? "Personalisierung & anonyme Verbesserung"
          : "Nur Personalisierung",
      locationSharing: asString(privacy.locationSharing, "Nie"),
    },
    healthConsentActive,
    healthImprovementConsentActive,
  };
}

function buildPrivateHealthState(privateProfile, healthConsentActive) {
  if (!healthConsentActive) {
    return {
      biometrics: null,
      vitalValues: null,
      lifestyle: null,
      healthProfileStored: false,
      healthDataCategories: [],
    };
  }

  const healthSettings = asObject(privateProfile.healthSettings);
  const biometrics = asObject(healthSettings.biometrics);
  const vitals = asObject(healthSettings.vitals);
  const lifestyle = Object.keys(asObject(healthSettings.lifestyle)).length > 0
    ? asObject(healthSettings.lifestyle)
    : asObject(privateProfile.lifestyleSettings);
  const legacyHealth = asObject(privateProfile.healthProfile);
  const bloodPressure = asObject(vitals.bloodPressure);

  return {
    biometrics: {
      height: String(biometrics.heightCm ?? legacyHealth.heightCm ?? ""),
      weight: String(biometrics.weightKg ?? legacyHealth.weightKg ?? ""),
      targetWeightEnabled: biometrics.targetWeightEnabled === true,
      targetWeight: String(biometrics.targetWeightKg ?? ""),
      bodyType: asString(biometrics.bodyType, "Schlank"),
      fitnessLevel: fitnessLevelLabel(biometrics.fitnessLevel ?? legacyHealth.fitnessLevel),
      limitations: safeList(
        Array.isArray(biometrics.limitations) ? biometrics.limitations : legacyHealth.limitations,
        10,
      ).join(", "),
    },
    vitalValues: {
      bodyFat: String(vitals.bodyFatPercent ?? ""),
      restingPulse: String(vitals.restingPulseBpm ?? ""),
      averagePulse: String(vitals.averagePulseBpm ?? ""),
      bloodPressure: bloodPressure.systolic && bloodPressure.diastolic
        ? `${bloodPressure.systolic}/${bloodPressure.diastolic}`
        : "",
      sleepHours: String(vitals.sleepHours ?? legacySleepHours(legacyHealth.sleepHours)),
      sleepQuality: sleepQualityLabel(vitals.sleepQuality ?? legacyHealth.sleepQuality),
      stressLevel: stressLevelLabel(vitals.stressLevel ?? legacyHealth.stressLevel),
      energyLevel: asString(vitals.energyLevel, "Mittel"),
      painLevel: asString(vitals.painLevel, "Keine"),
      medicationDeclared: vitals.medicationDeclared === true || legacyHealth.medicationDeclared === true,
    },
    lifestyle: {
      nutrition: nutritionLabel(lifestyle.nutrition ?? legacyHealth.nutrition),
      mealRhythm: asString(lifestyle.mealRhythm, "Regelmäßig"),
      drinkReminder: asString(lifestyle.drinkReminder, "Normal"),
      drinkAmount: String(lifestyle.drinkAmountLiters ?? ""),
      caffeineIntake: asString(lifestyle.caffeineIntake, "Mittel"),
      alcoholFrequency: asString(lifestyle.alcoholFrequency, "Selten"),
      sleepRoutine: asString(lifestyle.sleepRoutine, "Unregelmäßig"),
      natureMove: asString(lifestyle.natureMove, "Gelegentlich"),
      stressCoping: asString(lifestyle.stressCoping, "Spaziergang / Bewegung"),
      screenTime: asString(lifestyle.screenTime, "Mittel"),
    },
    healthProfileStored: privateProfile.healthProfileStored === true,
    healthDataCategories: safeList(privateProfile.healthDataCategories, 20, 80),
  };
}

function buildUserSettingsState({ user, onboarding, privateProfile, calendar, authEmail }) {
  const publicState = buildPublicSettingsState({ user, onboarding, calendar, authEmail });
  return {
    ...publicState,
    ...buildPrivateHealthState(privateProfile, publicState.healthConsentActive),
  };
}

module.exports = {
  buildUserSettingsState,
};
