export type Language = "de" | "en";
export type Step = 1 | 2 | 3 | 4;

export type PasswordStrength = {
  score: number;
  label: string;
  colorClass: string;
  barClass: string;
  isStrongEnough: boolean;
  checks: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    special: boolean;
  };
};

export type RegistrationAccountForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  anonymousAnalytics: boolean;
  marketing: boolean;
};

export type RegistrationHealthForm = {
  birthdate: string;
  healthPersonalization: boolean;
  height: number;
  weight: number;
  fitnessLevel: "beginner" | "medium" | "pro";
  sleepHours: "<6" | "6-8" | ">8";
  sleepQuality: "poor" | "okay" | "good";
  nutrition: "all" | "vegetarian" | "vegan" | "light";
  stressLevel: number;
  limitations: string[];
  medicationDeclared: boolean;
  buddyId: string;
  buddyFile: string;
  buddyName: string;
};

export type RegistrationPreferencesForm = {
  activityLevel: "low" | "sometimes" | "regular" | "very";
  interests: string[];
  communityMode: "solo" | "private" | "public";
  trainingTime: "morning" | "afternoon" | "evening" | "flexible";
  goals: string[];
  activities: string[];
  activityType: string;
  companionType: "animal" | "magical" | "robot" | "hero";
};

export type RegistrationCompletion = {
  completed: boolean;
  emailVerificationSent: boolean;
  requiresEmailVerification: boolean;
  serverMessage: string;
};
