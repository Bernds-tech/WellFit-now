"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import SettingsHeader from "./components/SettingsHeader";
import AppSidebar from "@/app/AppSidebar";

import ToggleButton from "./components/ToggleButton";
import SensitiveNotice from "./components/SensitiveNotice";
import type {
  PermissionKey,
  ProfileForm,
  BiometricsForm,
  NotificationsForm,
  VitalValuesForm,
  AiBuddyForm,
  LifestyleForm,
  ActivityForm,
  PrivacyForm,
} from "./types";
import {
  defaultPermissions,
  defaultProfile,
  defaultBiometrics,
  defaultNotifications,
  defaultVitalValues,
  defaultAiBuddy,
  defaultLifestyle,
  defaultActivity,
  defaultPrivacy,
} from "./lib/settingsDefaults";
import {
  genderToDisplay,
  genderToStorage,
  bodyTypeToDisplay,
  bodyTypeToStorage,
  fitnessLevelToDisplay,
  fitnessLevelToStorage,
  arrayToText,
  textToArray,
} from "./lib/settingsMappers";

export default function SettingsPage() {
  const [brightness, setBrightness] = useState(100);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [profile, setProfile] = useState<ProfileForm>(defaultProfile);
  const [biometrics, setBiometrics] =
    useState<BiometricsForm>(defaultBiometrics);
  const [notifications, setNotifications] =
    useState<NotificationsForm>(defaultNotifications);
  const [vitalValues, setVitalValues] =
    useState<VitalValuesForm>(defaultVitalValues);
  const [aiBuddy, setAiBuddy] = useState<AiBuddyForm>(defaultAiBuddy);
  const [lifestyle, setLifestyle] = useState<LifestyleForm>(defaultLifestyle);
  const [activity, setActivity] = useState<ActivityForm>(defaultActivity);
  const [privacy, setPrivacy] = useState<PrivacyForm>(defaultPrivacy);

  useEffect(() => {
    const savedPermissions = localStorage.getItem("wellfit-permissions");
    if (savedPermissions) {
      try {
        setPermissions((prev) => ({
          ...prev,
          ...JSON.parse(savedPermissions),
        }));
      } catch (error) {
        console.error("Fehler beim Laden der Berechtigungen", error);
      }
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setIsLoadingUser(true);
      setSaveMessage("Lade Einstellungen...");
      if (!firebaseUser) {
        setUserId(null);
        setProfile(defaultProfile);
        setBiometrics(defaultBiometrics);
        setNotifications(defaultNotifications);
        setVitalValues(defaultVitalValues);
        setAiBuddy(defaultAiBuddy);
        setLifestyle(defaultLifestyle);
        setActivity(defaultActivity);
        setPrivacy(defaultPrivacy);
        setIsLoadingUser(false);
        setSaveMessage("Nicht eingeloggt.");
        return;
      }
      setUserId(firebaseUser.uid);
      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const fallbackProfile: ProfileForm = {
            ...defaultProfile,
            displayName: firebaseUser.displayName ?? "",
            email: firebaseUser.email ?? "",
          };
          await setDoc(
            userRef,
            {
              firstName: firebaseUser.displayName?.split(" ")[0] ?? "",
              lastName:
                firebaseUser.displayName?.split(" ").slice(1).join(" ") ?? "",
              email: firebaseUser.email ?? "",
              points: 0,
              xp: 0,
              energy: 100,
              level: 1,
              stepsToday: 0,
              currency: "points",
              avatar: { hunger: 100, mood: 100, energy: 100, level: 1 },
              profile: {
                birthdate: "",
                gender: "male",
                height: Number(defaultBiometrics.height),
                weight: Number(defaultBiometrics.weight),
                targetWeight: defaultBiometrics.targetWeightEnabled,
                targetWeightValue: Number(defaultBiometrics.targetWeight),
                bodyType: bodyTypeToStorage(defaultBiometrics.bodyType),
                fitnessLevel: fitnessLevelToStorage(
                  defaultBiometrics.fitnessLevel,
                ),
                otherRestriction: defaultBiometrics.limitations,
                vitals: defaultVitalValues,
                aiBuddy: defaultAiBuddy,
                lifestyle: defaultLifestyle,
                activity: defaultActivity,
              },
              settings: {
                ...fallbackProfile,
                permissions: defaultPermissions,
                reminders: defaultNotifications,
                privacy: defaultPrivacy,
              },
              createdAt: new Date().toISOString(),
            },
            { merge: true },
          );
          setProfile(fallbackProfile);
          setBiometrics(defaultBiometrics);
          setNotifications(defaultNotifications);
          setVitalValues(defaultVitalValues);
          setAiBuddy(defaultAiBuddy);
          setLifestyle(defaultLifestyle);
          setActivity(defaultActivity);
          setPrivacy(defaultPrivacy);
          setSaveMessage("Profil wurde neu angelegt.");
          setIsLoadingUser(false);
          return;
        }
        const data = userSnap.data();
        const storedProfile = (data.profile ?? {}) as Record<string, any>;
        const storedVitals = (storedProfile.vitals ?? {}) as Record<
          string,
          any
        >;
        const storedAiBuddy = (storedProfile.aiBuddy ?? {}) as Record<
          string,
          any
        >;
        const storedLifestyle = (storedProfile.lifestyle ?? {}) as Record<
          string,
          any
        >;
        const storedActivity = (storedProfile.activity ?? {}) as Record<
          string,
          any
        >;
        const storedSettings = (data.settings ?? {}) as Record<string, any>;
        const storedReminders = (storedSettings.reminders ?? {}) as Record<
          string,
          any
        >;
        const storedPrivacy = (storedSettings.privacy ?? {}) as Record<
          string,
          any
        >;
        const storedPermissions =
          (storedSettings.permissions as
            | Partial<typeof defaultPermissions>
            | undefined) ?? undefined;
        const firstName =
          typeof data.firstName === "string" ? data.firstName : "";
        const lastName = typeof data.lastName === "string" ? data.lastName : "";
        const displayNameFromUser = `${firstName} ${lastName}`.trim();
        setProfile({
          displayName:
            (storedSettings.displayName as string | undefined) ??
            displayNameFromUser ??
            firebaseUser.displayName ??
            "",
          email:
            (storedSettings.email as string | undefined) ??
            (typeof data.email === "string"
              ? data.email
              : (firebaseUser.email ?? "")),
          phone: (storedSettings.phone as string | undefined) ?? "",
          language:
            (storedSettings.language as string | undefined) ?? "Deutsch",
          birthDate:
            (storedSettings.birthDate as string | undefined) ??
            (storedProfile.birthdate as string | undefined) ??
            "",
          gender:
            (storedSettings.gender as string | undefined) ??
            genderToDisplay(storedProfile.gender as string | undefined),
          timezone:
            (storedSettings.timezone as string | undefined) ?? "Europe/Vienna",
          units: (storedSettings.units as string | undefined) ?? "kg / km",
        });
        setBiometrics({
          height: String(storedProfile.height ?? defaultBiometrics.height),
          weight: String(storedProfile.weight ?? defaultBiometrics.weight),
          targetWeightEnabled:
            (storedProfile.targetWeight as boolean | undefined) ??
            defaultBiometrics.targetWeightEnabled,
          targetWeight: String(
            storedProfile.targetWeightValue ??
              storedSettings.targetWeight ??
              defaultBiometrics.targetWeight,
          ),
          bodyType: bodyTypeToDisplay(
            storedProfile.bodyType as string | undefined,
          ),
          fitnessLevel: fitnessLevelToDisplay(
            storedProfile.fitnessLevel as string | undefined,
          ),
          limitations:
            (storedProfile.otherRestriction as string | undefined) ??
            (Array.isArray(storedProfile.limitations)
              ? storedProfile.limitations.join(", ")
              : defaultBiometrics.limitations),
        });
        setVitalValues({
          bodyFat: String(storedVitals.bodyFat ?? ""),
          restingPulse: String(storedVitals.restingPulse ?? ""),
          averagePulse: String(storedVitals.averagePulse ?? ""),
          bloodPressure: String(storedVitals.bloodPressure ?? ""),
          sleepHours: String(storedVitals.sleepHours ?? ""),
          sleepQuality:
            (storedVitals.sleepQuality as string | undefined) ??
            defaultVitalValues.sleepQuality,
          stressLevel:
            (storedVitals.stressLevel as string | undefined) ??
            defaultVitalValues.stressLevel,
          energyLevel:
            (storedVitals.energyLevel as string | undefined) ??
            defaultVitalValues.energyLevel,
          painLevel:
            (storedVitals.painLevel as string | undefined) ??
            defaultVitalValues.painLevel,
          medicationNote:
            (storedVitals.medicationNote as string | undefined) ??
            defaultVitalValues.medicationNote,
          healthNotes:
            (storedVitals.healthNotes as string | undefined) ??
            defaultVitalValues.healthNotes,
        });
        setAiBuddy({
          avatarType:
            (storedAiBuddy.avatarType as string | undefined) ??
            defaultAiBuddy.avatarType,
          personality:
            (storedAiBuddy.personality as string | undefined) ??
            defaultAiBuddy.personality,
          relationshipMode:
            (storedAiBuddy.relationshipMode as string | undefined) ??
            defaultAiBuddy.relationshipMode,
          behaviorDynamics:
            (storedAiBuddy.behaviorDynamics as string | undefined) ??
            defaultAiBuddy.behaviorDynamics,
          motivationStyle:
            (storedAiBuddy.motivationStyle as string | undefined) ??
            defaultAiBuddy.motivationStyle,
          reactsToStress:
            (storedAiBuddy.reactsToStress as boolean | undefined) ??
            defaultAiBuddy.reactsToStress,
          reactsToSleep:
            (storedAiBuddy.reactsToSleep as boolean | undefined) ??
            defaultAiBuddy.reactsToSleep,
          reactsToActivity:
            (storedAiBuddy.reactsToActivity as boolean | undefined) ??
            defaultAiBuddy.reactsToActivity,
          reactsToMood:
            (storedAiBuddy.reactsToMood as boolean | undefined) ??
            defaultAiBuddy.reactsToMood,
        });
        setLifestyle({
          nutrition:
            (storedLifestyle.nutrition as string | undefined) ??
            (storedProfile.nutrition as string | undefined) ??
            defaultLifestyle.nutrition,
          mealRhythm:
            (storedLifestyle.mealRhythm as string | undefined) ??
            defaultLifestyle.mealRhythm,
          drinkReminder:
            (storedLifestyle.drinkReminder as string | undefined) ??
            (storedProfile.drinkReminder as string | undefined) ??
            defaultLifestyle.drinkReminder,
          drinkAmount: String(
            storedLifestyle.drinkAmount ??
              storedProfile.drinkAmount ??
              defaultLifestyle.drinkAmount,
          ),
          caffeineIntake:
            (storedLifestyle.caffeineIntake as string | undefined) ??
            defaultLifestyle.caffeineIntake,
          alcoholFrequency:
            (storedLifestyle.alcoholFrequency as string | undefined) ??
            defaultLifestyle.alcoholFrequency,
          sleepRoutine:
            (storedLifestyle.sleepRoutine as string | undefined) ??
            defaultLifestyle.sleepRoutine,
          natureMove:
            (storedLifestyle.natureMove as string | undefined) ??
            (storedProfile.natureMove as string | undefined) ??
            defaultLifestyle.natureMove,
          stressCoping:
            (storedLifestyle.stressCoping as string | undefined) ??
            defaultLifestyle.stressCoping,
          screenTime:
            (storedLifestyle.screenTime as string | undefined) ??
            defaultLifestyle.screenTime,
          notes: (storedLifestyle.notes as string | undefined) ?? "",
        });
        setActivity({
          activityLevel:
            (storedActivity.activityLevel as string | undefined) ??
            (storedProfile.activityLevel as string | undefined) ??
            defaultActivity.activityLevel,
          trainingTime:
            (storedActivity.trainingTime as string | undefined) ??
            (storedProfile.trainingTime as string | undefined) ??
            defaultActivity.trainingTime,
          communityMode:
            (storedActivity.communityMode as string | undefined) ??
            (storedProfile.communityMode as string | undefined) ??
            defaultActivity.communityMode,
          interests: arrayToText(
            storedActivity.interests ?? storedProfile.interests,
            defaultActivity.interests,
          ),
          activities: arrayToText(
            storedActivity.activities ?? storedProfile.activities,
            defaultActivity.activities,
          ),
          goals: arrayToText(
            storedActivity.goals ?? storedProfile.goals,
            defaultActivity.goals,
          ),
          preferredMissionTypes: arrayToText(
            storedActivity.preferredMissionTypes,
            defaultActivity.preferredMissionTypes,
          ),
          socialPreference:
            (storedActivity.socialPreference as string | undefined) ??
            defaultActivity.socialPreference,
          competitionMode:
            (storedActivity.competitionMode as string | undefined) ??
            defaultActivity.competitionMode,
          notes: (storedActivity.notes as string | undefined) ?? "",
        });
        setPrivacy({
          leaderboardVisible:
            (storedPrivacy.leaderboardVisible as boolean | undefined) ??
            defaultPrivacy.leaderboardVisible,
          buddySharing:
            (storedPrivacy.buddySharing as boolean | undefined) ??
            defaultPrivacy.buddySharing,
          anonymousAnalytics:
            (storedPrivacy.anonymousAnalytics as boolean | undefined) ??
            defaultPrivacy.anonymousAnalytics,
          friendRequests:
            (storedPrivacy.friendRequests as boolean | undefined) ??
            defaultPrivacy.friendRequests,
          teamInvitations:
            (storedPrivacy.teamInvitations as boolean | undefined) ??
            defaultPrivacy.teamInvitations,
          localUsersVisible:
            (storedPrivacy.localUsersVisible as boolean | undefined) ??
            defaultPrivacy.localUsersVisible,
          pvpAllowed:
            (storedPrivacy.pvpAllowed as boolean | undefined) ??
            defaultPrivacy.pvpAllowed,
          profileVisibility:
            (storedPrivacy.profileVisibility as string | undefined) ??
            defaultPrivacy.profileVisibility,
          healthDataUsage:
            (storedPrivacy.healthDataUsage as string | undefined) ??
            defaultPrivacy.healthDataUsage,
          locationSharing:
            (storedPrivacy.locationSharing as string | undefined) ??
            defaultPrivacy.locationSharing,
        });
        setNotifications({
          missionReminder:
            (storedReminders.missionReminder as boolean | undefined) ??
            defaultNotifications.missionReminder,
          sleepReminder:
            (storedReminders.sleepReminder as boolean | undefined) ??
            defaultNotifications.sleepReminder,
          weeklyReport:
            (storedReminders.weeklyReport as boolean | undefined) ??
            defaultNotifications.weeklyReport,
          glitchAlert:
            (storedReminders.glitchAlert as boolean | undefined) ??
            defaultNotifications.glitchAlert,
        });
        if (storedPermissions) {
          const mergedPermissions = {
            ...defaultPermissions,
            ...storedPermissions,
          };
          setPermissions(mergedPermissions);
          localStorage.setItem(
            "wellfit-permissions",
            JSON.stringify(mergedPermissions),
          );
        }
        setSaveMessage("Einstellungen geladen.");
      } catch (error) {
        console.error("Fehler beim Laden der Einstellungen", error);
        setSaveMessage("Einstellungen konnten nicht geladen werden.");
      } finally {
        setIsLoadingUser(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const updateProfileField = (key: keyof ProfileForm, value: string) =>
    setProfile((prev) => ({ ...prev, [key]: value }));
  const updateBiometricsField = (
    key: keyof BiometricsForm,
    value: string | boolean,
  ) => setBiometrics((prev) => ({ ...prev, [key]: value }));
  const updateNotificationField = (
    key: keyof NotificationsForm,
    value: boolean,
  ) => setNotifications((prev) => ({ ...prev, [key]: value }));
  const updateVitalValuesField = (key: keyof VitalValuesForm, value: string) =>
    setVitalValues((prev) => ({ ...prev, [key]: value }));
  const updateAiBuddyField = (
    key: keyof AiBuddyForm,
    value: string | boolean,
  ) => setAiBuddy((prev) => ({ ...prev, [key]: value }));
  const updateLifestyleField = (key: keyof LifestyleForm, value: string) =>
    setLifestyle((prev) => ({ ...prev, [key]: value }));
  const updateActivityField = (key: keyof ActivityForm, value: string) =>
    setActivity((prev) => ({ ...prev, [key]: value }));
  const updatePrivacyField = (
    key: keyof PrivacyForm,
    value: string | boolean,
  ) => setPrivacy((prev) => ({ ...prev, [key]: value }));

  const handleLogout = async () => {
    try {
      setSaveMessage("Du wirst abgemeldet...");
      await signOut(auth);
      window.location.href = "/";
    } catch (error) {
      console.error("Logout fehlgeschlagen", error);
      setSaveMessage("Abmelden fehlgeschlagen. Bitte erneut versuchen.");
    }
  };
  const saveProfile = async () => {
    if (!userId) {
      setSaveMessage("Bitte melde dich an, um dein Profil zu speichern.");
      return;
    }
    try {
      const [firstName, ...lastNameParts] = profile.displayName
        .trim()
        .split(" ");
      await setDoc(
        doc(db, "users", userId),
        {
          firstName: firstName ?? "",
          lastName: lastNameParts.join(" "),
          email: profile.email,
          profile: {
            birthdate: profile.birthDate,
            gender: genderToStorage(profile.gender),
          },
          settings: {
            displayName: profile.displayName,
            email: profile.email,
            phone: profile.phone,
            language: profile.language,
            birthDate: profile.birthDate,
            gender: profile.gender,
            timezone: profile.timezone,
            units: profile.units,
            permissions,
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setSaveMessage("Profil & Account gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern des Profils", error);
      setSaveMessage("Profil konnte nicht gespeichert werden.");
    }
  };
  const saveBiometrics = async () => {
    if (!userId) {
      setSaveMessage("Bitte melde dich an, um Körperdaten zu speichern.");
      return;
    }
    try {
      await setDoc(
        doc(db, "users", userId),
        {
          profile: {
            height: Number(biometrics.height) || 0,
            weight: Number(biometrics.weight) || 0,
            targetWeight: biometrics.targetWeightEnabled,
            targetWeightValue: Number(biometrics.targetWeight) || 0,
            bodyType: bodyTypeToStorage(biometrics.bodyType),
            fitnessLevel: fitnessLevelToStorage(biometrics.fitnessLevel),
            otherRestriction: biometrics.limitations,
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setSaveMessage("Biometrie & Körper gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern der Körperdaten", error);
      setSaveMessage("Körperdaten konnten nicht gespeichert werden.");
    }
  };
  const saveNotifications = async () => {
    if (!userId) {
      setSaveMessage(
        "Bitte melde dich an, um Benachrichtigungen zu speichern.",
      );
      return;
    }
    try {
      await setDoc(
        doc(db, "users", userId),
        {
          settings: { reminders: notifications },
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setSaveMessage("Benachrichtigungen gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern der Benachrichtigungen", error);
      setSaveMessage("Benachrichtigungen konnten nicht gespeichert werden.");
    }
  };
  const saveVitalValues = async () => {
    if (!userId) {
      setSaveMessage("Bitte melde dich an, um Vitalwerte zu speichern.");
      return;
    }
    try {
      await setDoc(
        doc(db, "users", userId),
        {
          profile: { vitals: vitalValues },
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setSaveMessage("Erweiterte Vitalwerte gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern der Vitalwerte", error);
      setSaveMessage("Vitalwerte konnten nicht gespeichert werden.");
    }
  };
  const saveAiBuddy = async () => {
    if (!userId) {
      setSaveMessage("Bitte melde dich an, um deinen KI-Buddy zu speichern.");
      return;
    }
    try {
      await setDoc(
        doc(db, "users", userId),
        { profile: { aiBuddy }, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      setSaveMessage("KI-Buddy & Avatar-Verhalten gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern des KI-Buddys", error);
      setSaveMessage("KI-Buddy konnte nicht gespeichert werden.");
    }
  };
  const saveLifestyle = async () => {
    if (!userId) {
      setSaveMessage(
        "Bitte melde dich an, um Lebensstil & Ernährung zu speichern.",
      );
      return;
    }
    try {
      await setDoc(
        doc(db, "users", userId),
        {
          profile: {
            lifestyle: {
              ...lifestyle,
              drinkAmount: Number(lifestyle.drinkAmount) || 0,
            },
            nutrition: lifestyle.nutrition,
            drinkReminder: lifestyle.drinkReminder,
            drinkAmount: Number(lifestyle.drinkAmount) || 0,
            natureMove: lifestyle.natureMove,
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setSaveMessage("Lebensstil & Ernährung gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern von Lebensstil & Ernährung", error);
      setSaveMessage("Lebensstil & Ernährung konnte nicht gespeichert werden.");
    }
  };
  const saveActivity = async () => {
    if (!userId) {
      setSaveMessage(
        "Bitte melde dich an, um Aktivität & Interessen zu speichern.",
      );
      return;
    }
    try {
      const activityPayload = {
        ...activity,
        interests: textToArray(activity.interests),
        activities: textToArray(activity.activities),
        goals: textToArray(activity.goals),
        preferredMissionTypes: textToArray(activity.preferredMissionTypes),
      };
      await setDoc(
        doc(db, "users", userId),
        {
          profile: {
            activity: activityPayload,
            activityLevel: activity.activityLevel,
            trainingTime: activity.trainingTime,
            communityMode: activity.communityMode,
            interests: activityPayload.interests,
            activities: activityPayload.activities,
            goals: activityPayload.goals,
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setSaveMessage("Aktivität & Interessen gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern von Aktivität & Interessen", error);
      setSaveMessage(
        "Aktivität & Interessen konnten nicht gespeichert werden.",
      );
    }
  };
  const savePrivacy = async () => {
    if (!userId) {
      setSaveMessage("Bitte melde dich an, um Privatsphäre zu speichern.");
      return;
    }
    try {
      await setDoc(
        doc(db, "users", userId),
        { settings: { privacy }, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      setSaveMessage("Privatsphäre gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern der Privatsphäre", error);
      setSaveMessage("Privatsphäre konnte nicht gespeichert werden.");
    }
  };
  const sendSecurityPasswordReset = async () => {
    if (!profile.email) {
      setSecurityMessage("Keine E-Mail-Adresse für diesen Account gefunden.");
      return;
    }
    try {
      setIsSendingPasswordReset(true);
      setSecurityMessage("Passwort-Link wird gesendet...");
      await sendPasswordResetEmail(auth, profile.email);
      setSecurityMessage(
        "Passwort-Reset-Link wurde an deine E-Mail-Adresse gesendet.",
      );
      setSaveMessage("Sicherheits-E-Mail gesendet.");
    } catch (error) {
      console.error("Fehler beim Passwort-Reset", error);
      setSecurityMessage(
        "Passwort-Reset konnte nicht gesendet werden. Bitte prüfe die E-Mail-Adresse.",
      );
    } finally {
      setIsSendingPasswordReset(false);
    }
  };
  const savePermissions = async (updatedPermissions = permissions) => {
    if (!userId) {
      setSaveMessage("Bitte melde dich an, um Berechtigungen zu speichern.");
      return;
    }
    try {
      await setDoc(
        doc(db, "users", userId),
        {
          settings: { permissions: updatedPermissions },
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );
      setSaveMessage("App-Berechtigungen gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern der Berechtigungen", error);
      setSaveMessage("Berechtigungen konnten nicht gespeichert werden.");
    }
  };
  const updatePermission = (key: PermissionKey, value: boolean) => {
    const updated = { ...permissions, [key]: value };
    setPermissions(updated);
    localStorage.setItem("wellfit-permissions", JSON.stringify(updated));
  };

  const cardClass =
    "rounded-[22px] bg-[#053841]/85 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.12)]";
  const inputClass =
    "w-full rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2 text-sm text-white outline-none placeholder:text-white/35";
  const selectClass =
    "w-full rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2 text-sm text-white outline-none";
  const saveButtonClass =
    "mt-4 inline-flex rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-500";
  const toggleBase =
    "relative inline-flex h-6 w-12 items-center rounded-full transition";

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{
        background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))`,
      }}
    >
      <div className="flex h-full">
        <AppSidebar
          brightness={brightness}
          onBrightnessChange={setBrightness}
          onLogout={handleLogout}
        />
        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <SettingsHeader
            isLoadingUser={isLoadingUser}
            saveMessage={saveMessage}
          />
          <div className="mt-2 flex justify-end">
            <button className="rounded-lg border border-cyan-300/20 bg-[#0a3d46] px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-[#0d4b56]">
              Generationen-Tandem
            </button>
          </div>
          <div className="grid flex-1 grid-cols-3 gap-4 overflow-y-auto pr-2 pb-8 text-sm">
            <div className={cardClass}>
              <h2 className="mb-3 text-2xl font-bold text-cyan-300">
                Profil & Account
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Anzeigename
                  </label>
                  <input
                    className={inputClass}
                    value={profile.displayName}
                    onChange={(e) =>
                      updateProfileField("displayName", e.target.value)
                    }
                    placeholder="Vorname Nachname"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    E-Mail Adresse
                  </label>
                  <input
                    className={inputClass}
                    value={profile.email}
                    onChange={(e) =>
                      updateProfileField("email", e.target.value)
                    }
                    placeholder="name@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Telefonnummer
                  </label>
                  <input
                    className={inputClass}
                    value={profile.phone}
                    onChange={(e) =>
                      updateProfileField("phone", e.target.value)
                    }
                    placeholder="+43 ..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Sprache
                  </label>
                  <select
                    className={selectClass}
                    value={profile.language}
                    onChange={(e) =>
                      updateProfileField("language", e.target.value)
                    }
                  >
                    <option>Deutsch</option>
                    <option>English</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Geburtsdatum
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={profile.birthDate}
                    onChange={(e) =>
                      updateProfileField("birthDate", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Geschlecht
                  </label>
                  <select
                    className={selectClass}
                    value={profile.gender}
                    onChange={(e) =>
                      updateProfileField("gender", e.target.value)
                    }
                  >
                    <option>Männlich</option>
                    <option>Weiblich</option>
                    <option>Divers</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Zeitzone
                  </label>
                  <select
                    className={selectClass}
                    value={profile.timezone}
                    onChange={(e) =>
                      updateProfileField("timezone", e.target.value)
                    }
                  >
                    <option>Europe/Vienna</option>
                    <option>Europe/Berlin</option>
                    <option>UTC</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Einheiten
                  </label>
                  <select
                    className={selectClass}
                    value={profile.units}
                    onChange={(e) =>
                      updateProfileField("units", e.target.value)
                    }
                  >
                    <option>kg / km</option>
                    <option>lbs / miles</option>
                  </select>
                </div>
              </div>
              <button
                className={saveButtonClass}
                onClick={saveProfile}
                disabled={isLoadingUser}
              >
                Änderungen speichern
              </button>
            </div>
            <div className={cardClass}>
              <h2 className="mb-3 text-2xl font-bold text-cyan-300">
                Sicherheit
              </h2>
              <div className="space-y-3">
                <div className="rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2">
                  <p className="font-semibold text-white">Login-E-Mail</p>
                  <p className="mt-1 text-xs text-white/70">
                    {profile.email || "Keine E-Mail geladen"}
                  </p>
                </div>
                <div className="rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2">
                  <p className="font-semibold text-white">Passwort ändern</p>
                  <p className="mt-1 text-xs text-white/70">
                    Aus Sicherheitsgründen senden wir einen Passwort-Reset-Link
                    an deine registrierte E-Mail-Adresse.
                  </p>
                </div>
                <button
                  className={saveButtonClass}
                  onClick={sendSecurityPasswordReset}
                  disabled={isLoadingUser || isSendingPasswordReset}
                >
                  {isSendingPasswordReset
                    ? "Wird gesendet..."
                    : "Passwort-Reset senden"}
                </button>
                {securityMessage && (
                  <p className="rounded-lg border border-cyan-300/20 bg-[#0a3d46] px-3 py-2 text-xs text-cyan-100">
                    {securityMessage}
                  </p>
                )}
                <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-xs text-yellow-100">
                  2FA, Geräteverwaltung und aktive Sessions werden als nächste
                  Sicherheitsausbaustufe vorbereitet.
                </div>
              </div>
            </div>
            <div className={cardClass}>
              <h2 className="mb-3 text-2xl font-bold text-cyan-300">
                Biometrie & Körper
              </h2>
              <SensitiveNotice />
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_85px_35px_85px_28px] items-center gap-2">
                  <label className="text-xs text-white/70">
                    Größe & Gewicht
                  </label>
                  <input
                    className={inputClass}
                    value={biometrics.height}
                    onChange={(e) =>
                      updateBiometricsField("height", e.target.value)
                    }
                  />
                  <span className="text-xs text-white/70">cm</span>
                  <input
                    className={inputClass}
                    value={biometrics.weight}
                    onChange={(e) =>
                      updateBiometricsField("weight", e.target.value)
                    }
                  />
                  <span className="text-xs text-white/70">kg</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2">
                  <span className="text-white/85">Zielgewicht anstreben</span>
                  <ToggleButton
                    enabled={biometrics.targetWeightEnabled}
                    onClick={() =>
                      updateBiometricsField(
                        "targetWeightEnabled",
                        !biometrics.targetWeightEnabled,
                      )
                    }
                    toggleBase={toggleBase}
                  />
                </div>
                <div className="grid grid-cols-[1fr_85px_28px] items-center gap-2">
                  <label className="text-xs text-white/70">Zielgewicht</label>
                  <input
                    className={inputClass}
                    value={biometrics.targetWeight}
                    onChange={(e) =>
                      updateBiometricsField("targetWeight", e.target.value)
                    }
                  />
                  <span className="text-xs text-white/70">kg</span>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Körperbau
                  </label>
                  <select
                    className={selectClass}
                    value={biometrics.bodyType}
                    onChange={(e) =>
                      updateBiometricsField("bodyType", e.target.value)
                    }
                  >
                    <option>Schlank</option>
                    <option>Normal</option>
                    <option>Kräftig</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Fitnesslevel
                  </label>
                  <select
                    className={selectClass}
                    value={biometrics.fitnessLevel}
                    onChange={(e) =>
                      updateBiometricsField("fitnessLevel", e.target.value)
                    }
                  >
                    <option>Anfänger</option>
                    <option>Fortgeschritten</option>
                    <option>Aktiv</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Einschränkungen / Verletzungen
                  </label>
                  <input
                    className={inputClass}
                    value={biometrics.limitations}
                    onChange={(e) =>
                      updateBiometricsField("limitations", e.target.value)
                    }
                  />
                </div>
              </div>
              <button
                className={saveButtonClass}
                onClick={saveBiometrics}
                disabled={isLoadingUser}
              >
                Änderungen speichern
              </button>
            </div>
            <div className={cardClass}>
              <h2 className="mb-3 text-2xl font-bold text-cyan-300">
                Benachrichtigungen
              </h2>
              <div className="space-y-3">
                {[
                  {
                    key: "missionReminder" as keyof NotificationsForm,
                    label: "Missions-Erinnerung",
                  },
                  {
                    key: "sleepReminder" as keyof NotificationsForm,
                    label: "Schlaf-Erinnerung",
                  },
                  {
                    key: "weeklyReport" as keyof NotificationsForm,
                    label: "Wochenreport",
                  },
                  {
                    key: "glitchAlert" as keyof NotificationsForm,
                    label: "Glitch-Alarm",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2"
                  >
                    <span className="text-white/85">{item.label}</span>
                    <ToggleButton
                      enabled={notifications[item.key]}
                      onClick={() =>
                        updateNotificationField(
                          item.key,
                          !notifications[item.key],
                        )
                      }
                      toggleBase={toggleBase}
                    />
                  </div>
                ))}
              </div>
              <button
                className={saveButtonClass}
                onClick={saveNotifications}
                disabled={isLoadingUser}
              >
                Änderungen speichern
              </button>
            </div>
            <div className={cardClass}>
              <h2 className="mb-3 text-2xl font-bold text-cyan-300">
                Erweiterte Vitalwerte
              </h2>
              <SensitiveNotice />
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_80px_30px] items-center gap-2">
                  <label className="text-white/85">Körperfettanteil</label>
                  <input
                    className={inputClass}
                    value={vitalValues.bodyFat}
                    onChange={(e) =>
                      updateVitalValuesField("bodyFat", e.target.value)
                    }
                    placeholder="--"
                  />
                  <span>%</span>
                </div>
                <div className="grid grid-cols-[1fr_80px_45px] items-center gap-2">
                  <label className="text-white/85">Ruhepuls</label>
                  <input
                    className={inputClass}
                    value={vitalValues.restingPulse}
                    onChange={(e) =>
                      updateVitalValuesField("restingPulse", e.target.value)
                    }
                    placeholder="--"
                  />
                  <span>bpm</span>
                </div>
                <div className="grid grid-cols-[1fr_80px_45px] items-center gap-2">
                  <label className="text-white/85">Durchschnittspuls</label>
                  <input
                    className={inputClass}
                    value={vitalValues.averagePulse}
                    onChange={(e) =>
                      updateVitalValuesField("averagePulse", e.target.value)
                    }
                    placeholder="--"
                  />
                  <span>bpm</span>
                </div>
                <div className="grid grid-cols-[1fr_80px_55px] items-center gap-2">
                  <label className="text-white/85">Blutdruck</label>
                  <input
                    className={inputClass}
                    value={vitalValues.bloodPressure}
                    onChange={(e) =>
                      updateVitalValuesField("bloodPressure", e.target.value)
                    }
                    placeholder="--/--"
                  />
                  <span>mmHg</span>
                </div>
                <div className="grid grid-cols-[1fr_80px_45px] items-center gap-2">
                  <label className="text-white/85">Schlafdauer</label>
                  <input
                    className={inputClass}
                    value={vitalValues.sleepHours}
                    onChange={(e) =>
                      updateVitalValuesField("sleepHours", e.target.value)
                    }
                    placeholder="--"
                  />
                  <span>Std.</span>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Schlafqualität
                  </label>
                  <select
                    className={selectClass}
                    value={vitalValues.sleepQuality}
                    onChange={(e) =>
                      updateVitalValuesField("sleepQuality", e.target.value)
                    }
                  >
                    <option>Niedrig</option>
                    <option>Mittel</option>
                    <option>Hoch</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Stresslevel
                  </label>
                  <select
                    className={selectClass}
                    value={vitalValues.stressLevel}
                    onChange={(e) =>
                      updateVitalValuesField("stressLevel", e.target.value)
                    }
                  >
                    <option>Niedrig</option>
                    <option>Mittel</option>
                    <option>Hoch</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Energielevel
                  </label>
                  <select
                    className={selectClass}
                    value={vitalValues.energyLevel}
                    onChange={(e) =>
                      updateVitalValuesField("energyLevel", e.target.value)
                    }
                  >
                    <option>Niedrig</option>
                    <option>Mittel</option>
                    <option>Hoch</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Schmerzlevel
                  </label>
                  <select
                    className={selectClass}
                    value={vitalValues.painLevel}
                    onChange={(e) =>
                      updateVitalValuesField("painLevel", e.target.value)
                    }
                  >
                    <option>Keine</option>
                    <option>Leicht</option>
                    <option>Mittel</option>
                    <option>Stark</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Medikamentenhinweis
                  </label>
                  <input
                    className={inputClass}
                    value={vitalValues.medicationNote}
                    onChange={(e) =>
                      updateVitalValuesField("medicationNote", e.target.value)
                    }
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Gesundheitliche Hinweise
                  </label>
                  <textarea
                    className={`${inputClass} min-h-[80px] resize-none`}
                    value={vitalValues.healthNotes}
                    onChange={(e) =>
                      updateVitalValuesField("healthNotes", e.target.value)
                    }
                    placeholder="Optional: Hinweise, die der KI-Buddy berücksichtigen soll"
                  />
                </div>
              </div>
              <button
                className={saveButtonClass}
                onClick={saveVitalValues}
                disabled={isLoadingUser}
              >
                Änderungen speichern
              </button>
            </div>
            <div className={cardClass}>
              <h2 className="mb-3 text-2xl font-bold text-cyan-300">
                Lebensstil & Ernährung
              </h2>
              <SensitiveNotice />
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Ernährungsstil
                  </label>
                  <select
                    className={selectClass}
                    value={lifestyle.nutrition}
                    onChange={(e) =>
                      updateLifestyleField("nutrition", e.target.value)
                    }
                  >
                    <option>Ausgewogen</option>
                    <option>Vegetarisch</option>
                    <option>Vegan</option>
                    <option>Low Carb</option>
                    <option>High Protein</option>
                    <option>Unregelmäßig</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Mahlzeitenrhythmus
                  </label>
                  <select
                    className={selectClass}
                    value={lifestyle.mealRhythm}
                    onChange={(e) =>
                      updateLifestyleField("mealRhythm", e.target.value)
                    }
                  >
                    <option>Regelmäßig</option>
                    <option>Unregelmäßig</option>
                    <option>Intervallfasten</option>
                    <option>Viele kleine Mahlzeiten</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Trinkerinnerung
                  </label>
                  <select
                    className={selectClass}
                    value={lifestyle.drinkReminder}
                    onChange={(e) =>
                      updateLifestyleField("drinkReminder", e.target.value)
                    }
                  >
                    <option>Niedrig</option>
                    <option>Normal</option>
                    <option>Hoch</option>
                  </select>
                </div>
                <div className="grid grid-cols-[1fr_80px_45px] items-center gap-2">
                  <label className="text-white/85">Trinkziel pro Tag</label>
                  <input
                    className={inputClass}
                    value={lifestyle.drinkAmount}
                    onChange={(e) =>
                      updateLifestyleField("drinkAmount", e.target.value)
                    }
                  />
                  <span>Liter</span>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Koffein
                  </label>
                  <select
                    className={selectClass}
                    value={lifestyle.caffeineIntake}
                    onChange={(e) =>
                      updateLifestyleField("caffeineIntake", e.target.value)
                    }
                  >
                    <option>Niedrig</option>
                    <option>Mittel</option>
                    <option>Hoch</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Alkohol
                  </label>
                  <select
                    className={selectClass}
                    value={lifestyle.alcoholFrequency}
                    onChange={(e) =>
                      updateLifestyleField("alcoholFrequency", e.target.value)
                    }
                  >
                    <option>Nie</option>
                    <option>Selten</option>
                    <option>Gelegentlich</option>
                    <option>Regelmäßig</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Schlafroutine
                  </label>
                  <select
                    className={selectClass}
                    value={lifestyle.sleepRoutine}
                    onChange={(e) =>
                      updateLifestyleField("sleepRoutine", e.target.value)
                    }
                  >
                    <option>Regelmäßig</option>
                    <option>Unregelmäßig</option>
                    <option>Schicht / wechselnd</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Bewegung in der Natur
                  </label>
                  <select
                    className={selectClass}
                    value={lifestyle.natureMove}
                    onChange={(e) =>
                      updateLifestyleField("natureMove", e.target.value)
                    }
                  >
                    <option>Selten</option>
                    <option>Gelegentlich</option>
                    <option>Häufig</option>
                    <option>Täglich</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Stress-Ausgleich
                  </label>
                  <select
                    className={selectClass}
                    value={lifestyle.stressCoping}
                    onChange={(e) =>
                      updateLifestyleField("stressCoping", e.target.value)
                    }
                  >
                    <option>Spaziergang / Bewegung</option>
                    <option>Musik</option>
                    <option>Meditation / Atmung</option>
                    <option>Gaming</option>
                    <option>Freunde / Familie</option>
                    <option>Noch keine Routine</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Screen-Time Gefühl
                  </label>
                  <select
                    className={selectClass}
                    value={lifestyle.screenTime}
                    onChange={(e) =>
                      updateLifestyleField("screenTime", e.target.value)
                    }
                  >
                    <option>Niedrig</option>
                    <option>Mittel</option>
                    <option>Hoch</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Notizen für den KI-Buddy
                  </label>
                  <textarea
                    className={`${inputClass} min-h-[80px] resize-none`}
                    value={lifestyle.notes}
                    onChange={(e) =>
                      updateLifestyleField("notes", e.target.value)
                    }
                    placeholder="Optional: Gewohnheiten, Vorlieben oder Alltagshinweise"
                  />
                </div>
              </div>
              <button
                className={saveButtonClass}
                onClick={saveLifestyle}
                disabled={isLoadingUser}
              >
                Änderungen speichern
              </button>
            </div>
            <div className={cardClass}>
              <h2 className="mb-3 text-2xl font-bold text-cyan-300">
                Aktivität & Interessen
              </h2>
              <SensitiveNotice />
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Aktivitätslevel
                  </label>
                  <select
                    className={selectClass}
                    value={activity.activityLevel}
                    onChange={(e) =>
                      updateActivityField("activityLevel", e.target.value)
                    }
                  >
                    <option>Kaum aktiv</option>
                    <option>Gelegentlich aktiv</option>
                    <option>Regelmäßig aktiv</option>
                    <option>Sehr aktiv</option>
                    <option>Sportlich ambitioniert</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Bevorzugte Trainingszeit
                  </label>
                  <select
                    className={selectClass}
                    value={activity.trainingTime}
                    onChange={(e) =>
                      updateActivityField("trainingTime", e.target.value)
                    }
                  >
                    <option>Morgens</option>
                    <option>Mittags</option>
                    <option>Nachmittags</option>
                    <option>Abends</option>
                    <option>Flexibel</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Community-Modus
                  </label>
                  <select
                    className={selectClass}
                    value={activity.communityMode}
                    onChange={(e) =>
                      updateActivityField("communityMode", e.target.value)
                    }
                  >
                    <option>Alleine</option>
                    <option>Alleine & gelegentlich gemeinsam</option>
                    <option>Freunde & kleine Gruppen</option>
                    <option>Community & Events</option>
                    <option>Familie / Generationen-Tandem</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Interessen
                  </label>
                  <textarea
                    className={`${inputClass} min-h-[70px] resize-none`}
                    value={activity.interests}
                    onChange={(e) =>
                      updateActivityField("interests", e.target.value)
                    }
                    placeholder="z. B. Fitness, Natur, Gaming, Lernen"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Aktivitäten
                  </label>
                  <textarea
                    className={`${inputClass} min-h-[70px] resize-none`}
                    value={activity.activities}
                    onChange={(e) =>
                      updateActivityField("activities", e.target.value)
                    }
                    placeholder="z. B. Gehen, Radfahren, Workouts"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Ziele
                  </label>
                  <textarea
                    className={`${inputClass} min-h-[70px] resize-none`}
                    value={activity.goals}
                    onChange={(e) =>
                      updateActivityField("goals", e.target.value)
                    }
                    placeholder="z. B. Fitter werden, abnehmen, Stress reduzieren"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Bevorzugte Missionstypen
                  </label>
                  <textarea
                    className={`${inputClass} min-h-[70px] resize-none`}
                    value={activity.preferredMissionTypes}
                    onChange={(e) =>
                      updateActivityField(
                        "preferredMissionTypes",
                        e.target.value,
                      )
                    }
                    placeholder="z. B. Bewegung, Wissen, AR, Team, Natur"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Soziale Präferenz
                  </label>
                  <select
                    className={selectClass}
                    value={activity.socialPreference}
                    onChange={(e) =>
                      updateActivityField("socialPreference", e.target.value)
                    }
                  >
                    <option>Alleine</option>
                    <option>Freunde & kleine Gruppen</option>
                    <option>Familie</option>
                    <option>Öffentliche Gruppen</option>
                    <option>Gemischt</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Wettbewerbsmodus
                  </label>
                  <select
                    className={selectClass}
                    value={activity.competitionMode}
                    onChange={(e) =>
                      updateActivityField("competitionMode", e.target.value)
                    }
                  >
                    <option>Aus</option>
                    <option>Locker</option>
                    <option>Motivierend</option>
                    <option>Stark kompetitiv</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Notizen für Missionen
                  </label>
                  <textarea
                    className={`${inputClass} min-h-[80px] resize-none`}
                    value={activity.notes}
                    onChange={(e) =>
                      updateActivityField("notes", e.target.value)
                    }
                    placeholder="Optional: was der KI-Buddy bei Missionen beachten soll"
                  />
                </div>
              </div>
              <button
                className={saveButtonClass}
                onClick={saveActivity}
                disabled={isLoadingUser}
              >
                Änderungen speichern
              </button>
            </div>
            <div className={cardClass}>
              <h2 className="mb-3 text-2xl font-bold text-cyan-300">
                KI-Tuning & Ziele
              </h2>
              <SensitiveNotice />
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Avatar-Typ
                  </label>
                  <select
                    className={selectClass}
                    value={aiBuddy.avatarType}
                    onChange={(e) =>
                      updateAiBuddyField("avatarType", e.target.value)
                    }
                  >
                    <option>Tierischer Begleiter</option>
                    <option>Roboter / Cyborg</option>
                    <option>Magisches Wesen</option>
                    <option>Abenteuer-Begleiter</option>
                    <option>Lese-Freund / Lern-Buddy</option>
                    <option>Social Buddy</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Buddy-Charakter
                  </label>
                  <select
                    className={selectClass}
                    value={aiBuddy.personality}
                    onChange={(e) =>
                      updateAiBuddyField("personality", e.target.value)
                    }
                  >
                    <option>Sanft & motivierend</option>
                    <option>Direkt & fordernd</option>
                    <option>Spielerisch & lustig</option>
                    <option>Ruhig & achtsam</option>
                    <option>Wettbewerbsorientiert</option>
                    <option>Beschützend / fürsorglich</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Beziehungsmodus
                  </label>
                  <select
                    className={selectClass}
                    value={aiBuddy.relationshipMode}
                    onChange={(e) =>
                      updateAiBuddyField("relationshipMode", e.target.value)
                    }
                  >
                    <option>Begleiter</option>
                    <option>Coach</option>
                    <option>Haustier / Pflegewesen</option>
                    <option>Mentor</option>
                    <option>Freund</option>
                    <option>Abenteuerpartner</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Verhaltensdynamik
                  </label>
                  <select
                    className={selectClass}
                    value={aiBuddy.behaviorDynamics}
                    onChange={(e) =>
                      updateAiBuddyField("behaviorDynamics", e.target.value)
                    }
                  >
                    <option>Stabil</option>
                    <option>Adaptiv</option>
                    <option>Emotional reagierend</option>
                    <option>Herausfordernd</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Motivationsstil
                  </label>
                  <select
                    className={selectClass}
                    value={aiBuddy.motivationStyle}
                    onChange={(e) =>
                      updateAiBuddyField("motivationStyle", e.target.value)
                    }
                  >
                    <option>Sanft</option>
                    <option>Ausgewogen</option>
                    <option>Stärker antreibend</option>
                  </select>
                </div>
                {[
                  {
                    key: "reactsToStress" as keyof AiBuddyForm,
                    label: "Auf Stress reagieren",
                  },
                  {
                    key: "reactsToSleep" as keyof AiBuddyForm,
                    label: "Auf Schlafqualität reagieren",
                  },
                  {
                    key: "reactsToActivity" as keyof AiBuddyForm,
                    label: "Auf Aktivität reagieren",
                  },
                  {
                    key: "reactsToMood" as keyof AiBuddyForm,
                    label: "Auf Stimmung reagieren",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2"
                  >
                    <span className="text-white/85">{item.label}</span>
                    <ToggleButton
                      enabled={Boolean(aiBuddy[item.key])}
                      onClick={() =>
                        updateAiBuddyField(
                          item.key,
                          !Boolean(aiBuddy[item.key]),
                        )
                      }
                      toggleBase={toggleBase}
                    />
                  </div>
                ))}
              </div>
              <button
                className={saveButtonClass}
                onClick={saveAiBuddy}
                disabled={isLoadingUser}
              >
                Änderungen speichern
              </button>
            </div>
            <div className={cardClass}>
              <h2 className="mb-3 text-2xl font-bold text-cyan-300">
                Privatsphäre
              </h2>
              <p className="mb-3 rounded-lg border border-cyan-300/20 bg-[#0a3d46] px-3 py-2 text-xs text-cyan-100">
                Hier steuerst du, welche Daten sichtbar sind und wofür sie
                verwendet werden. Gesundheits- und Verfassungsdaten bleiben
                standardmäßig nur für Personalisierung aktiv.
              </p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Profil-Sichtbarkeit
                  </label>
                  <select
                    className={selectClass}
                    value={privacy.profileVisibility}
                    onChange={(e) =>
                      updatePrivacyField("profileVisibility", e.target.value)
                    }
                  >
                    <option>Privat</option>
                    <option>Freunde</option>
                    <option>Community</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Nutzung von Gesundheits-/Verfassungsdaten
                  </label>
                  <select
                    className={selectClass}
                    value={privacy.healthDataUsage}
                    onChange={(e) =>
                      updatePrivacyField("healthDataUsage", e.target.value)
                    }
                  >
                    <option>Nur Personalisierung</option>
                    <option>Personalisierung & anonyme Verbesserung</option>
                    <option>Nicht verwenden</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/70">
                    Standortfreigabe
                  </label>
                  <select
                    className={selectClass}
                    value={privacy.locationSharing}
                    onChange={(e) =>
                      updatePrivacyField("locationSharing", e.target.value)
                    }
                  >
                    <option>Nie</option>
                    <option>Nur Freunde</option>
                    <option>Nur Team</option>
                    <option>Community</option>
                  </select>
                </div>
                {[
                  {
                    key: "leaderboardVisible" as keyof PrivacyForm,
                    label: "Im Leaderboard sichtbar",
                  },
                  {
                    key: "buddySharing" as keyof PrivacyForm,
                    label: "Buddy-Status mit Freunden teilen",
                  },
                  {
                    key: "anonymousAnalytics" as keyof PrivacyForm,
                    label: "Anonyme Nutzungsanalyse erlauben",
                  },
                  {
                    key: "friendRequests" as keyof PrivacyForm,
                    label: "Freundschaftsanfragen erlauben",
                  },
                  {
                    key: "teamInvitations" as keyof PrivacyForm,
                    label: "Team-Einladungen erlauben",
                  },
                  {
                    key: "localUsersVisible" as keyof PrivacyForm,
                    label: "Für lokale Nutzer sichtbar sein",
                  },
                  {
                    key: "pvpAllowed" as keyof PrivacyForm,
                    label: "Direkte Challenges / PvP erlauben",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2"
                  >
                    <span className="text-white/85">{item.label}</span>
                    <ToggleButton
                      enabled={Boolean(privacy[item.key])}
                      onClick={() =>
                        updatePrivacyField(
                          item.key,
                          !Boolean(privacy[item.key]),
                        )
                      }
                      toggleBase={toggleBase}
                    />
                  </div>
                ))}
              </div>
              <button
                className={saveButtonClass}
                onClick={savePrivacy}
                disabled={isLoadingUser}
              >
                Änderungen speichern
              </button>
            </div>
            <div className={cardClass}>
              <h2 className="mb-3 text-2xl font-bold text-cyan-300">
                App-Berechtigungen
              </h2>
              <div className="space-y-3">
                <div className="rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2">
                  <p className="font-semibold text-white">Standort (GPS)</p>
                  <p className="mb-2 text-xs text-white/60">
                    Für Checkpoints, Karten & Reality-Glitches
                  </p>
                  <select
                    className={selectClass}
                    value={permissions.location ? "Immer" : "Nie"}
                    onChange={(e) =>
                      updatePermission("location", e.target.value !== "Nie")
                    }
                  >
                    <option>Immer</option>
                    <option>Nur beim Verwenden</option>
                    <option>Nie</option>
                  </select>
                </div>
                {[
                  {
                    key: "camera" as PermissionKey,
                    label: "Kamera-Zugriff",
                    text: "Für AR-Erlebnisse & Edge-AI Tracking",
                  },
                  {
                    key: "microphone" as PermissionKey,
                    label: "Mikrofon",
                    text: "Für Spracheingabe und Buddy-Funktionen",
                  },
                  {
                    key: "backgroundTracking" as PermissionKey,
                    label: "Hintergrund-Aktivität",
                    text: "Schritte im Hintergrund weiterzählen",
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-white/60">{item.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updatePermission(item.key, !permissions[item.key])
                      }
                      className={`${toggleBase} ${permissions[item.key] ? "bg-cyan-400" : "bg-white/20"}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${permissions[item.key] ? "translate-x-7" : "translate-x-1"}`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              <button
                className={saveButtonClass}
                onClick={() => savePermissions()}
                disabled={isLoadingUser}
              >
                Änderungen speichern
              </button>
            </div>
            <div className={cardClass}>
              <h2 className="mb-3 text-2xl font-bold text-red-400">
                Account Verwaltung
              </h2>
              <p className="mb-3 text-sm text-white/70">
                Aktionen in diesem Bereich können nicht rückgängig gemacht
                werden.
              </p>
              <div className="space-y-3">
                <button className="w-full rounded-lg border border-cyan-300/20 bg-[#0a3d46] px-4 py-3 text-sm font-bold text-white">
                  Meine Daten anfordern (DSGVO)
                </button>
                <button className="w-full rounded-lg border border-cyan-300/20 bg-[#0a3d46] px-4 py-3 text-sm font-bold text-white">
                  Logout auf allen Geräten
                </button>
                <button className="w-full rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
                  Account & Wallet unwiderruflich löschen
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
