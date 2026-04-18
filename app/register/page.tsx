"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@/types/user";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

type Language = "de" | "en";
type Step = 1 | 2 | 3 | 4;

const content = {
  de: {
    languageLabel: "Deutsch",
    footerPrivacy: "Datenschutz",
    footerImprint: "Impressum",
    footerTerms: "AGB",
    footerFaq: "FAQ",

    step1Title: "Starte dein Abenteuer\nmit WellFit!",
    step1Subtitle: "Registriere dich kostenlos und werde Teil unserer Community.",
    firstName: "Vorname",
    lastName: "Nachname",
    email: "E-Mail-Adresse eingeben",
    password: "Passwort erstellen",
    confirmPassword: "Passwort bestätigen",
    acceptPrefix: "Ich akzeptiere die ",
    privacyPolicy: "Datenschutzbestimmungen",
    and: " und ",
    terms: "AGB",
    registerNow: "Jetzt registrieren",
    alreadyAccount: "Bereits ein Konto?",
    login: "Anmelden",

    benefit1Title: "Bewege dich im Alltag",
    benefit1Text: "Deine Schritte, Workouts & Aktivitäten zählen.",
    benefit2Title: "Sammle Punkte",
    benefit2Text: "Verdiene Punkte und Belohnungen für jede Bewegung.",
    benefit3Title: "Level dein Tamagotchi auf",
    benefit3Text: "Spiele, sammle Belohnungen und steigere deinen Fortschritt.",

    biometricsPhase: "PHASE 02: BIOMETRIE",
    setupTitle: "KI-CHARAKTER SETUP",
    birthdate: "Geburtsdatum",
    gender: "Geschlecht",
    male: "Männlich",
    female: "Weiblich",
    diverse: "Divers",
    size: "Größe",
    weight: "Gewicht",
    bodyType: "Körperbau",
    slim: "Schlank",
    athletic: "Athletisch",
    strong: "Kraftvoll",
    targetWeight: "Zielgewicht anstreben",
    fitnessLevel: "Fitnesslevel",
    beginner: "Anfänger",
    medium: "Fortgeschritten",
    pro: "Profi",
    medication: "Medikamenteneinnahme?",
    yes: "Ja",
    no: "Nein",
    limitations: "Einschränkungen",
    sleepProfile: "Schlafprofil",
    nutrition: "Ernährung",
    hydration: "Hydrierung",
    drinkReminder: "Soll ich dich erinnern, etwas zu trinken?",
    drinkAmount: "Wie viel willst du am Tag trinken?",
    stressLevel: "Stresslevel",
    movementNature: "Bewegung in der Natur",
    scan: "Scan",
    nutritionAll: "Alles",
    nutritionVeggie: "Veggie",
    nutritionVegan: "Vegan",
    less6: "< 6h",
    between6and8: "6-8h",
    more8: "> 8h",
    sleepGood: "Gut",
    sleepMid: "Mittel",
    sleepBad: "Schlecht",
    move15: "15 - 30 Min.",
    move60: "~ 1 Stunde",
    moveMore: "> 1 Std.",
    next: "Weiter",

    psychPhase: "PHASE 03: PSYCHOGRAPHIE",
    tuningTitle: "BUDDY-TUNING",
    activeNow: "Wie aktiv bist du aktuell?",
    almostInactive: "Kaum aktiv",
    sometimes: "Gehe gelegentlich",
    regular: "Trainiere regelmäßig",
    veryActive: "Treibe ausreichend Sport",
    interests: "Was interessiert dich am meisten?",
    communityMode: "Community-Modus",
    publicBoard: "Öffentliches Leaderboard",
    privateSquads: "Nur private Squads",
    soloMode: "Einzelgänger-Modus",
    trainingTime: "Beste Trainingszeit",
    morning: "Morgens (Early Bird)",
    noon: "Mittags",
    evening: "Abends (Night Owl)",
    goals: "Was sind deine Ziele?",
    loseWeight: "Abnehmen",
    improveFitness: "Fitness steigern",
    stayHealthy: "Gesund bleiben",
    adventure: "Abenteuer erleben",
    activities: "Bevorzugte Aktivität",
    walking: "Gehen",
    running: "Laufen",
    cycling: "Radfahren",
    dancing: "Tanzen",
    workout: "Workout",
    relax: "Entspannung",
    biometricsEnable: "Biometrie jetzt aktivieren",
    activateLater: "Später aktivieren",
    createAvatar: "KI Analyse starten",

    awakenTitle: "Dein Avatar wird erschaffen",
    awakenText: "Die WellFit KI analysiert jetzt deine Angaben, erschafft deinen Buddy und erweckt ihn zum Leben.",
    awakenSub1: "Biometrie wird synchronisiert",
    awakenSub2: "Persönlichkeit wird kalibriert",
    awakenSub3: "Avatar-Kern wird aktiviert",
    awakenDone: "Avatar erfolgreich erweckt. Weiterleitung zum Dashboard...",
  },

  en: {
    languageLabel: "English",
    footerPrivacy: "Privacy",
    footerImprint: "Imprint",
    footerTerms: "Terms",
    footerFaq: "FAQ",

    step1Title: "Start your adventure\nwith WellFit!",
    step1Subtitle: "Register for free and become part of our community.",
    firstName: "First name",
    lastName: "Last name",
    email: "Enter your email address",
    password: "Create password",
    confirmPassword: "Confirm password",
    acceptPrefix: "I accept the ",
    privacyPolicy: "privacy policy",
    and: " and ",
    terms: "terms",
    registerNow: "Register now",
    alreadyAccount: "Already have an account?",
    login: "Sign in",

    benefit1Title: "Stay active every day",
    benefit1Text: "Your steps, workouts & activities count.",
    benefit2Title: "Collect points",
    benefit2Text: "Earn digital rewards for every move.",
    benefit3Title: "Level up your Tamagotchi",
    benefit3Text: "Play, collect rewards and improve your progress.",

    biometricsPhase: "PHASE 02: BIOMETRICS",
    setupTitle: "AI CHARACTER SETUP",
    birthdate: "Date of birth",
    gender: "Gender",
    male: "Male",
    female: "Female",
    diverse: "Diverse",
    size: "Height",
    weight: "Weight",
    bodyType: "Body type",
    slim: "Slim",
    athletic: "Athletic",
    strong: "Strong",
    targetWeight: "Aim for target weight",
    fitnessLevel: "Fitness level",
    beginner: "Beginner",
    medium: "Advanced",
    pro: "Pro",
    medication: "Taking medication?",
    yes: "Yes",
    no: "No",
    limitations: "Restrictions",
    sleepProfile: "Sleep profile",
    nutrition: "Nutrition",
    hydration: "Hydration",
    drinkReminder: "Should I remind you to drink?",
    drinkAmount: "How much do you want to drink per day?",
    stressLevel: "Stress level",
    movementNature: "Movement in nature",
    scan: "Scan",
    nutritionAll: "Everything",
    nutritionVeggie: "Veggie",
    nutritionVegan: "Vegan",
    less6: "< 6h",
    between6and8: "6-8h",
    more8: "> 8h",
    sleepGood: "Good",
    sleepMid: "Average",
    sleepBad: "Poor",
    move15: "15 - 30 min.",
    move60: "~ 1 hour",
    moveMore: "> 1 hour",
    next: "Next",

    psychPhase: "PHASE 03: PSYCHOGRAPHY",
    tuningTitle: "BUDDY TUNING",
    activeNow: "How active are you right now?",
    almostInactive: "Barely active",
    sometimes: "Sometimes active",
    regular: "Train regularly",
    veryActive: "Very active",
    interests: "What interests you most?",
    communityMode: "Community mode",
    publicBoard: "Public leaderboard",
    privateSquads: "Private squads only",
    soloMode: "Solo mode",
    trainingTime: "Best training time",
    morning: "Morning (Early Bird)",
    noon: "Noon",
    evening: "Evening (Night Owl)",
    goals: "What are your goals?",
    loseWeight: "Lose weight",
    improveFitness: "Improve fitness",
    stayHealthy: "Stay healthy",
    adventure: "Live adventure",
    activities: "Preferred activity",
    walking: "Walking",
    running: "Running",
    cycling: "Cycling",
    dancing: "Dancing",
    workout: "Workout",
    relax: "Relaxation",
    biometricsEnable: "Enable biometrics now",
    activateLater: "Activate later",
    createAvatar: "Start AI analysis",

    awakenTitle: "Your avatar is being created",
    awakenText: "The WellFit AI is now analyzing your data, creating your buddy and bringing it to life.",
    awakenSub1: "Synchronizing biometrics",
    awakenSub2: "Calibrating personality",
    awakenSub3: "Activating avatar core",
    awakenDone: "Avatar successfully awakened. Redirecting to dashboard...",
  },
} as const;

