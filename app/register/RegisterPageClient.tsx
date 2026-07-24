"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getClientTimeZone } from "@/lib/beta1/clientUserContext";
import {
  initializeUserAccount,
  type UserOnboardingInput,
} from "@/lib/beta1/clientUserOnboarding";
import {
  Language,
  RegistrationAccountForm,
  RegistrationCompletion,
  RegistrationHealthForm,
  RegistrationPreferencesForm,
  Step,
} from "./registerTypes";
import { getPasswordStrength } from "./registerUtils";
import { getRegisterContent } from "./registerContent";
import RegisterLanguageMenu from "./components/RegisterLanguageMenu";
import Step1Account from "./components/Step1Account";
import Step2Biometrics from "./components/Step2Biometrics";
import Step3Psychography from "./components/Step3Psychography";
import Step4Awakening from "./components/Step4Awakening";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialAccountForm: RegistrationAccountForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  termsAccepted: false,
  privacyAccepted: false,
  anonymousAnalytics: false,
  marketing: false,
};

const initialHealthForm: RegistrationHealthForm = {
  birthdate: "",
  healthPersonalization: false,
  height: 175,
  weight: 75,
  fitnessLevel: "beginner",
  sleepHours: "6-8",
  sleepQuality: "good",
  nutrition: "all",
  stressLevel: 3,
  limitations: [],
  medicationDeclared: false,
  buddyId: "flammi",
  buddyFile: "flammi.png",
  buddyName: "Flammi",
};

const initialPreferencesForm: RegistrationPreferencesForm = {
  activityLevel: "low",
  interests: [],
  communityMode: "solo",
  trainingTime: "flexible",
  goals: [],
  activities: [],
  activityType: "walking",
  companionType: "magical",
};

const initialCompletion: RegistrationCompletion = {
  completed: false,
  emailVerificationSent: false,
  requiresEmailVerification: true,
  serverMessage: "",
};

function getFirebaseRegisterMessage(code: string | undefined, language: Language) {
  const de: Record<string, string> = {
    "auth/email-already-in-use": "Diese E-Mail-Adresse ist bereits registriert.",
    "auth/invalid-email": "Bitte gib eine gültige E-Mail-Adresse ein.",
    "auth/weak-password": "Das Passwort ist zu schwach.",
    "auth/network-request-failed": "Netzwerkfehler. Bitte prüfe deine Verbindung.",
    "auth/operation-not-allowed": "E-Mail/Passwort-Registrierung ist in Firebase noch nicht aktiviert.",
    "auth/too-many-requests": "Zu viele Versuche. Bitte versuche es später erneut.",
  };
  const en: Record<string, string> = {
    "auth/email-already-in-use": "This email address is already registered.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "The password is too weak.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    "auth/operation-not-allowed": "Email/password registration is not enabled in Firebase yet.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
  };
  return (language === "de" ? de : en)[code ?? ""]
    ?? (language === "de" ? "Registrierung fehlgeschlagen. Bitte versuche es erneut." : "Registration failed. Please try again.");
}

