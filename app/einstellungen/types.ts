export type PermissionKey = "location" | "camera" | "microphone" | "backgroundTracking";

export type ProfileForm = {
  displayName: string;
  email: string;
  phone: string;
  language: string;
  birthDate: string;
  gender: string;
  timezone: string;
  units: string;
};

export type BiometricsForm = {
  height: string;
  weight: string;
  targetWeightEnabled: boolean;
  targetWeight: string;
  bodyType: string;
  fitnessLevel: string;
  limitations: string;
};

export type NotificationsForm = {
  missionReminder: boolean;
  sleepReminder: boolean;
  weeklyReport: boolean;
  glitchAlert: boolean;
};

export type VitalValuesForm = {
  bodyFat: string;
  restingPulse: string;
  averagePulse: string;
  bloodPressure: string;
  sleepHours: string;
  sleepQuality: string;
  stressLevel: string;
  energyLevel: string;
  painLevel: string;
  medicationNote: string;
  healthNotes: string;
};

export type AiBuddyForm = {
  avatarType: string;
  personality: string;
  relationshipMode: string;
  behaviorDynamics: string;
  motivationStyle: string;
  reactsToStress: boolean;
  reactsToSleep: boolean;
  reactsToActivity: boolean;
  reactsToMood: boolean;
};

export type LifestyleForm = {
  nutrition: string;
  mealRhythm: string;
  drinkReminder: string;
  drinkAmount: string;
  caffeineIntake: string;
  alcoholFrequency: string;
  sleepRoutine: string;
  natureMove: string;
  stressCoping: string;
  screenTime: string;
  notes: string;
};

export type ActivityForm = {
  activityLevel: string;
  trainingTime: string;
  communityMode: string;
  interests: string;
  activities: string;
  goals: string;
  preferredMissionTypes: string;
  socialPreference: string;
  competitionMode: string;
  notes: string;
};

export type PrivacyForm = {
  leaderboardVisible: boolean;
  buddySharing: boolean;
  anonymousAnalytics: boolean;
  friendRequests: boolean;
  teamInvitations: boolean;
  localUsersVisible: boolean;
  pvpAllowed: boolean;
  profileVisibility: string;
  healthDataUsage: string;
  locationSharing: string;
};
