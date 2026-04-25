"use client";

import { useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import type {
  ProfileForm,
  BiometricsForm,
  NotificationsForm,
  VitalValuesForm,
  AiBuddyForm,
  LifestyleForm,
  ActivityForm,
  PrivacyForm,
} from "../types";
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
} from "../lib/settingsDefaults";
import {
  genderToDisplay,
  bodyTypeToDisplay,
  bodyTypeToStorage,
  fitnessLevelToDisplay,
  fitnessLevelToStorage,
  arrayToText,
} from "../lib/settingsMappers";

type UseSettingsDataParams = {
  setUserId: (value: string | null) => void;
  setIsLoadingUser: (value: boolean) => void;
  setSaveMessage: (value: string) => void;
  setPermissions: React.Dispatch<
    React.SetStateAction<typeof defaultPermissions>
  >;
  setProfile: React.Dispatch<React.SetStateAction<ProfileForm>>;
  setBiometrics: React.Dispatch<React.SetStateAction<BiometricsForm>>;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationsForm>>;
  setVitalValues: React.Dispatch<React.SetStateAction<VitalValuesForm>>;
  setAiBuddy: React.Dispatch<React.SetStateAction<AiBuddyForm>>;
  setLifestyle: React.Dispatch<React.SetStateAction<LifestyleForm>>;
  setActivity: React.Dispatch<React.SetStateAction<ActivityForm>>;
  setPrivacy: React.Dispatch<React.SetStateAction<PrivacyForm>>;
};

export function useSettingsData({
  setUserId,
  setIsLoadingUser,
  setSaveMessage,
  setPermissions,
  setProfile,
  setBiometrics,
  setNotifications,
  setVitalValues,
  setAiBuddy,
  setLifestyle,
  setActivity,
  setPrivacy,
}: UseSettingsDataParams) {
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
}