function getAge(birthdate: string) {
  if (!birthdate) return null;
  const date = new Date(`${birthdate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  let age = today.getUTCFullYear() - date.getUTCFullYear();
  const monthDifference = today.getUTCMonth() - date.getUTCMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getUTCDate() < date.getUTCDate())) age -= 1;
  return age;
}

function mapActivityLevel(value: RegistrationPreferencesForm["activityLevel"]): UserOnboardingInput["preferences"]["activityLevel"] {
  if (value === "very") return "high";
  if (value === "regular") return "medium";
  return "low";
}

function buildHealthProfile(health: RegistrationHealthForm): UserOnboardingInput["healthProfile"] | undefined {
  if (!health.healthPersonalization) return undefined;
  return {
    heightCm: health.height,
    weightKg: health.weight,
    fitnessLevel: health.fitnessLevel,
    sleepHours: health.sleepHours,
    sleepQuality: health.sleepQuality,
    nutrition: health.nutrition,
    stressLevel: health.stressLevel,
    limitations: health.limitations,
    medicationDeclared: health.medicationDeclared,
  };
}

export default function RegisterPageClient() {
  const [language, setLanguage] = useState<Language>("de");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [isCreating, setIsCreating] = useState(false);
  const [account, setAccount] = useState<RegistrationAccountForm>(initialAccountForm);
  const [health, setHealth] = useState<RegistrationHealthForm>(initialHealthForm);
  const [preferences, setPreferences] = useState<RegistrationPreferencesForm>(initialPreferencesForm);
  const [completion, setCompletion] = useState<RegistrationCompletion>(initialCompletion);
  const t = useMemo(() => getRegisterContent(language), [language]);
  const passwordStrength = useMemo(
    () => getPasswordStrength(account.password, language),
    [account.password, language],
  );

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("wellfit-language") as Language | null;
    if (savedLanguage === "de" || savedLanguage === "en") setLanguage(savedLanguage);
  }, []);

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem("wellfit-language", nextLanguage);
    setShowLanguageMenu(false);
  };

  const showMessage = (de: string, en: string) => {
    window.alert(language === "de" ? de : en);
  };

  const handleStep1 = () => {
    const firstName = account.firstName.trim();
    const lastName = account.lastName.trim();
    const email = account.email.trim().toLowerCase();
    if (!firstName || !lastName || !email || !account.password || !account.confirmPassword) {
      showMessage("Bitte fülle alle Pflichtfelder aus.", "Please fill in all required fields.");
      return;
    }
    if (!emailPattern.test(email)) {
      showMessage("Bitte gib eine gültige E-Mail-Adresse ein.", "Please enter a valid email address.");
      return;
    }
    if (!passwordStrength.isStrongEnough) {
      showMessage("Bitte verwende ein stärkeres Passwort.", "Please use a stronger password.");
      return;
    }
    if (account.password !== account.confirmPassword) {
      showMessage("Die Passwörter stimmen nicht überein.", "The passwords do not match.");
      return;
    }
    if (!account.termsAccepted || !account.privacyAccepted) {
      showMessage("Bitte bestätige AGB und Datenschutz jeweils separat.", "Please accept the terms and privacy policy separately.");
      return;
    }
    setAccount({ ...account, firstName, lastName, email });
    setStep(2);
  };

  const handleStep2 = () => {
    const age = getAge(health.birthdate);
    if (age === null) {
      showMessage("Bitte gib dein Geburtsdatum ein.", "Please enter your date of birth.");
      return;
    }
    if (age < 14) {
      showMessage(
        "Kinderprofile werden über ein Elternkonto angelegt. Die Selbstregistrierung ist aktuell ab 14 Jahren möglich.",
        "Child profiles are created through a parent account. Self-registration is currently available from age 14.",
      );
      return;
    }
    if (age > 110) {
      showMessage("Bitte prüfe dein Geburtsdatum.", "Please check your date of birth.");
      return;
    }
    setStep(3);
  };

  const handleStep3 = () => setStep(4);

  const handleRegister = async () => {
    if (isCreating || completion.completed) return;
    setIsCreating(true);
    try {
      const normalizedEmail = account.email.trim().toLowerCase();
      let firebaseUser = auth.currentUser;
      if (firebaseUser && firebaseUser.email?.toLowerCase() !== normalizedEmail) {
        throw new Error(
          language === "de"
            ? "Im Browser ist bereits ein anderes Konto angemeldet. Bitte melde dieses zuerst ab."
            : "A different account is already signed in. Please sign it out first.",
        );
      }
      if (!firebaseUser) {
        const credential = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          account.password,
        );
        firebaseUser = credential.user;
      }

      const onboarding = await initializeUserAccount({
        firstName: account.firstName.trim(),
        lastName: account.lastName.trim(),
        displayName: `${account.firstName.trim()} ${account.lastName.trim()}`.trim(),
        email: normalizedEmail,
        birthDate: health.birthdate,
        language,
        timeZone: getClientTimeZone(),
        buddy: { id: health.buddyId },
        registrationSource: "web",
        consents: {
          termsAccepted: account.termsAccepted,
          privacyAccepted: account.privacyAccepted,
          healthPersonalization: health.healthPersonalization,
          anonymousAnalytics: account.anonymousAnalytics,
          marketing: account.marketing,
        },
        preferences: {
          activityLevel: mapActivityLevel(preferences.activityLevel),
          trainingTime: preferences.trainingTime,
          communityMode: preferences.communityMode,
          interests: preferences.interests,
          goals: preferences.goals,
          activities: preferences.activities.length > 0 ? preferences.activities : [preferences.activityType],
        },
        healthProfile: buildHealthProfile(health),
      });

      let emailVerificationSent = false;
      if (onboarding.requiresEmailVerification && !firebaseUser.emailVerified) {
        try {
          await sendEmailVerification(firebaseUser);
          emailVerificationSent = true;
        } catch (verificationError) {
          console.warn("E-Mail-Verifikation konnte nicht versendet werden:", verificationError);
        }
      }

      setCompletion({
        completed: true,
        emailVerificationSent,
        requiresEmailVerification: onboarding.requiresEmailVerification,
        serverMessage: language === "de"
          ? `${onboarding.buddy.name} ist bereit. Dein Profil wurde datensparsam für die Zeitzone ${onboarding.timeZone} eingerichtet.`
          : `${onboarding.buddy.name} is ready. Your privacy-minimized profile was initialized for ${onboarding.timeZone}.`,
      });
    } catch (error) {
      console.error("Registrierung fehlgeschlagen:", error);
      const code = typeof error === "object" && error && "code" in error
        ? String((error as { code?: unknown }).code ?? "")
        : undefined;
      const fallback = getFirebaseRegisterMessage(code, language);
      window.alert(error instanceof Error && error.message ? error.message : fallback);
    } finally {
      setIsCreating(false);
    }
  };

  const openDashboard = () => {
    window.location.assign("/dashboard");
  };

  return (
    <main className="relative min-h-screen w-full overflow-y-auto text-white xl:h-screen xl:overflow-hidden">
      <Image src="/login-bg.png" alt="WellFit Hintergrund" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#008f97]/75 via-[#00aeb8]/45 to-[#042f35]/70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-black/18 to-transparent" />
      <div className="pointer-events-none absolute left-[26%] top-[22%] h-[520px] w-[520px] rounded-full bg-cyan-200/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[8%] right-[8%] h-[360px] w-[360px] rounded-full bg-emerald-200/10 blur-3xl" />

      <div className="relative min-h-screen w-full px-5 pb-8 pt-20 sm:px-8 xl:h-full xl:p-0">
        <div className="absolute left-5 top-5 z-30 h-24 w-32 sm:left-8 sm:top-8 sm:h-28 sm:w-36 lg:h-36 lg:w-44">
          <Image src="/logo.png" alt="WellFit Logo" fill priority className="object-contain object-left-top" />
        </div>
        <RegisterLanguageMenu
          language={language}
          showLanguageMenu={showLanguageMenu}
          onToggle={() => setShowLanguageMenu((previous) => !previous)}
          onChangeLanguage={changeLanguage}
        />

        {step === 1 ? (
          <div className="mx-auto flex min-h-[calc(100vh-100px)] max-w-[1180px] flex-col justify-center pb-10 pt-16 xl:min-h-0 xl:h-full xl:pb-0 xl:pt-0">
            <section className="text-center xl:absolute xl:left-1/2 xl:top-12 xl:z-20 xl:w-[920px] xl:-translate-x-1/2">
              <div className="mx-auto mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md">WellFit Closed Beta</div>
              <h1 className="text-[2.1rem] font-black leading-[1.02] tracking-tight text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.24)] sm:text-[2.7rem] lg:text-[3.05rem] xl:whitespace-nowrap">{t.step1Title.replace("\n", " ")}</h1>
              <p className="mx-auto mt-3 max-w-[620px] text-sm font-semibold leading-snug text-white/90 sm:text-base">
                {language === "de" ? "Kostenlos registrieren, einen Buddy wählen und WellFit datensparsam entdecken." : "Register for free, choose a buddy and explore WellFit with privacy-first defaults."}
              </p>
            </section>

            <section className="grid gap-8 pt-8 xl:absolute xl:left-1/2 xl:top-[27%] xl:w-[1180px] xl:-translate-x-1/2 xl:grid-cols-[470px_500px] xl:items-start xl:justify-center xl:gap-14 xl:pt-0">
              <div className="mx-auto w-full max-w-[470px] space-y-4 text-left">
                {[
                  [language === "de" ? "Bewegung wird zum Abenteuer" : "Movement becomes an adventure", language === "de" ? "Missionen, sichere Orte in deiner Umgebung und dein Buddy verbinden reale Aktivität mit sichtbarem Fortschritt." : "Missions, safe nearby places and your buddy connect real activity with visible progress."],
                  [language === "de" ? "Belohnungen bleiben intern" : "Rewards remain internal", language === "de" ? "Die Closed Beta nutzt ausschließlich interne, nicht auszahlbare Fortschrittswerte. Registrierung erzeugt keine Token oder Geldwerte." : "The Closed Beta uses internal, non-cashout progress only. Registration creates no tokens or monetary value."],
                  [language === "de" ? "Privat als Standard" : "Private by default", language === "de" ? "Standort, Kamera, Health-Personalisierung, Analytics und Marketing starten aus und benötigen eine bewusste Entscheidung." : "Location, camera, health personalization, analytics and marketing start off and require an explicit choice."],
                ].map(([title, text]) => (
                  <div key={title} className="rounded-[26px] border border-white/10 bg-white/[0.055] px-5 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.08)] backdrop-blur-[2px]">
                    <h2 className="text-[1.35rem] font-black leading-tight text-white">{title}</h2>
                    <p className="mt-2 text-base leading-[1.35] text-white/85">{text}</p>
                  </div>
                ))}
                <p className="text-center text-sm text-white/75 xl:text-left">
                  {t.alreadyAccount} <Link href="/login" className="font-black text-cyan-100 underline underline-offset-4">{t.login}</Link>
                </p>
              </div>

              <div className="mx-auto w-full max-w-[500px]">
                <Step1Account language={language} form={account} setForm={setAccount} onNext={handleStep1} compact />
              </div>
            </section>
          </div>
        ) : null}

        {step === 2 ? <Step2Biometrics language={language} biometrics={health} setBiometrics={setHealth} onNext={handleStep2} /> : null}
        {step === 3 ? <Step3Psychography language={language} psychography={preferences} setPsychography={setPreferences} onNext={handleStep3} /> : null}
        {step === 4 ? (
          <Step4Awakening
            language={language}
            buddyName={health.buddyName}
            buddyFile={health.buddyFile}
            isCreating={isCreating}
            completion={completion}
            onFinish={handleRegister}
            onContinue={openDashboard}
          />
        ) : null}
      </div>
    </main>
  );
}
