import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";
import type {
  ActivityForm,
  AiBuddyForm,
  BiometricsForm,
  LifestyleForm,
  NotificationsForm,
  PrivacyForm,
  ProfileForm,
  VitalValuesForm,
} from "@/app/einstellungen/types";
import type { PermissionKey } from "@/app/einstellungen/types";

export type UserSettingsSection =
  | "notifications"
  | "permissions"
  | "activity"
  | "buddy"
  | "biometrics"
  | "vitals"
  | "lifestyle";

export type UserSessionSource = "login" | "dashboard" | "settings";
export type PermissionState = Record<PermissionKey, boolean>;

export type UserSettingsState = {
  profile: ProfileForm;
  notifications: NotificationsForm;
  permissions: PermissionState;
  activity: ActivityForm;
  aiBuddy: AiBuddyForm;
  privacy: PrivacyForm;
  biometrics: BiometricsForm | null;
  vitalValues: VitalValuesForm | null;
  lifestyle: LifestyleForm | null;
  healthConsentActive: boolean;
  healthImprovementConsentActive: boolean;
  healthProfileStored: boolean;
  healthDataCategories: string[];
};

type SafeServerFlags = {
  accepted?: unknown;
  tokenAuthorized?: unknown;
  cashoutAllowed?: unknown;
  realMoney?: unknown;
  economyFieldsChanged?: unknown;
};

type RawSettingsStateResponse = SafeServerFlags & {
  requiresInitialization?: unknown;
  settingsVersion?: unknown;
  state?: unknown;
  serverValidationStatus?: unknown;
  rawBirthDateStored?: unknown;
  medicationDetailsStored?: unknown;
  freeTextHealthNotesStored?: unknown;
};

type RawSectionResponse = SafeServerFlags & {
  section?: unknown;
  value?: unknown;
  storage?: unknown;
  auditEventId?: unknown;
  serverValidationStatus?: unknown;
};

type RawPrivacyResponse = SafeServerFlags & {
  privacy?: unknown;
  consentSummary?: unknown;
  changedConsentTypes?: unknown;
  healthDataDeleted?: unknown;
  auditEventId?: unknown;
  serverValidationStatus?: unknown;
};

type RawSessionResponse = {
  accepted?: unknown;
  recorded?: unknown;
  idempotent?: unknown;
  requiresInitialization?: unknown;
  serverValidationStatus?: unknown;
};

function requireCurrentUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("Für diese Einstellung ist eine aktive Anmeldung erforderlich.");
  return user;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function stringValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function booleanValue(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, 20)
    : [];
}

function textList(value: unknown): string {
  return stringList(value).join(", ");
}

function assertSafeFlags(value: SafeServerFlags, label: string) {
  if (
    value.accepted !== true
    || value.tokenAuthorized !== false
    || value.cashoutAllowed !== false
    || value.realMoney !== false
    || (value.economyFieldsChanged !== undefined && value.economyFieldsChanged !== false)
  ) {
    throw new Error(`Der Server hat keine sichere ${label}-Bestätigung geliefert.`);
  }
}

function parseProfile(value: unknown): ProfileForm {
  const source = asRecord(value);
  return {
    displayName: stringValue(source.displayName),
    email: stringValue(source.email),
    phone: stringValue(source.phone),
    language: stringValue(source.language, "Deutsch"),
    timezone: stringValue(source.timezone, "UTC"),
    units: stringValue(source.units, "kg / km"),
  };
}

function parseNotifications(value: unknown): NotificationsForm {
  const source = asRecord(value);
  return {
    missionReminder: booleanValue(source.missionReminder),
    sleepReminder: booleanValue(source.sleepReminder),
    weeklyReport: booleanValue(source.weeklyReport),
    glitchAlert: booleanValue(source.glitchAlert),
  };
}

function parsePermissions(value: unknown): PermissionState {
  const source = asRecord(value);
  return {
    location: booleanValue(source.location),
    locationTracking: booleanValue(source.locationTracking),
    camera: booleanValue(source.camera),
    microphone: booleanValue(source.microphone),
    backgroundTracking: booleanValue(source.backgroundTracking),
  };
}

function parseActivity(value: unknown): ActivityForm {
  const source = asRecord(value);
  return {
    activityLevel: stringValue(source.activityLevel, "Gelegentlich aktiv"),
    trainingTime: stringValue(source.trainingTime, "Abends"),
    communityMode: stringValue(source.communityMode, "Alleine"),
    interests: textList(source.interests),
    activities: textList(source.activities),
    goals: textList(source.goals),
    preferredMissionTypes: textList(source.preferredMissionTypes),
    socialPreference: stringValue(source.socialPreference, "Alleine"),
    competitionMode: stringValue(source.competitionMode, "Aus"),
  };
}

