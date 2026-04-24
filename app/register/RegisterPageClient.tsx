"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { Language, Step } from "./registerTypes";
import { getPasswordStrength, mapActivityLevelToSettings, mapCommunityModeToSettings, mapDrinkReminderToSettings, mapEnergyToSettings, mapNatureMoveToSettings, mapNutritionToSettings, mapSleepHoursToSettings, mapSleepQualityToSettings, mapStressToSettings, mapTrainingTimeToSettings } from "./registerUtils";
import { getRegisterContent } from "./registerContent";
import RegisterLanguageMenu from "./components/RegisterLanguageMenu";
import Step1Account from "./components/Step1Account";
import Step2Biometrics from "./components/Step2Biometrics";
import Step3Psychography from "./components/Step3Psychography";
import Step4Awakening from "./components/Step4Awakening";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getFirebaseRegisterMessage = (code: string | undefined, language: Language) => {
  const de: Record<string, string> = {
    "auth/email-already-in-use": "Diese E-Mail-Adresse ist bereits registriert.",
    "auth/invalid-email": "Bitte gib eine gültige E-Mail-Adresse ein.",
    "auth/weak-password": "Das Passwort ist zu schwach.",
    "auth/network-request-failed": "Netzwerkfehler. Bitte prüfe deine Verbindung.",
    "auth/operation-not-allowed": "E-Mail/Passwort-Registrierung ist in Firebase noch nicht aktiviert.",
  };
  const en: Record<string, string> = {
    "auth/email-already-in-use": "This email address is already registered.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "The password is too weak.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    "auth/operation-not-allowed": "Email/password registration is not enabled in Firebase yet.",
  };
  return (language === "de" ? de : en)[code ?? ""] ?? (language === "de" ? "Registrierung fehlgeschlagen. Bitte versuche es erneut." : "Registration failed. Please try again.");
};

const getAge = (birthdate: string) => {
  if (!birthdate) return null;
  const date = new Date(birthdate);
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) age -= 1;
  return age;
};

