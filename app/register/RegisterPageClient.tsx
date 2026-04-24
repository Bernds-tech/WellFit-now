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

export default function RegisterPageClient() {
  const [language, setLanguage] = useState<Language>("de");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [step, setStep] = useState<Step>(1);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "", accepted: true });
  const [biometrics, setBiometrics] = useState<any>({ birthdate: "", gender: "male", height: 180, weight: 82, bodyType: "slim", targetWeight: false, fitnessLevel: "beginner", medication: "no", limitations: [], otherRestriction: "", sleepHours: "6-8", sleepQuality: "good", nutrition: "all", drinkReminder: "yes", drinkAmount: 2.5, stressLevel: 3, natureMove: "60" });
  const [psychography, setPsychography] = useState<any>({ activityLevel: "low", interests: [], communityMode: "public", trainingTime: "morning", goals: [], activities: [], enableBiometrics: false, activityType: "walking" });
  const t = useMemo(() => getRegisterContent(language), [language]);
  const passwordStrength = useMemo(() => getPasswordStrength(form.password, language), [form.password, language]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("wellfit-language") as Language | null;
    if (savedLanguage === "de" || savedLanguage === "en") setLanguage(savedLanguage);
  }, []);

  const changeLanguage = (lang: Language) => { setLanguage(lang); localStorage.setItem("wellfit-language", lang); setShowLanguageMenu(false); };
  const handleStep1 = () => { if (!form.firstName || !form.lastName || !form.email || !form.password) { alert(language === "de" ? "Bitte fülle alle Felder aus." : "Please fill in all fields."); return; } if (!passwordStrength.isStrongEnough) { alert(language === "de" ? "Bitte verwende ein stärkeres Passwort." : "Please use a stronger password."); return; } setStep(2); };

  const handleRegister = async () => {
    try {
      setIsCreating(true);
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      const firebaseUser = userCredential.user;
      const now = new Date().toISOString();
      const displayName = `${form.firstName} ${form.lastName}`.trim();
      const targetWeightValue = biometrics.targetWeight ? biometrics.weight : 0;
      const lifestyle = { nutrition: mapNutritionToSettings(biometrics.nutrition), mealRhythm: "Regelmäßig", drinkReminder: mapDrinkReminderToSettings(biometrics.drinkReminder), drinkAmount: biometrics.drinkAmount, caffeineIntake: "Mittel", alcoholFrequency: "Selten", sleepRoutine: "Unregelmäßig", natureMove: mapNatureMoveToSettings(biometrics.natureMove), stressCoping: "Spaziergang / Bewegung", screenTime: "Mittel", notes: "" };
      const activity = { activityLevel: mapActivityLevelToSettings(psychography.activityLevel), trainingTime: mapTrainingTimeToSettings(psychography.trainingTime), communityMode: mapCommunityModeToSettings(psychography.communityMode), interests: psychography.interests ?? [], activities: psychography.activities ?? [psychography.activityType], goals: psychography.goals ?? [], preferredMissionTypes: ["AR", "Bewegung", "Alltag"], socialPreference: psychography.communityMode === "solo" ? "Alleine" : "Freunde & kleine Gruppen", competitionMode: psychography.communityMode === "public" ? "Locker" : "Aus", notes: "" };
      const vitals = { bodyFat: "", restingPulse: "", averagePulse: "", bloodPressure: "", sleepHours: mapSleepHoursToSettings(biometrics.sleepHours), sleepQuality: mapSleepQualityToSettings(biometrics.sleepQuality), stressLevel: mapStressToSettings(biometrics.stressLevel), energyLevel: mapEnergyToSettings(6 - biometrics.stressLevel), painLevel: (biometrics.limitations ?? []).length > 0 ? "Leicht" : "Keine", medicationNote: biometrics.medication === "yes" ? "Medikamenteneinnahme angegeben" : "", healthNotes: biometrics.otherRestriction ?? "" };
      const aiBuddy = { avatarType: "Tierischer Begleiter", personality: "Spielerisch & lustig", relationshipMode: "Begleiter", behaviorDynamics: "Adaptiv", motivationStyle: "Ausgewogen", reactsToStress: true, reactsToSleep: true, reactsToActivity: true, reactsToMood: true };
      const reminders = { missionReminder: true, sleepReminder: true, weeklyReport: true, glitchAlert: true };
      const privacy = { leaderboardVisible: psychography.communityMode === "public", buddySharing: false, anonymousAnalytics: true, friendRequests: psychography.communityMode !== "solo", teamInvitations: psychography.communityMode !== "solo", localUsersVisible: psychography.communityMode === "public", pvpAllowed: psychography.communityMode === "public", profileVisibility: psychography.communityMode === "public" ? "Community" : psychography.communityMode === "private" ? "Freunde" : "Privat", healthDataUsage: "Nur Personalisierung", locationSharing: "Nie" };
      const permissions = { location: false, camera: true, microphone: true, backgroundTracking: true };
      await setDoc(doc(db, "users", firebaseUser.uid), { firstName: form.firstName, lastName: form.lastName, email: form.email, points: 0, xp: 0, energy: 100, level: 1, stepsToday: 0, currency: "points", avatar: { hunger: 100, mood: 100, energy: 100, level: 1 }, inventory: [], profile: { ...biometrics, ...psychography, targetWeightValue, vitals, lifestyle, activity, aiBuddy }, settings: { displayName, email: form.email, phone: "", language: language === "de" ? "Deutsch" : "English", birthDate: biometrics.birthdate, gender: biometrics.gender === "female" ? "Weiblich" : biometrics.gender === "diverse" ? "Divers" : "Männlich", timezone: "Europe/Vienna", units: "kg / km", reminders, privacy, permissions }, createdAt: now, updatedAt: now });
      setTimeout(() => { window.location.href = "/dashboard"; }, 900);
    } catch (error: any) { console.error("Registrierung fehlgeschlagen:", error); setIsCreating(false); alert(language === "de" ? "Registrierung fehlgeschlagen. Bitte versuche es erneut." : "Registration failed. Please try again."); }
  };

  return (
    <main className="relative h-screen w-screen overflow-hidden text-white">
      <Image src="/login-bg.png" alt="WellFit Hintergrund" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-cyan-900/10" />
      <div className="relative h-full w-full">
        <div className="absolute left-8 top-8 z-20 h-28 w-36 lg:h-36 lg:w-44"><Image src="/logo.png" alt="WellFit Logo" fill priority className="object-contain object-left-top" /></div>
        <RegisterLanguageMenu language={language} showLanguageMenu={showLanguageMenu} onToggle={() => setShowLanguageMenu((prev) => !prev)} onChangeLanguage={changeLanguage} />
        {step === 1 && <><div className="absolute left-1/2 top-16 z-20 w-[760px] -translate-x-1/2 text-center"><div className="mx-auto mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.22em] text-cyan-100 backdrop-blur-sm">WellFit Earn Wellness</div><h1 className="text-[3.4rem] font-black leading-[0.95] tracking-tight text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.22)]">{t.step1Title}</h1><div className="mx-auto mt-4 flex max-w-[760px] items-center justify-center gap-5"><div className="h-[2px] flex-1 rounded-full bg-gradient-to-r from-transparent via-white/35 to-cyan-200/40" /><p className="max-w-[520px] text-center text-base font-semibold leading-snug text-white/90 drop-shadow-[0_4px_14px_rgba(0,0,0,0.18)]">{t.step1Subtitle}</p><div className="h-[2px] flex-1 rounded-full bg-gradient-to-l from-transparent via-white/35 to-cyan-200/40" /></div></div><div className="absolute left-16 top-[30%] max-w-[560px] text-left"><div className="mb-12"><h2 className="text-[2rem] font-bold leading-tight">{t.benefit1Title}</h2><p className="mt-2 text-[1.75rem] leading-[1.28]">{t.benefit1Text}</p></div><div className="mb-12"><h2 className="text-[2rem] font-bold leading-tight">{t.benefit2Title}</h2><p className="mt-2 text-[1.75rem] leading-[1.28]">{t.benefit2Text}</p></div><div><h2 className="text-[2rem] font-bold leading-tight">{t.benefit3Title}</h2><p className="mt-2 text-[1.75rem] leading-[1.28]">{t.benefit3Text}</p></div></div><Step1Account language={language} form={form} setForm={setForm} onNext={handleStep1} /><div className="absolute bottom-8 right-16 text-center text-[0.95rem]">{t.alreadyAccount} <Link href="/" className="font-semibold underline underline-offset-4">{t.login}</Link></div></>}
        {step === 2 && <Step2Biometrics language={language} biometrics={biometrics} setBiometrics={setBiometrics} onNext={() => setStep(3)} />}
        {step === 3 && <Step3Psychography language={language} psychography={psychography} setPsychography={setPsychography} onNext={() => setStep(4)} />}
        {step === 4 && <Step4Awakening language={language} isCreating={isCreating} onFinish={handleRegister} />}
      </div>
    </main>
  );
}
