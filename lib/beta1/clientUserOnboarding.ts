import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase";

export type OnboardingLanguage = "de" | "en";

export type UserOnboardingInput = {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  birthDate: string;
  language: OnboardingLanguage;
  timeZone: string;
  buddy: {
    id: string;
  };
  registrationSource: "web";
  consents: {
    termsAccepted: boolean;
    privacyAccepted: boolean;
    healthPersonalization: boolean;
    anonymousAnalytics: boolean;
    marketing: boolean;
  };
  preferences: {
    activityLevel: "low" | "medium" | "high";
    trainingTime: "morning" | "afternoon" | "evening" | "flexible";
    communityMode: "solo" | "private" | "public";
    interests: string[];
    goals: string[];
    activities: string[];
  };
  healthProfile?: {
    heightCm?: number;
    weightKg?: number;
    fitnessLevel?: "beginner" | "medium" | "pro";
    sleepHours?: "<6" | "6-8" | ">8";
    sleepQuality?: "poor" | "okay" | "good";
    nutrition?: "all" | "vegetarian" | "vegan" | "light";
    stressLevel?: number;
    limitations?: string[];
    medicationDeclared?: boolean;
  };
};

export type UserOnboardingState = {
  onboardingCompleted: boolean;
  onboardingVersion: string;
  ageBand: string | null;
  timeZone: string;
  language: OnboardingLanguage;
  buddy: {
    id: string;
    name: string;
    file: string;
  };
  emailVerified: boolean;
  requiresEmailVerification: boolean;
  healthPersonalizationEnabled: boolean;
  healthProfileStored: boolean;
  healthDataCategories: string[];
  rawBirthDateStored: false;
  legacyEconomyFieldsDetected: boolean;
  consentSummary: {
    termsAccepted?: boolean;
    privacyAccepted?: boolean;
    healthPersonalization?: boolean;
    anonymousAnalytics?: boolean;
    marketing?: boolean;
    version?: string;
  };
  serverValidationStatus: "server-initialized";
  tokenAuthorized: false;
  cashoutAllowed: false;
  realMoney: false;
  idempotent: boolean;
};

type RawUserOnboardingState = Partial<UserOnboardingState> & {
  accepted?: unknown;
  idempotent?: unknown;
  buddy?: unknown;
  healthDataCategories?: unknown;
  consentSummary?: unknown;
};

function requireCurrentUser() {
  const user = auth.currentUser;
  if (!user) throw new Error("Für die sichere Konto-Einrichtung ist eine aktive Anmeldung erforderlich.");
  return user;
}

function parseStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").slice(0, 20)
    : [];
}

function parseBuddy(value: unknown): UserOnboardingState["buddy"] | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const buddy = value as Record<string, unknown>;
  if (typeof buddy.id !== "string" || typeof buddy.name !== "string" || typeof buddy.file !== "string") return null;
  return { id: buddy.id, name: buddy.name, file: buddy.file };
}

function parseConsentSummary(value: unknown): UserOnboardingState["consentSummary"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const source = value as Record<string, unknown>;
  return {
    termsAccepted: source.termsAccepted === true,
    privacyAccepted: source.privacyAccepted === true,
    healthPersonalization: source.healthPersonalization === true,
    anonymousAnalytics: source.anonymousAnalytics === true,
    marketing: source.marketing === true,
    version: typeof source.version === "string" ? source.version : undefined,
  };
}

function parseOnboardingState(value: RawUserOnboardingState): UserOnboardingState {
  const buddy = parseBuddy(value.buddy);
  if (
    value.accepted !== true
    || value.onboardingCompleted !== true
    || typeof value.onboardingVersion !== "string"
    || typeof value.timeZone !== "string"
    || (value.language !== "de" && value.language !== "en")
    || !buddy
    || value.rawBirthDateStored !== false
    || value.tokenAuthorized !== false
    || value.cashoutAllowed !== false
    || value.realMoney !== false
    || value.serverValidationStatus !== "server-initialized"
  ) {
    throw new Error("Der Server hat keine gültige Onboarding-Bestätigung geliefert.");
  }
  return {
    onboardingCompleted: true,
    onboardingVersion: value.onboardingVersion,
    ageBand: typeof value.ageBand === "string" ? value.ageBand : null,
    timeZone: value.timeZone,
    language: value.language,
    buddy,
    emailVerified: value.emailVerified === true,
    requiresEmailVerification: value.requiresEmailVerification === true,
    healthPersonalizationEnabled: value.healthPersonalizationEnabled === true,
    healthProfileStored: value.healthProfileStored === true,
    healthDataCategories: parseStringArray(value.healthDataCategories),
    rawBirthDateStored: false,
    legacyEconomyFieldsDetected: value.legacyEconomyFieldsDetected === true,
    consentSummary: parseConsentSummary(value.consentSummary),
    serverValidationStatus: "server-initialized",
    tokenAuthorized: false,
    cashoutAllowed: false,
    realMoney: false,
    idempotent: value.idempotent === true,
  };
}

function onboardingErrorMessage(error: unknown): string {
  const code = typeof error === "object" && error && "code" in error
    ? String((error as { code?: unknown }).code ?? "")
    : "";
  const message = error instanceof Error ? error.message : "";
  const diagnostic = `${code} ${message}`.toLowerCase();
  if (diagnostic.includes("unauthenticated")) return "Deine Anmeldung ist abgelaufen. Bitte registriere dich erneut.";
  if (diagnostic.includes("14 jahren")) return "Kinderprofile werden über ein Elternkonto angelegt. Die Selbstregistrierung ist aktuell ab 14 Jahren möglich.";
  if (diagnostic.includes("health") || diagnostic.includes("gesundheits")) return "Gesundheitsnahe Angaben benötigen eine separate freiwillige Zustimmung.";
  if (diagnostic.includes("timezone") || diagnostic.includes("zeitzone")) return "Deine lokale Zeitzone konnte nicht sicher bestätigt werden.";
  if (diagnostic.includes("datenschutz") || diagnostic.includes("agb")) return "Bitte bestätige AGB und Datenschutz jeweils separat.";
  if (diagnostic.includes("e-mail") || diagnostic.includes("email")) return "Die E-Mail-Adresse stimmt nicht mit deinem neuen Firebase-Konto überein.";
  return message || "Die sichere Konto-Einrichtung konnte nicht abgeschlossen werden.";
}

export async function initializeUserAccount(input: UserOnboardingInput): Promise<UserOnboardingState> {
  const user = requireCurrentUser();
  await user.getIdToken(true);
  try {
    const callable = httpsCallable<UserOnboardingInput, RawUserOnboardingState>(
      getFunctions(),
      "initializeUserAccount",
    );
    const response = await callable(input);
    return parseOnboardingState(response.data);
  } catch (error) {
    throw new Error(onboardingErrorMessage(error), { cause: error });
  }
}