export default function RegisterPageClient() {
  const [language, setLanguage] = useState<Language>("de");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", accepted: false });
  const [biometrics, setBiometrics] = useState<any>({ birthdate: "", gender: "male", height: 180, weight: 82, bodyType: "slim", targetWeight: false, fitnessLevel: "beginner", medication: "no", limitations: [], otherRestriction: "", sleepHours: "6-8", sleepQuality: "good", nutrition: "all", drinkReminder: "yes", drinkAmount: 2.5, stressLevel: 3, natureMove: "60", buddyId: "flammi", buddyFile: "flammi.png", buddyName: "Flammi" });
  const [psychography, setPsychography] = useState<any>({ activityLevel: "low", interests: [], communityMode: "public", trainingTime: "morning", goals: [], activities: [], enableBiometrics: false, activityType: "walking" });
  const t = useMemo(() => getRegisterContent(language), [language]);
  const passwordStrength = useMemo(() => getPasswordStrength(form.password, language), [form.password, language]);

  useEffect(() => { const savedLanguage = localStorage.getItem("wellfit-language") as Language | null; if (savedLanguage === "de" || savedLanguage === "en") setLanguage(savedLanguage); }, []);
  const changeLanguage = (lang: Language) => { setLanguage(lang); localStorage.setItem("wellfit-language", lang); setShowLanguageMenu(false); };

  const handleStep1 = () => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const email = form.email.trim().toLowerCase();
    if (!firstName || !lastName || !email || !form.password || !form.confirmPassword) { alert(language === "de" ? "Bitte fülle alle Felder aus." : "Please fill in all fields."); return; }
    if (!emailPattern.test(email)) { alert(language === "de" ? "Bitte gib eine gültige E-Mail-Adresse ein." : "Please enter a valid email address."); return; }
    if (!passwordStrength.isStrongEnough) { alert(language === "de" ? "Bitte verwende ein stärkeres Passwort." : "Please use a stronger password."); return; }
    if (form.password !== form.confirmPassword) { alert(language === "de" ? "Die Passwörter stimmen nicht überein." : "The passwords do not match."); return; }
    if (!form.accepted) { alert(language === "de" ? "Bitte akzeptiere Datenschutzbestimmungen und AGB." : "Please accept the privacy policy and terms."); return; }
    setForm({ ...form, firstName, lastName, email });
    setStep(2);
  };

  const handleStep2 = () => {
    const age = getAge(biometrics.birthdate);
    if (age === null) { alert(language === "de" ? "Bitte gib dein Geburtsdatum ein." : "Please enter your date of birth."); return; }
    if (age < 6 || age > 110) { alert(language === "de" ? "Bitte prüfe dein Geburtsdatum." : "Please check your date of birth."); return; }
    if (age < 14) { alert(language === "de" ? "Für Kinderprofile wird im nächsten Schritt ein Elternkonto benötigt. Aktuell bitte ein Elternprofil registrieren." : "Child profiles will require a parent account. For now, please register a parent profile."); return; }
    setStep(3);
  };

  const handleRegister = async () => {
    if (isCreating) return;
    try {
      setIsCreating(true);
      const normalizedEmail = form.email.trim().toLowerCase();
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, form.password);
      const firebaseUser = userCredential.user;
      const now = new Date().toISOString();
      const displayName = `${form.firstName.trim()} ${form.lastName.trim()}`.trim();
      const targetWeightValue = biometrics.targetWeight ? Number(biometrics.targetWeightValue || biometrics.weight) : 0;
      const selectedBuddy = { id: biometrics.buddyId ?? "flammi", name: biometrics.buddyName ?? "Flammi", file: biometrics.buddyFile ?? "flammi.png" };
      const lifestyle = { nutrition: mapNutritionToSettings(biometrics.nutrition), mealRhythm: "Regelmäßig", drinkReminder: mapDrinkReminderToSettings(biometrics.drinkReminder), drinkAmount: biometrics.drinkAmount, caffeineIntake: "Mittel", alcoholFrequency: "Selten", sleepRoutine: "Unregelmäßig", natureMove: mapNatureMoveToSettings(biometrics.natureMove), stressCoping: "Spaziergang / Bewegung", screenTime: "Mittel", notes: "" };
      const activity = { activityLevel: mapActivityLevelToSettings(psychography.activityLevel), trainingTime: mapTrainingTimeToSettings(psychography.trainingTime), communityMode: mapCommunityModeToSettings(psychography.communityMode), interests: psychography.interests ?? [], activities: psychography.activities?.length ? psychography.activities : [psychography.activityType], goals: psychography.goals ?? [], preferredMissionTypes: ["AR", "Bewegung", "Alltag"], socialPreference: psychography.communityMode === "solo" ? "Alleine" : "Freunde & kleine Gruppen", competitionMode: psychography.communityMode === "public" ? "Locker" : "Aus", notes: "" };
      const vitals = { bodyFat: "", restingPulse: "", averagePulse: "", bloodPressure: "", sleepHours: mapSleepHoursToSettings(biometrics.sleepHours), sleepQuality: mapSleepQualityToSettings(biometrics.sleepQuality), stressLevel: mapStressToSettings(biometrics.stressLevel), energyLevel: mapEnergyToSettings(6 - biometrics.stressLevel), painLevel: (biometrics.limitations ?? []).length > 0 ? "Leicht" : "Keine", medicationNote: biometrics.medication === "yes" ? "Medikamenteneinnahme angegeben" : "", healthNotes: biometrics.otherRestriction ?? "" };
      const aiBuddy = { selectedBuddy, avatarType: "Tierischer Begleiter", personality: "Spielerisch & lustig", relationshipMode: "Begleiter", behaviorDynamics: "Adaptiv", motivationStyle: "Ausgewogen", reactsToStress: true, reactsToSleep: true, reactsToActivity: true, reactsToMood: true };
      const reminders = { missionReminder: true, sleepReminder: true, weeklyReport: true, glitchAlert: true };
      const privacy = { leaderboardVisible: psychography.communityMode === "public", buddySharing: false, anonymousAnalytics: true, friendRequests: psychography.communityMode !== "solo", teamInvitations: psychography.communityMode !== "solo", localUsersVisible: psychography.communityMode === "public", pvpAllowed: psychography.communityMode === "public", profileVisibility: psychography.communityMode === "public" ? "Community" : psychography.communityMode === "private" ? "Freunde" : "Privat", healthDataUsage: "Nur Personalisierung", locationSharing: "Nie" };
      const permissions = { location: false, camera: false, microphone: false, backgroundTracking: false };
      const consents = { termsAccepted: true, termsAcceptedAt: now, privacyAccepted: true, privacyAcceptedAt: now, healthPersonalization: true, healthPersonalizationAt: now, sensorTracking: false, sensorTrackingAt: null, marketingOptIn: false, guardianRequired: false };
      await setDoc(doc(db, "users", firebaseUser.uid), { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: normalizedEmail, points: 0, xp: 0, energy: 100, level: 1, stepsToday: 0, currency: "points", avatar: { buddyId: selectedBuddy.id, name: selectedBuddy.name, file: selectedBuddy.file, hunger: 100, mood: 100, energy: 100, level: 1 }, inventory: [], profile: { ...biometrics, ...psychography, targetWeightValue, vitals, lifestyle, activity, aiBuddy }, settings: { displayName, email: normalizedEmail, phone: "", language: language === "de" ? "Deutsch" : "English", birthDate: biometrics.birthdate, gender: biometrics.gender === "female" ? "Weiblich" : biometrics.gender === "diverse" ? "Divers" : "Männlich", timezone: "Europe/Vienna", units: "kg / km", reminders, privacy, permissions, consents }, onboardingCompleted: true, onboardingStep: 4, registrationSource: "web", createdAt: now, updatedAt: now });
      setTimeout(() => { window.location.href = "/dashboard"; }, 900);
    } catch (error: any) {
      console.error("Registrierung fehlgeschlagen:", error);
      setIsCreating(false);
      alert(getFirebaseRegisterMessage(error?.code, language));
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-y-auto text-white xl:h-screen xl:overflow-hidden">
      <Image src="/login-bg.png" alt="WellFit Hintergrund" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#008f97]/75 via-[#00aeb8]/45 to-[#042f35]/70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-black/18 to-transparent" />
      <div className="pointer-events-none absolute left-[26%] top-[22%] h-[520px] w-[520px] rounded-full bg-cyan-200/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] bottom-[8%] h-[360px] w-[360px] rounded-full bg-emerald-200/10 blur-3xl" />
      <div className="relative min-h-screen w-full px-5 pb-8 pt-20 sm:px-8 xl:h-full xl:p-0">
        <div className="absolute left-5 top-5 z-20 h-24 w-32 sm:left-8 sm:top-8 sm:h-28 sm:w-36 lg:h-36 lg:w-44"><Image src="/logo.png" alt="WellFit Logo" fill priority className="object-contain object-left-top" /></div>
        <RegisterLanguageMenu language={language} showLanguageMenu={showLanguageMenu} onToggle={() => setShowLanguageMenu((prev) => !prev)} onChangeLanguage={changeLanguage} />
        {step === 1 && <><section className="mx-auto max-w-[920px] text-center xl:absolute xl:left-1/2 xl:top-16 xl:z-20 xl:w-[920px] xl:-translate-x-1/2"><div className="mx-auto mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md">WellFit Earn Wellness</div><h1 className="text-[2.1rem] font-black leading-[1.02] tracking-tight text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.24)] sm:text-[2.7rem] lg:text-[3.05rem] xl:whitespace-nowrap">{t.step1Title.replace("\n", " ")}</h1><div className="mx-auto mt-3 flex max-w-[700px] items-center justify-center gap-4"><div className="hidden h-[2px] flex-1 rounded-full bg-gradient-to-r from-transparent via-white/35 to-cyan-200/40 sm:block" /><p className="max-w-[460px] text-center text-sm font-semibold leading-snug text-white/90 drop-shadow-[0_4px_14px_rgba(0,0,0,0.18)] sm:text-base">{t.step1Subtitle}</p><div className="hidden h-[2px] flex-1 rounded-full bg-gradient-to-l from-transparent via-white/35 to-cyan-200/40 sm:block" /></div></section><section className="mx-auto grid max-w-[1180px] gap-8 pt-8 xl:block xl:pt-0"><div className="mx-auto max-w-[470px] text-left xl:absolute xl:left-16 xl:top-[34%]"><div className="mb-7 rounded-[26px] border border-white/10 bg-white/[0.045] px-5 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.08)] backdrop-blur-[2px]"><h2 className="text-[1.55rem] font-black leading-tight text-white">{t.benefit1Title}</h2><p className="mt-2 text-[1.18rem] leading-[1.28] text-white/90">{t.benefit1Text}</p></div><div className="mb-7 rounded-[26px] border border-white/10 bg-white/[0.045] px-5 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.08)] backdrop-blur-[2px]"><h2 className="text-[1.55rem] font-black leading-tight text-white">{t.benefit2Title}</h2><p className="mt-2 text-[1.18rem] leading-[1.28] text-white/90">{t.benefit2Text}</p></div><div className="rounded-[26px] border border-white/10 bg-white/[0.045] px-5 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.08)] backdrop-blur-[2px]"><h2 className="text-[1.55rem] font-black leading-tight text-white">{t.benefit3Title}</h2><p className="mt-2 text-[1.18rem] leading-[1.28] text-white/90">{t.benefit3Text}</p></div></div><div className="mx-auto w-full max-w-[450px] xl:absolute xl:right-16 xl:top-[31%]"><Step1Account language={language} form={form} setForm={setForm} onNext={handleStep1} compact /></div></section><div className="mt-8 text-center text-[0.95rem] xl:absolute xl:bottom-8 xl:right-20">{t.alreadyAccount} <Link href="/" className="font-semibold underline underline-offset-4 transition hover:text-cyan-100">{t.login}</Link></div></>}
        {step === 2 && <Step2Biometrics language={language} biometrics={biometrics} setBiometrics={setBiometrics} onNext={handleStep2} />}
        {step === 3 && <Step3Psychography language={language} psychography={psychography} setPsychography={setPsychography} onNext={() => setStep(4)} />}
        {step === 4 && <Step4Awakening language={language} isCreating={isCreating} onFinish={handleRegister} />}
      </div>
    </main>
  );
}