function parseBuddy(value: unknown): AiBuddyForm {
  const source = asRecord(value);
  return {
    avatarType: stringValue(source.avatarType, "Tierischer Begleiter"),
    personality: stringValue(source.personality, "Spielerisch & lustig"),
    relationshipMode: stringValue(source.relationshipMode, "Begleiter"),
    behaviorDynamics: stringValue(source.behaviorDynamics, "Adaptiv"),
    motivationStyle: stringValue(source.motivationStyle, "Ausgewogen"),
    reactsToStress: booleanValue(source.reactsToStress),
    reactsToSleep: booleanValue(source.reactsToSleep),
    reactsToActivity: booleanValue(source.reactsToActivity, true),
    reactsToMood: booleanValue(source.reactsToMood),
  };
}

function parsePrivacy(value: unknown): PrivacyForm {
  const source = asRecord(value);
  return {
    leaderboardVisible: booleanValue(source.leaderboardVisible),
    buddySharing: booleanValue(source.buddySharing),
    anonymousAnalytics: booleanValue(source.anonymousAnalytics),
    friendRequests: booleanValue(source.friendRequests),
    teamInvitations: booleanValue(source.teamInvitations),
    localUsersVisible: booleanValue(source.localUsersVisible),
    pvpAllowed: booleanValue(source.pvpAllowed),
    profileVisibility: stringValue(source.profileVisibility, "Privat"),
    healthDataUsage: stringValue(source.healthDataUsage, "Nicht verwenden"),
    locationSharing: stringValue(source.locationSharing, "Nie"),
  };
}

function parseBiometrics(value: unknown): BiometricsForm | null {
  if (value === null) return null;
  const source = asRecord(value);
  if (Object.keys(source).length === 0) return null;
  return {
    height: stringValue(source.height),
    weight: stringValue(source.weight),
    targetWeightEnabled: booleanValue(source.targetWeightEnabled),
    targetWeight: stringValue(source.targetWeight),
    bodyType: stringValue(source.bodyType, "Schlank"),
    fitnessLevel: stringValue(source.fitnessLevel, "Anfänger"),
    limitations: stringValue(source.limitations),
  };
}

function parseVitals(value: unknown): VitalValuesForm | null {
  if (value === null) return null;
  const source = asRecord(value);
  if (Object.keys(source).length === 0) return null;
  return {
    bodyFat: stringValue(source.bodyFat),
    restingPulse: stringValue(source.restingPulse),
    averagePulse: stringValue(source.averagePulse),
    bloodPressure: stringValue(source.bloodPressure),
    sleepHours: stringValue(source.sleepHours),
    sleepQuality: stringValue(source.sleepQuality, "Mittel"),
    stressLevel: stringValue(source.stressLevel, "Mittel"),
    energyLevel: stringValue(source.energyLevel, "Mittel"),
    painLevel: stringValue(source.painLevel, "Keine"),
    medicationDeclared: booleanValue(source.medicationDeclared),
  };
}

function parseLifestyle(value: unknown): LifestyleForm | null {
  if (value === null) return null;
  const source = asRecord(value);
  if (Object.keys(source).length === 0) return null;
  return {
    nutrition: stringValue(source.nutrition, "Ausgewogen"),
    mealRhythm: stringValue(source.mealRhythm, "Regelmäßig"),
    drinkReminder: stringValue(source.drinkReminder, "Normal"),
    drinkAmount: stringValue(source.drinkAmount),
    caffeineIntake: stringValue(source.caffeineIntake, "Mittel"),
    alcoholFrequency: stringValue(source.alcoholFrequency, "Selten"),
    sleepRoutine: stringValue(source.sleepRoutine, "Unregelmäßig"),
    natureMove: stringValue(source.natureMove, "Gelegentlich"),
    stressCoping: stringValue(source.stressCoping, "Spaziergang / Bewegung"),
    screenTime: stringValue(source.screenTime, "Mittel"),
  };
}

function parseSettingsState(value: unknown): UserSettingsState {
  const source = asRecord(value);
  return {
    profile: parseProfile(source.profile),
    notifications: parseNotifications(source.notifications),
    permissions: parsePermissions(source.permissions),
    activity: parseActivity(source.activity),
    aiBuddy: parseBuddy(source.aiBuddy),
    privacy: parsePrivacy(source.privacy),
    biometrics: parseBiometrics(source.biometrics),
    vitalValues: parseVitals(source.vitalValues),
    lifestyle: parseLifestyle(source.lifestyle),
    healthConsentActive: booleanValue(source.healthConsentActive),
    healthImprovementConsentActive: booleanValue(source.healthImprovementConsentActive),
    healthProfileStored: booleanValue(source.healthProfileStored),
    healthDataCategories: stringList(source.healthDataCategories),
  };
}

function settingsErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${message}`.toLowerCase();
  if (diagnostic.includes("unauthenticated")) return "Deine Anmeldung ist abgelaufen.";
  if (diagnostic.includes("konto-initialisierung") || diagnostic.includes("initialisierung")) return "Bitte schließe zuerst die sichere Registrierung ab.";
  if (diagnostic.includes("health-personalisierung")) return "Aktiviere Health-Personalisierung zuerst freiwillig im Bereich Privatsphäre.";
  if (diagnostic.includes("medikament") || diagnostic.includes("gesundheitsnotizen")) return "Medikamentennamen und freie Gesundheitsnotizen werden aus Datenschutzgründen nicht gespeichert.";
  if (diagnostic.includes("freif") || diagnostic.includes("notizen")) return "Freie sensible Notizen werden in der Beta nicht gespeichert.";
  return message || "Die Einstellung konnte nicht serverseitig verarbeitet werden.";
}

export async function getUserSettingsState(): Promise<UserSettingsState> {
  const user = requireCurrentUser();
  await user.getIdToken(true);
  try {
    const callable = httpsCallable<Record<string, never>, RawSettingsStateResponse>(
      getFunctions(),
      "getUserSettingsState",
    );
    const response = await callable({});
    assertSafeFlags(response.data, "Settings-Projektion");
    if (
      response.data.requiresInitialization !== false
      || response.data.serverValidationStatus !== "server-settings-projection"
      || response.data.rawBirthDateStored !== false
      || response.data.medicationDetailsStored !== false
      || response.data.freeTextHealthNotesStored !== false
    ) {
      throw new Error("Der Server hat keine datensparsame Settings-Projektion geliefert.");
    }
    return parseSettingsState(response.data.state);
  } catch (error) {
    throw new Error(settingsErrorMessage(error), { cause: error });
  }
}

export async function updateUserSettingsSection<T>(
  section: UserSettingsSection,
  value: T,
): Promise<{ section: UserSettingsSection; value: unknown; storage: "users" | "private" }> {
  const user = requireCurrentUser();
  await user.getIdToken(true);
  try {
    const callable = httpsCallable<
      { section: UserSettingsSection; value: T },
      RawSectionResponse
    >(getFunctions(), "updateUserSettingsSection");
    const response = await callable({ section, value });
    assertSafeFlags(response.data, "Settings-Aktualisierung");
    if (
      response.data.section !== section
      || (response.data.storage !== "users" && response.data.storage !== "private")
      || response.data.serverValidationStatus !== "server-settings-updated"
    ) {
      throw new Error("Der Server hat die Settings-Aktualisierung nicht bestätigt.");
    }
    return {
      section,
      value: response.data.value,
      storage: response.data.storage,
    };
  } catch (error) {
    throw new Error(settingsErrorMessage(error), { cause: error });
  }
}

export async function updateUserPrivacyConsents(
  privacy: PrivacyForm,
): Promise<{
  privacy: PrivacyForm;
  healthConsentActive: boolean;
  healthImprovementConsentActive: boolean;
  healthDataDeleted: boolean;
}> {
  const user = requireCurrentUser();
  await user.getIdToken(true);
  try {
    const callable = httpsCallable<{ privacy: PrivacyForm }, RawPrivacyResponse>(
      getFunctions(),
      "updateUserPrivacyConsents",
    );
    const response = await callable({ privacy });
    assertSafeFlags(response.data, "Consent-Aktualisierung");
    if (response.data.serverValidationStatus !== "server-privacy-consents-updated") {
      throw new Error("Der Server hat die Consent-Aktualisierung nicht bestätigt.");
    }
    const consentSummary = asRecord(response.data.consentSummary);
    return {
      privacy: parsePrivacy(response.data.privacy),
      healthConsentActive: consentSummary.healthPersonalization === true,
      healthImprovementConsentActive: consentSummary.healthImprovement === true,
      healthDataDeleted: response.data.healthDataDeleted === true,
    };
  } catch (error) {
    throw new Error(settingsErrorMessage(error), { cause: error });
  }
}

export async function recordUserSessionActivity(
  source: UserSessionSource,
): Promise<{ recorded: boolean; idempotent: boolean; requiresInitialization: boolean }> {
  const user = requireCurrentUser();
  await user.getIdToken(true);
  try {
    const callable = httpsCallable<{ source: UserSessionSource }, RawSessionResponse>(
      getFunctions(),
      "recordUserSessionActivity",
    );
    const response = await callable({ source });
    if (response.data.accepted !== true || typeof response.data.serverValidationStatus !== "string") {
      throw new Error("Der Server hat die Session-Aktivität nicht bestätigt.");
    }
    return {
      recorded: response.data.recorded === true,
      idempotent: response.data.idempotent === true,
      requiresInitialization: response.data.requiresInitialization === true,
    };
  } catch (error) {
    throw new Error(settingsErrorMessage(error), { cause: error });
  }
}
