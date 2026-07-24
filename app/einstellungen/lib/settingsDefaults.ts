import type {
  AiBuddyForm,
  BiometricsForm,
  NotificationsForm,
  ProfileForm,
  ActivityForm,
  LifestyleForm,
  PrivacyForm,
  PermissionKey,
  VitalValuesForm,
} from "../types";

export const sensitiveDataNotice =
  "Gesundheitsnahe Angaben sind freiwillig und werden nur nach separater Aktivierung der Health-Personalisierung im privaten Serverprofil gespeichert. Medikamentennamen und freie Gesundheitsnotizen werden nicht gespeichert. Die Angaben ersetzen keine medizinische Beratung.";

export const defaultPermissions: Record<PermissionKey, boolean> = {
  location: false,
  locationTracking: false,
  camera: false,
  microphone: false,
  backgroundTracking: false,
};

export const defaultProfile: ProfileForm = {
  displayName: "",
  email: "",
  phone: "",
  language: "Deutsch",
  timezone: "UTC",
  units: "kg / km",
};

export const defaultBiometrics: BiometricsForm = {
  height: "",
  weight: "",
  targetWeightEnabled: false,
  targetWeight: "",
  bodyType: "Schlank",
  fitnessLevel: "Anfänger",
  limitations: "",
};

export const defaultNotifications: NotificationsForm = {
  missionReminder: false,
  sleepReminder: false,
  weeklyReport: false,
  glitchAlert: false,
};

export const defaultVitalValues: VitalValuesForm = {
  bodyFat: "",
  restingPulse: "",
  averagePulse: "",
  bloodPressure: "",
  sleepHours: "",
  sleepQuality: "Mittel",
  stressLevel: "Mittel",
  energyLevel: "Mittel",
  painLevel: "Keine",
  medicationDeclared: false,
};

export const defaultAiBuddy: AiBuddyForm = {
  avatarType: "Tierischer Begleiter",
  personality: "Spielerisch & lustig",
  relationshipMode: "Begleiter",
  behaviorDynamics: "Adaptiv",
  motivationStyle: "Ausgewogen",
  reactsToStress: false,
  reactsToSleep: false,
  reactsToActivity: true,
  reactsToMood: false,
};

export const defaultLifestyle: LifestyleForm = {
  nutrition: "Ausgewogen",
  mealRhythm: "Regelmäßig",
  drinkReminder: "Normal",
  drinkAmount: "",
  caffeineIntake: "Mittel",
  alcoholFrequency: "Selten",
  sleepRoutine: "Unregelmäßig",
  natureMove: "Gelegentlich",
  stressCoping: "Spaziergang / Bewegung",
  screenTime: "Mittel",
};

export const defaultActivity: ActivityForm = {
  activityLevel: "Gelegentlich aktiv",
  trainingTime: "Abends",
  communityMode: "Alleine",
  interests: "",
  activities: "Gehen",
  goals: "Mehr Bewegung",
  preferredMissionTypes: "Bewegung",
  socialPreference: "Alleine",
  competitionMode: "Aus",
};

export const defaultPrivacy: PrivacyForm = {
  leaderboardVisible: false,
  buddySharing: false,
  anonymousAnalytics: false,
  friendRequests: false,
  teamInvitations: false,
  localUsersVisible: false,
  pvpAllowed: false,
  profileVisibility: "Privat",
  healthDataUsage: "Nicht verwenden",
  locationSharing: "Nie",
};
