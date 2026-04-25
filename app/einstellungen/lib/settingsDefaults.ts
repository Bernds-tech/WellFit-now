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
  "Diese Angaben dienen nur zur Personalisierung deines KI-Buddys, damit er sich besser auf deine Verfassung einstellen kann, und ersetzen keine medizinische Beratung.";

export const defaultPermissions: Record<PermissionKey, boolean> = {
  location: false,
  camera: true,
  microphone: true,
  backgroundTracking: true,
};

export const defaultProfile: ProfileForm = {
  displayName: "",
  email: "",
  phone: "",
  language: "Deutsch",
  birthDate: "",
  gender: "Männlich",
  timezone: "Europe/Vienna",
  units: "kg / km",
};

export const defaultBiometrics: BiometricsForm = {
  height: "180",
  weight: "82",
  targetWeightEnabled: false,
  targetWeight: "78",
  bodyType: "Schlank",
  fitnessLevel: "Anfänger",
  limitations: "Keine",
};

export const defaultNotifications: NotificationsForm = {
  missionReminder: true,
  sleepReminder: true,
  weeklyReport: true,
  glitchAlert: true,
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
  medicationNote: "",
  healthNotes: "",
};

export const defaultAiBuddy: AiBuddyForm = {
  avatarType: "Tierischer Begleiter",
  personality: "Spielerisch & lustig",
  relationshipMode: "Begleiter",
  behaviorDynamics: "Adaptiv",
  motivationStyle: "Ausgewogen",
  reactsToStress: true,
  reactsToSleep: true,
  reactsToActivity: true,
  reactsToMood: true,
};

export const defaultLifestyle: LifestyleForm = {
  nutrition: "Ausgewogen",
  mealRhythm: "Regelmäßig",
  drinkReminder: "Normal",
  drinkAmount: "2.0",
  caffeineIntake: "Mittel",
  alcoholFrequency: "Selten",
  sleepRoutine: "Unregelmäßig",
  natureMove: "Gelegentlich",
  stressCoping: "Spaziergang / Bewegung",
  screenTime: "Mittel",
  notes: "",
};

export const defaultActivity: ActivityForm = {
  activityLevel: "Gelegentlich aktiv",
  trainingTime: "Abends",
  communityMode: "Alleine & gelegentlich gemeinsam",
  interests: "Fitness, Spazieren, Abenteuer",
  activities: "Gehen, Radfahren, leichte Workouts",
  goals: "Fitter werden, mehr Energie, gesünder leben",
  preferredMissionTypes: "Bewegung, Alltag, Natur, Challenges",
  socialPreference: "Freunde & kleine Gruppen",
  competitionMode: "Locker",
  notes: "",
};

export const defaultPrivacy: PrivacyForm = {
  leaderboardVisible: true,
  buddySharing: false,
  anonymousAnalytics: true,
  friendRequests: true,
  teamInvitations: true,
  localUsersVisible: true,
  pvpAllowed: true,
  profileVisibility: "Freunde",
  healthDataUsage: "Nur Personalisierung",
  locationSharing: "Nie",
};