export default function RegisterPage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "de";
    }

    const savedLanguage = localStorage.getItem("wellfit-language") as Language | null;
    return savedLanguage === "de" || savedLanguage === "en" ? savedLanguage : "de";
  });
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [step, setStep] = useState<Step>(1);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [birthdate, setBirthdate] = useState("");
  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState(180);
  const [weight, setWeight] = useState(82);
  const [bodyType, setBodyType] = useState("slim");
  const [targetWeight, setTargetWeight] = useState(false);
  const [fitnessLevel, setFitnessLevel] = useState("beginner");
  const [medication, setMedication] = useState("no");
  const [limitations, setLimitations] = useState<string[]>([]);
  const [otherRestriction, setOtherRestriction] = useState("");
  const [sleepHours, setSleepHours] = useState("6-8");
  const [sleepQuality, setSleepQuality] = useState("good");
  const [nutrition, setNutrition] = useState("all");
  const [drinkReminder, setDrinkReminder] = useState("yes");
  const [drinkAmount, setDrinkAmount] = useState(2.5);
  const [stressLevel, setStressLevel] = useState(3);
  const [natureMove, setNatureMove] = useState("60");

  const [activityLevel, setActivityLevel] = useState("low");
  const [interests, setInterests] = useState<string[]>([]);
  const [communityMode, setCommunityMode] = useState("public");
  const [trainingTime, setTrainingTime] = useState("morning");
  const [goals, setGoals] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [enableBiometrics, setEnableBiometrics] = useState(false);

  const [awakeningProgress, setAwakeningProgress] = useState(0);

  useEffect(() => {
    if (step !== 4) return;

    const interval = setInterval(() => {
      setAwakeningProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 900);
          return 100;
        }
        return prev + 3;
      });
    }, 140);

    return () => clearInterval(interval);
  }, [step]);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("wellfit-language", lang);
    setShowLanguageMenu(false);
  };

  const t = useMemo(() => content[language], [language]);

  const toggleArrayValue = (
    value: string,
    current: string[],
    setter: (v: string[]) => void
  ) => {
    if (current.includes(value)) {
      setter(current.filter((item) => item !== value));
    } else {
      setter([...current, value]);
    }
  };

  const toggleLimitation = (value: string) =>
    toggleArrayValue(value, limitations, setLimitations);
  const toggleInterest = (value: string) =>
    toggleArrayValue(value, interests, setInterests);
  const toggleGoal = (value: string) => toggleArrayValue(value, goals, setGoals);
  const toggleActivity = (value: string) =>
    toggleArrayValue(value, activities, setActivities);

  const handleStep1 = () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      alert(language === "de" ? "Bitte fülle alle Felder aus." : "Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      alert(
        language === "de"
          ? "Die Passwörter stimmen nicht überein."
          : "Passwords do not match."
      );
      return;
    }
    if (!accepted) {
      alert(
        language === "de"
          ? "Bitte akzeptiere Datenschutz und AGB."
          : "Please accept privacy policy and terms."
      );
      return;
    }
    setStep(2);
  };

  const handleStep2 = () => {
    setStep(3);
  };

  const handleStep3 = async () => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUser = userCredential.user;

    await setDoc(doc(db, "users", firebaseUser.uid), {
      firstName,
      lastName,
      email,
      points: 0,
      xp: 0,
      energy: 100,
      level: 1,
      stepsToday: 0,
      currency: "points",

      avatar: {
        hunger: 100,
        mood: 100,
        energy: 100,
        level: 1,
      },

      inventory: [],

      profile: {
        birthdate,
        gender,
        height,
        weight,
        bodyType,
        targetWeight,
        fitnessLevel,
        medication,
        limitations,
        otherRestriction,
        sleepHours,
        sleepQuality,
        nutrition,
        drinkReminder,
        drinkAmount,
        stressLevel,
        natureMove,
        activityLevel,
        interests,
        communityMode,
        trainingTime,
        goals,
        activities,
        enableBiometrics,
      },

      createdAt: new Date().toISOString(),
    });

    setAwakeningProgress(0);
    setStep(4);
  } catch (error: any) {
    console.error("Registrierung fehlgeschlagen:", error);

    if (error.code === "auth/email-already-in-use") {
      alert(
        language === "de"
          ? "Diese E-Mail-Adresse wird bereits verwendet."
          : "This email address is already in use."
      );
      return;
    }

    if (error.code === "auth/invalid-email") {
      alert(
        language === "de"
          ? "Die E-Mail-Adresse ist ungültig."
          : "The email address is invalid."
      );
      return;
    }

    if (error.code === "auth/weak-password") {
      alert(
        language === "de"
          ? "Das Passwort ist zu schwach."
          : "The password is too weak."
      );
      return;
    }

    alert(
      language === "de"
        ? "Registrierung fehlgeschlagen. Bitte versuche es erneut."
        : "Registration failed. Please try again."
    );
  }
};

  const phaseText =
    awakeningProgress < 34
      ? t.awakenSub1
      : awakeningProgress < 68
        ? t.awakenSub2
        : t.awakenSub3;

  return (
    <main className="relative h-screen w-screen overflow-hidden text-white">
      <Image
        src="/login-bg.png"
        alt="WellFit Hintergrund"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-cyan-900/10" />

      <div className="relative h-full w-full">
        {/* Logo */}
        <div className="absolute left-8 top-8 h-28 w-36 lg:h-36 lg:w-44">
          <Image
            src="/logo.png"
            alt="WellFit Logo"
            fill
            priority
            className="object-contain object-left-top"
          />
        </div>

        {/* Sprache */}
        <div className="absolute right-12 top-10 z-20">
          <button
            type="button"
            onClick={() => setShowLanguageMenu((prev) => !prev)}
            className="flex items-center gap-3 text-2xl font-medium"
          >
            <Image
              src={language === "de" ? "/deutsch.png" : "/england.png"}
              alt={language === "de" ? "Deutsch" : "English"}
              width={32}
              height={22}
              className="rounded-sm object-cover"
            />
            <span>{t.languageLabel}</span>
            <span className="text-lg">⌄</span>
          </button>

          {showLanguageMenu && (
            <div className="mt-3 w-52 rounded-2xl border border-white/20 bg-black/30 p-2 backdrop-blur-md">
              <button
                type="button"
                onClick={() => changeLanguage("de")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-white/10"
              >
                <Image
                  src="/deutsch.png"
                  alt="Deutsch"
                  width={28}
                  height={18}
                  className="rounded-sm object-cover"
                />
                <span>Deutsch</span>
              </button>

              <button
                type="button"
                onClick={() => changeLanguage("en")}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-white/10"
              >
                <Image
                  src="/england.png"
                  alt="English"
                  width={28}
                  height={18}
                  className="rounded-sm object-cover"
                />
                <span>English</span>
              </button>
            </div>
          )}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="absolute left-16 top-[30%] max-w-[560px] text-left">
              <div className="mb-12">
        <h2 className="text-[2rem] font-bold leading-tight">
          {t.benefit1Title}
        </h2>
        <p className="mt-2 text-[1.75rem] leading-[1.28]">
          {t.benefit1Text}
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-[2rem] font-bold leading-tight">
          {t.benefit2Title}
        </h2>
        <p className="mt-2 text-[1.75rem] leading-[1.28]">
          {t.benefit2Text}
        </p>
      </div>

      <div>
        <h2 className="text-[2rem] font-bold leading-tight">
          {t.benefit3Title}
        </h2>
        <p className="mt-2 text-[1.75rem] leading-[1.28]">
          {t.benefit3Text}
        </p>
      </div>
    </div>

    <div className="absolute right-16 top-[15%] z-20 w-[500px] rounded-[34px] bg-cyan-500/25 px-7 py-6 backdrop-blur-sm">
      <h1 className="whitespace-pre-line text-[2.45rem] font-bold leading-[1.05]">
        {t.step1Title}
      </h1>

      <p className="mt-3 text-[1rem] leading-[1.25]">
        {t.step1Subtitle}
      </p>

      <div className="mt-4 space-y-2.5">
        <input
          type="text"
          placeholder={t.firstName}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="h-[48px] w-full rounded-lg bg-white px-4 text-[15px] text-gray-700 outline-none"
        />

        <input
          type="text"
          placeholder={t.lastName}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="h-[48px] w-full rounded-lg bg-white px-4 text-[15px] text-gray-700 outline-none"
        />

        <input
          type="email"
          placeholder={t.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-[48px] w-full rounded-lg bg-white px-4 text-[15px] text-gray-700 outline-none"
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-[48px] w-full rounded-lg bg-white px-4 pr-12 text-[15px] text-gray-700 outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 text-lg text-gray-500"
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <input
          type={showPassword ? "text" : "password"}
          placeholder={t.confirmPassword}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="h-[48px] w-full rounded-lg bg-white px-4 text-[15px] text-gray-700 outline-none"
        />
      </div>

      <label className="mt-3 flex items-start gap-3 text-[0.88rem] leading-snug">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1 h-4 w-4 shrink-0"
        />
        <span>
          {t.acceptPrefix}
          <Link href="/datenschutz" className="underline">
            {t.privacyPolicy}
          </Link>
          {t.and}
          <Link href="/agb" className="underline">
            {language === "de" ? "AGB" : "terms"}
          </Link>
        </span>
      </label>

      <button
        type="button"
        onClick={handleStep1}
        className="mt-4 h-[52px] w-full rounded-lg bg-[#156fd1] text-[1.08rem] font-medium transition hover:bg-[#0f63bb]"
      >
        {t.registerNow}
      </button>

      <div className="mt-3 text-center text-[0.95rem]">
        {t.alreadyAccount}{" "}
        <Link href="/" className="font-semibold underline underline-offset-4">
          {t.login}
        </Link>
      </div>
    </div>
  </>
)}

        {/* STEP 2 */}
        {step === 2 && (
          <>
            <div className="absolute right-14 top-8 text-[1.35rem] tracking-[0.16em] text-white/50">
            {t.biometricsPhase}
            </div>

            <div className="absolute left-1/2 top-20 -translate-x-1/2 text-center">
              <h1 className="text-[1.6rem] font-bold tracking-[0.08em] text-white/35">
              {t.setupTitle}
              </h1>
            </div>

            <div className="absolute left-8 top-28 w-[46%] scale-[0.88] origin-top-left space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <Panel title={t.birthdate}>
                  <input
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="h-12 w-full rounded-lg bg-white/10 px-3 text-white outline-none"
                  />
                </Panel>

                <Panel title={t.size}>
                  <input
                    type="range"
                    min={140}
                    max={220}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-2 text-center text-3xl font-bold">{height} cm</div>
                </Panel>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Panel title={t.gender}>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="h-12 w-full rounded-lg bg-white/10 px-3 text-white outline-none"
                  >
                    <option value="male">{t.male}</option>
                    <option value="female">{t.female}</option>
                    <option value="diverse">{t.diverse}</option>
                  </select>
                </Panel>

                <Panel title={t.weight}>
                  <input
                    type="range"
                    min={35}
                    max={180}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-2 text-center text-3xl font-bold">{weight} kg</div>
                </Panel>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Panel title={t.bodyType}>
                  <select
                    value={bodyType}
                    onChange={(e) => setBodyType(e.target.value)}
                    className="h-12 w-full rounded-lg bg-white/10 px-3 text-white outline-none"
                  >
                    <option value="slim">{t.slim}</option>
                    <option value="athletic">{t.athletic}</option>
                    <option value="strong">{t.strong}</option>
                  </select>
                  <label className="mt-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={targetWeight}
                      onChange={(e) => setTargetWeight(e.target.checked)}
                    />
                    <span>{t.targetWeight}</span>
                  </label>
                </Panel>

                <Panel title={t.fitnessLevel}>
                  <select
                    value={fitnessLevel}
                    onChange={(e) => setFitnessLevel(e.target.value)}
                    className="mb-4 h-12 w-full rounded-lg bg-white/10 px-3 text-white outline-none"
                  >
                    <option value="beginner">{t.beginner}</option>
                    <option value="medium">{t.medium}</option>
                    <option value="pro">{t.pro}</option>
                  </select>

                  <div className="mb-2">{t.medication}</div>
                  <div className="flex gap-5">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="medication"
                        checked={medication === "yes"}
                        onChange={() => setMedication("yes")}
                      />
                      {t.yes}
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="medication"
                        checked={medication === "no"}
                        onChange={() => setMedication("no")}
                      />
                      {t.no}
                    </label>
                  </div>
                </Panel>
              </div>

              <div className="grid grid-cols-[1.1fr_1.1fr_1fr] gap-3">
                <Panel title={t.limitations}>
                  <div className="mb-3 flex flex-wrap gap-4 text-sm">
                    {["Rücken", "Knie", "Herz", "Asthma"].map((item) => (
                      <label key={item} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={limitations.includes(item)}
                          onChange={() => toggleLimitation(item)}
                        />
                        {item}
                      </label>
                    ))}
                  </div>
                  <textarea
                    placeholder={language === "de" ? "Sonstiges..." : "Other..."}
                    value={otherRestriction}
                    onChange={(e) => setOtherRestriction(e.target.value)}
                    className="h-28 w-full rounded-lg bg-white px-3 py-3 text-gray-700 outline-none"
                  />
                </Panel>

                <Panel title={t.sleepProfile}>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: "lt6", l: t.less6 },
                      { v: "6-8", l: t.between6and8 },
                      { v: "gt8", l: t.more8 },
                    ].map((item) => (
                      <Choice
                        key={item.v}
                        active={sleepHours === item.v}
                        onClick={() => setSleepHours(item.v)}
                        label={item.l}
                      />
                    ))}
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {[
                      { v: "good", l: t.sleepGood },
                      { v: "mid", l: t.sleepMid },
                      { v: "bad", l: t.sleepBad },
                    ].map((item) => (
                      <Choice
                        key={item.v}
                        active={sleepQuality === item.v}
                        onClick={() => setSleepQuality(item.v)}
                        label={item.l}
                      />
                    ))}
                  </div>
                </Panel>

                <Panel title={t.nutrition}>
                  <div className="grid h-full grid-cols-3 gap-2">
                    {[
                      { v: "all", l: t.nutritionAll },
                      { v: "veggie", l: t.nutritionVeggie },
                      { v: "vegan", l: t.nutritionVegan },
                    ].map((item) => (
                      <Choice
                        key={item.v}
                        active={nutrition === item.v}
                        onClick={() => setNutrition(item.v)}
                        label={item.l}
                        tall
                      />
                    ))}
                  </div>
                </Panel>
              </div>

              <div className="grid grid-cols-[1.3fr_1fr] gap-3">
                <Panel title={t.stressLevel}>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={stressLevel}
                    onChange={(e) => setStressLevel(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-2 text-center text-3xl font-bold">
                    {language === "de" ? "Level" : "Level"}: {stressLevel}
                  </div>
                  <div className="mt-1 flex justify-between text-sm text-white/70">
                    <span>{language === "de" ? "1 (Wenig)" : "1 (Low)"}</span>
                    <span>{language === "de" ? "5 (Sehr gestresst)" : "5 (Very stressed)"}</span>
                  </div>
                </Panel>

                <Panel title={t.movementNature}>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: "15", l: t.move15 },
                      { v: "60", l: t.move60 },
                      { v: "90", l: t.moveMore },
                    ].map((item) => (
                      <Choice
                        key={item.v}
                        active={natureMove === item.v}
                        onClick={() => setNatureMove(item.v)}
                        label={item.l}
                        tall
                      />
                    ))}
                  </div>
                </Panel>
              </div>
            </div>

            <div className="absolute right-8 top-[7.5rem] w-[41%] scale-[0.88] origin-top-right">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div />
                  <button className="rounded-xl bg-black/20 px-4 py-2 text-sm">{t.scan}</button>
                </div>

                <div className="flex items-center justify-between px-3">
                  <button className="text-6xl text-white/35">‹</button>

                  <div className="text-center">
                    <div className="relative mx-auto h-60 w-60">
                      <Image
                        src="/Mascottchen rechts.png"
                        alt="Avatar"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="mt-4 text-4xl font-bold text-white/40">FLAMMI</div>
                    <div className="mt-2 text-lg text-white/60">
                      {language === "de"
                        ? "Drachen-Klasse | Feuer-Element"
                        : "Dragon class | Fire element"}
                    </div>
                  </div>

                  <button className="text-6xl text-white/35">›</button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-[1.2fr_1fr] gap-3">
                <Panel title={t.hydration}>
                  <div className="mb-3">{t.drinkReminder}</div>
                  <div className="mb-4 flex gap-5">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="drink"
                        checked={drinkReminder === "yes"}
                        onChange={() => setDrinkReminder("yes")}
                      />
                      {t.yes}
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="drink"
                        checked={drinkReminder === "no"}
                        onChange={() => setDrinkReminder("no")}
                      />
                      {t.no}
                    </label>
                  </div>
                  <div className="mb-2">{t.drinkAmount}</div>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    step={0.5}
                    value={drinkAmount}
                    onChange={(e) => setDrinkAmount(Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="mt-2 text-center text-3xl font-bold">
                    {drinkAmount.toFixed(1)} {language === "de" ? "Liter" : "Liters"}
                  </div>
                </Panel>

                <div className="flex items-end">
                  <button
                    onClick={handleStep2}
                    className="h-16 w-full rounded-xl bg-[#156fd1] text-2xl font-bold hover:bg-[#0f63bb]"
                  >
                    {t.next}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <>
            <div className="absolute right-14 top-8 text-[1.35rem] tracking-[0.16em] text-white/50">
              {t.psychPhase}
            </div>

            <div className="absolute left-1/2 top-[5.5rem] -translate-x-1/2 text-center">
              <h1 className="text-[1.6rem] font-bold tracking-[0.08em] text-white/35">
                {t.tuningTitle}
              </h1>
            </div>

            <div className="absolute left-6 right-6 top-30 scale-[0.88] origin-top">
              <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4">
                <Panel title={t.activeNow}>
                  <div className="space-y-3">
                    {[
                      { v: "low", l: t.almostInactive },
                      { v: "sometimes", l: t.sometimes },
                      { v: "regular", l: t.regular },
                      { v: "high", l: t.veryActive },
                    ].map((item) => (
                      <ChoiceRow
                        key={item.v}
                        active={activityLevel === item.v}
                        onClick={() => setActivityLevel(item.v)}
                        label={item.l}
                      />
                    ))}
                  </div>
                </Panel>

                <Panel title={t.interests}>
                  <div className="space-y-3">
                    {[
                      "Spiel & Erfahrung",
                      "Fitness & Gesundheit",
                      "Ernährung & Wissen",
                      "Natur & Entdecken",
                    ].map((item, idx) => {
                      const label =
                        language === "de"
                          ? item
                          : [
                              "Play & experience",
                              "Fitness & health",
                              "Nutrition & knowledge",
                              "Nature & discovery",
                            ][idx];
                      return (
                        <CheckRow
                          key={item}
                          checked={interests.includes(item)}
                          onClick={() => toggleInterest(item)}
                          label={label}
                        />
                      );
                    })}
                  </div>
                </Panel>

                <Panel title={t.communityMode}>
                  <div className="space-y-3">
                    {[
                      { v: "public", l: t.publicBoard },
                      { v: "private", l: t.privateSquads },
                      { v: "solo", l: t.soloMode },
                    ].map((item) => (
                      <ChoiceRow
                        key={item.v}
                        active={communityMode === item.v}
                        onClick={() => setCommunityMode(item.v)}
                        label={item.l}
                      />
                    ))}
                  </div>
                </Panel>

                <Panel title={t.trainingTime}>
                  <div className="space-y-3">
                    {[
                      { v: "morning", l: t.morning },
                      { v: "noon", l: t.noon },
                      { v: "evening", l: t.evening },
                    ].map((item) => (
                      <ChoiceRow
                        key={item.v}
                        active={trainingTime === item.v}
                        onClick={() => setTrainingTime(item.v)}
                        label={item.l}
                      />
                    ))}
                  </div>
                </Panel>
              </div>

              <div className="mt-4 grid grid-cols-[1fr_2fr] gap-4">
                <Panel title={t.goals}>
                  <div className="space-y-3">
                    {[
                      { v: "lose", l: t.loseWeight },
                      { v: "fit", l: t.improveFitness },
                      { v: "health", l: t.stayHealthy },
                      { v: "adventure", l: t.adventure },
                    ].map((item) => (
                      <CheckRow
                        key={item.v}
                        checked={goals.includes(item.v)}
                        onClick={() => toggleGoal(item.v)}
                        label={item.l}
                      />
                    ))}
                  </div>
                </Panel>

                <Panel title={t.activities}>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { v: "walk", l: t.walking },
                      { v: "run", l: t.running },
                      { v: "bike", l: t.cycling },
                      { v: "dance", l: t.dancing },
                      { v: "workout", l: t.workout },
                      { v: "relax", l: t.relax },
                    ].map((item) => (
                      <CheckTile
                        key={item.v}
                        checked={activities.includes(item.v)}
                        onClick={() => toggleActivity(item.v)}
                        label={item.l}
                      />
                    ))}
                  </div>
                </Panel>
              </div>

              <div className="mt-4 grid grid-cols-[2fr_1fr] gap-4">
                <Panel title={language === "de" ? "Geräte-Sicherheit" : "Device security"}>
                  <div className="mb-4 text-white/80">
                    {language === "de"
                      ? "Möchtest du Face ID oder Touch ID aktivieren, um dich später blitzschnell in der App einzuloggen?"
                      : "Would you like to enable Face ID or Touch ID so you can log in to the app instantly later on?"}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setEnableBiometrics(true)}
                      className={`h-14 flex-1 rounded-xl border ${
                        enableBiometrics
                          ? "border-cyan-300 bg-cyan-500/20"
                          : "border-white/15 bg-black/10"
                      }`}
                    >
                      {t.biometricsEnable}
                    </button>

                    <button
                      onClick={() => setEnableBiometrics(false)}
                      className={`h-14 flex-1 rounded-xl border ${
                        !enableBiometrics
                          ? "border-cyan-300 bg-cyan-500/20"
                          : "border-white/15 bg-black/10"
                      }`}
                    >
                      {t.activateLater}
                    </button>
                  </div>
                </Panel>

                <div className="flex items-end">
                  <button
                    onClick={handleStep3}
                    className="h-16 w-full rounded-xl bg-[#156fd1] text-2xl font-bold hover:bg-[#0f63bb]"
                  >
                    {t.createAvatar}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* STEP 4 */}
        {step === 4 && (
  <div className="absolute inset-0 overflow-hidden">
    {/* Hintergrund-Glow */}
    <div className="absolute inset-0 bg-black/20" />
    <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/10 blur-3xl" />
    <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/10 blur-2xl" />

    {/* Content */}
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
      <div className="relative mb-8 h-72 w-72">
        {/* äußerer Ring */}
        <div className="absolute inset-0 animate-spin rounded-full border border-cyan-300/20 border-t-cyan-300/80" style={{ animationDuration: "10s" }} />
        <div className="absolute inset-[14px] animate-spin rounded-full border border-white/10 border-b-blue-300/60" style={{ animationDuration: "6s", animationDirection: "reverse" }} />

        {/* Puls-Glow */}
        <div className="absolute inset-[42px] animate-pulse rounded-full bg-cyan-300/10 blur-2xl" />

        {/* Avatar */}
        <div className="absolute inset-[36px]">
          <Image
            src="/Mascottchen rechts.png"
            alt="Avatar awakening"
            fill
            className="object-contain drop-shadow-[0_0_28px_rgba(120,255,255,0.45)]"
          />
        </div>
      </div>

      <div className="max-w-[900px]">
        <h1 className="text-5xl font-bold tracking-tight lg:text-6xl">
          {t.awakenTitle}
        </h1>

        <p className="mx-auto mt-5 max-w-[760px] text-xl leading-relaxed text-white/85 lg:text-2xl">
          {t.awakenText}
        </p>
      </div>

      {/* Statusbox */}
      <div className="mt-10 w-full max-w-[760px] rounded-[28px] border border-white/10 bg-black/20 px-8 py-7 backdrop-blur-md">
        <div className="mb-4 text-lg uppercase tracking-[0.25em] text-cyan-200/80">
          WellFit AI Sequence
        </div>

        <div className="mb-5 text-2xl font-semibold text-white">
          {phaseText}
        </div>

        <div className="h-5 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-green-400 transition-all duration-200"
            style={{ width: `${awakeningProgress}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-white/70 lg:text-base">
          <span>
            {language === "de" ? "Systeminitialisierung" : "System initialization"}
          </span>
          <span>{awakeningProgress}%</span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 text-left lg:grid-cols-3">
          <StatusLine
            active={awakeningProgress >= 8}
            done={awakeningProgress >= 34}
            text={t.awakenSub1}
          />
          <StatusLine
            active={awakeningProgress >= 35}
            done={awakeningProgress >= 68}
            text={t.awakenSub2}
          />
          <StatusLine
            active={awakeningProgress >= 69}
            done={awakeningProgress >= 100}
            text={t.awakenSub3}
          />
        </div>

        {awakeningProgress >= 100 && (
          <div className="mt-6 text-lg font-medium text-green-300">
            {t.awakenDone}
          </div>
        )}
      </div>
    </div>
  </div>
)}

        {/* Coin */}
        {step === 1 && (
          <div className="pointer-events-none absolute bottom-10 left-1/2 h-[90px] w-[90px] -translate-x-1/2 lg:h-[115px] lg:w-[115px]">
    <Image
      src="/coin.png"
      alt="WellFit Coin"
      fill
      className="object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.28)]"
    />
  </div>
        )}

        {/* Footer nur in Step 1 */}
        {step === 1 && (
          <footer className="absolute bottom-6 left-8 right-8 flex items-center justify-between text-[17px] text-white/90">
            <div className="flex gap-8">
              <Link href="/datenschutz">{t.footerPrivacy}</Link>
              <Link href="/impressum">{t.footerImprint}</Link>
              <Link href="/agb">{t.footerTerms}</Link>
              <Link href="/faq">{t.footerFaq}</Link>
            </div>

            <div className="flex items-center gap-6 text-[26px] font-bold">
              <span>f</span>
              <span>in</span>
              <span>x</span>
            </div>
          </footer>
        )}
      </div>
    </main>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a5d66]/95 p-3 shadow-lg">
      <div className="mb-2 border-b border-white/10 pb-2 text-[1rem] font-bold uppercase tracking-wide text-cyan-200">
        {title}
      </div>
      {children}
    </div>
  );
}

function Choice({
  active,
  onClick,
  label,
  tall = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  tall?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 text-center text-[0.95rem] transition ${
        tall ? "h-24" : "h-12"
      } ${
        active
          ? "border-cyan-300 bg-cyan-500/20 text-white"
          : "border-white/10 bg-white/5 text-white/85 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

function ChoiceRow({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 w-full items-center gap-3 rounded-xl border px-4 text-left transition ${
        active
          ? "border-cyan-300 bg-cyan-500/20 text-cyan-100"
          : "border-white/10 bg-white/5 text-white/90 hover:bg-white/10"
      }`}
    >
      <span className="text-base">{active ? "◉" : "○"}</span>
      <span className="text-[1rem] font-medium">{label}</span>
    </button>
  );
}

function CheckRow({
  checked,
  onClick,
  label,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-14 w-full items-center gap-3 rounded-xl border px-5 text-left transition ${
        checked
          ? "border-cyan-300 bg-cyan-500/20 text-cyan-100"
          : "border-white/10 bg-white/5 text-white/90 hover:bg-white/10"
      }`}
    >
      <span className="text-xl">{checked ? "☑" : "☐"}</span>
      <span className="text-xl font-medium">{label}</span>
    </button>
  );
}

function CheckTile({
  checked,
  onClick,
  label,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-24 items-center gap-3 rounded-xl border px-4 text-left transition ${
        checked
          ? "border-cyan-300 bg-cyan-500/20 text-cyan-100"
          : "border-white/10 bg-white/5 text-white/90 hover:bg-white/10"
      }`}
    >
      <span className="text-base">{checked ? "☑" : "☐"}</span>
      <span className="text-[1.05rem] font-medium">{label}</span>
    </button>
  );
}
function StatusLine({
  active,
  done,
  text,
}: {
  active: boolean;
  done: boolean;
  text: string;
}) {
  return (
    <div
      className={`rounded-2xl border px-4 py-4 transition ${
        done
          ? "border-green-300/40 bg-green-400/10 text-green-200"
          : active
            ? "border-cyan-300/40 bg-cyan-400/10 text-cyan-100"
            : "border-white/10 bg-white/5 text-white/55"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">
          {done ? "●" : active ? "◉" : "○"}
        </span>
        <span className="text-[0.95rem] font-medium lg:text-base">{text}</span>
      </div>
    </div>
  );
}