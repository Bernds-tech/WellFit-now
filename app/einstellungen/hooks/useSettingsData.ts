"use client";

/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";

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
  fitnessLevelToDisplay,
  arrayToText,
} from "../lib/settingsMappers";

type UseSettingsDataParams = {
  setUserId: (value: string | null) => void;
  setIsLoadingUser: (value: boolean) => void;
  setSaveMessage: (value: string) => void;
  setPermissions: React.Dispatch<React.SetStateAction<typeof defaultPermissions>>;
  setProfile: React.Dispatch<React.SetStateAction<ProfileForm>>;
  setBiometrics: React.Dispatch<React.SetStateAction<BiometricsForm>>;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationsForm>>;
  setVitalValues: React.Dispatch<React.SetStateAction<VitalValuesForm>>;
  setAiBuddy: React.Dispatch<React.SetStateAction<AiBuddyForm>>;
  setLifestyle: React.Dispatch<React.SetStateAction<LifestyleForm>>;
  setActivity: React.Dispatch<React.SetStateAction<ActivityForm>>;
  setPrivacy: React.Dispatch<React.SetStateAction<PrivacyForm>>;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function clientTimeZone(): string {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return typeof timeZone === "string" && timeZone.trim() ? timeZone : "UTC";
  } catch {
    return "UTC";
  }
}

function fallbackProfile(firebaseUser: FirebaseUser): ProfileForm {
  return {
    ...defaultProfile,
    displayName: firebaseUser.displayName ?? "",
    email: firebaseUser.email ?? "",
    timezone: clientTimeZone(),
  };
}

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
        setPermissions((previous) => ({ ...previous, ...JSON.parse(savedPermissions) }));
      } catch (error) {
        console.error("Fehler beim Laden der Berechtigungen", error);
      }
    }

    let unsubscribeUserDoc: Unsubscribe | undefined;
    let hasLoadedCurrentUserDoc = false;

    const resetForms = () => {
      setProfile(defaultProfile);
      setBiometrics(defaultBiometrics);
      setNotifications(defaultNotifications);
      setVitalValues(defaultVitalValues);
      setAiBuddy(defaultAiBuddy);
      setLifestyle(defaultLifestyle);
      setActivity(defaultActivity);
      setPrivacy(defaultPrivacy);
    };

    const applyMissingProfileState = (firebaseUser: FirebaseUser) => {
      setProfile(fallbackProfile(firebaseUser));
      setBiometrics(defaultBiometrics);
      setNotifications(defaultNotifications);
      setVitalValues(defaultVitalValues);
      setAiBuddy(defaultAiBuddy);
      setLifestyle(defaultLifestyle);
      setActivity(defaultActivity);
      setPrivacy(defaultPrivacy);
      setSaveMessage("Sichere Registrierung noch nicht abgeschlossen. Bitte schließe zuerst das Onboarding ab.");
      setIsLoadingUser(false);
    };

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribeUserDoc?.();
      unsubscribeUserDoc = undefined;
      hasLoadedCurrentUserDoc = false;
      setIsLoadingUser(true);
      setSaveMessage("Lade Einstellungen...");

      if (!firebaseUser) {
        setUserId(null);
        resetForms();
        setIsLoadingUser(false);
        setSaveMessage("Nicht eingeloggt.");
        return;
      }

      setUserId(firebaseUser.uid);
      const userRef = doc(db, "users", firebaseUser.uid);

      unsubscribeUserDoc = onSnapshot(
        userRef,
        (userSnapshot) => {
          if (!userSnapshot.exists()) {
            applyMissingProfileState(firebaseUser);
            return;
          }

          const data = userSnapshot.data();
          const storedProfile = asRecord(data.profile);
          const storedVitals = asRecord(storedProfile.vitals);
          const storedAiBuddy = asRecord(storedProfile.aiBuddy);
          const storedLifestyle = asRecord(storedProfile.lifestyle);
          const storedActivity = asRecord(storedProfile.activity);
          const storedSettings = asRecord(data.settings);
          const storedReminders = asRecord(storedSettings.reminders);
          const storedPrivacy = asRecord(storedSettings.privacy);
          const storedPermissions = asRecord(storedSettings.permissions) as Partial<typeof defaultPermissions>;
          const firstName = asString(data.firstName);
          const lastName = asString(data.lastName);
          const displayNameFromUser = `${firstName} ${lastName}`.trim();

          setProfile({
            displayName:
              asString(storedSettings.displayName)
              || displayNameFromUser
              || firebaseUser.displayName
              || "",
            email:
              asString(storedSettings.email)
              || asString(data.email)
              || firebaseUser.email
              || "",
            phone: asString(storedSettings.phone),
            language: asString(storedSettings.language, "Deutsch"),
            birthDate:
              asString(storedSettings.birthDate)
              || asString(storedProfile.birthdate),
            gender:
              asString(storedSettings.gender)
              || genderToDisplay(asString(storedProfile.gender) || undefined),
            timezone:
              asString(storedSettings.timeZone)
              || asString(storedSettings.timezone)
              || clientTimeZone(),
            units: asString(storedSettings.units, "kg / km"),
          });

          setBiometrics({
            height: String(storedProfile.height ?? defaultBiometrics.height),
            weight: String(storedProfile.weight ?? defaultBiometrics.weight),
            targetWeightEnabled: asBoolean(storedProfile.targetWeight, defaultBiometrics.targetWeightEnabled),
            targetWeight: String(storedProfile.targetWeightValue ?? storedSettings.targetWeight ?? defaultBiometrics.targetWeight),
            bodyType: bodyTypeToDisplay(asString(storedProfile.bodyType) || undefined),
            fitnessLevel: fitnessLevelToDisplay(asString(storedProfile.fitnessLevel) || undefined),
            limitations:
              asString(storedProfile.otherRestriction)
              || (Array.isArray(storedProfile.limitations)
                ? storedProfile.limitations.map(String).join(", ")
                : defaultBiometrics.limitations),
          });

          setVitalValues({
            bodyFat: String(storedVitals.bodyFat ?? ""),
            restingPulse: String(storedVitals.restingPulse ?? ""),
            averagePulse: String(storedVitals.averagePulse ?? ""),
            bloodPressure: String(storedVitals.bloodPressure ?? ""),
            sleepHours: String(storedVitals.sleepHours ?? ""),
            sleepQuality: asString(storedVitals.sleepQuality, defaultVitalValues.sleepQuality),
            stressLevel: asString(storedVitals.stressLevel, defaultVitalValues.stressLevel),
            energyLevel: asString(storedVitals.energyLevel, defaultVitalValues.energyLevel),
            painLevel: asString(storedVitals.painLevel, defaultVitalValues.painLevel),
            medicationNote: asString(storedVitals.medicationNote, defaultVitalValues.medicationNote),
            healthNotes: asString(storedVitals.healthNotes, defaultVitalValues.healthNotes),
          });

          setAiBuddy({
            avatarType: asString(storedAiBuddy.avatarType, defaultAiBuddy.avatarType),
            personality: asString(storedAiBuddy.personality, defaultAiBuddy.personality),
            relationshipMode: asString(storedAiBuddy.relationshipMode, defaultAiBuddy.relationshipMode),
            behaviorDynamics: asString(storedAiBuddy.behaviorDynamics, defaultAiBuddy.behaviorDynamics),
            motivationStyle: asString(storedAiBuddy.motivationStyle, defaultAiBuddy.motivationStyle),
            reactsToStress: asBoolean(storedAiBuddy.reactsToStress, defaultAiBuddy.reactsToStress),
            reactsToSleep: asBoolean(storedAiBuddy.reactsToSleep, defaultAiBuddy.reactsToSleep),
            reactsToActivity: asBoolean(storedAiBuddy.reactsToActivity, defaultAiBuddy.reactsToActivity),
            reactsToMood: asBoolean(storedAiBuddy.reactsToMood, defaultAiBuddy.reactsToMood),
          });

          setLifestyle({
            nutrition:
              asString(storedLifestyle.nutrition)
              || asString(storedProfile.nutrition, defaultLifestyle.nutrition),
            mealRhythm: asString(storedLifestyle.mealRhythm, defaultLifestyle.mealRhythm),
            drinkReminder:
              asString(storedLifestyle.drinkReminder)
              || asString(storedProfile.drinkReminder, defaultLifestyle.drinkReminder),
            drinkAmount: String(storedLifestyle.drinkAmount ?? storedProfile.drinkAmount ?? defaultLifestyle.drinkAmount),
            caffeineIntake: asString(storedLifestyle.caffeineIntake, defaultLifestyle.caffeineIntake),
            alcoholFrequency: asString(storedLifestyle.alcoholFrequency, defaultLifestyle.alcoholFrequency),
            sleepRoutine: asString(storedLifestyle.sleepRoutine, defaultLifestyle.sleepRoutine),
            natureMove:
              asString(storedLifestyle.natureMove)
              || asString(storedProfile.natureMove, defaultLifestyle.natureMove),
            stressCoping: asString(storedLifestyle.stressCoping, defaultLifestyle.stressCoping),
            screenTime: asString(storedLifestyle.screenTime, defaultLifestyle.screenTime),
            notes: asString(storedLifestyle.notes),
          });

          setActivity({
            activityLevel:
              asString(storedActivity.activityLevel)
              || asString(storedProfile.activityLevel, defaultActivity.activityLevel),
            trainingTime:
              asString(storedActivity.trainingTime)
              || asString(storedProfile.trainingTime, defaultActivity.trainingTime),
            communityMode:
              asString(storedActivity.communityMode)
              || asString(storedProfile.communityMode, defaultActivity.communityMode),
            interests: arrayToText(storedActivity.interests ?? storedProfile.interests, defaultActivity.interests),
            activities: arrayToText(storedActivity.activities ?? storedProfile.activities, defaultActivity.activities),
            goals: arrayToText(storedActivity.goals ?? storedProfile.goals, defaultActivity.goals),
            preferredMissionTypes: arrayToText(storedActivity.preferredMissionTypes, defaultActivity.preferredMissionTypes),
            socialPreference: asString(storedActivity.socialPreference, defaultActivity.socialPreference),
            competitionMode: asString(storedActivity.competitionMode, defaultActivity.competitionMode),
            notes: asString(storedActivity.notes),
          });

          setPrivacy({
            leaderboardVisible: asBoolean(storedPrivacy.leaderboardVisible, defaultPrivacy.leaderboardVisible),
            buddySharing: asBoolean(storedPrivacy.buddySharing, defaultPrivacy.buddySharing),
            anonymousAnalytics: asBoolean(storedPrivacy.anonymousAnalytics, defaultPrivacy.anonymousAnalytics),
            friendRequests: asBoolean(storedPrivacy.friendRequests, defaultPrivacy.friendRequests),
            teamInvitations: asBoolean(storedPrivacy.teamInvitations, defaultPrivacy.teamInvitations),
            localUsersVisible: asBoolean(storedPrivacy.localUsersVisible, defaultPrivacy.localUsersVisible),
            pvpAllowed: asBoolean(storedPrivacy.pvpAllowed, defaultPrivacy.pvpAllowed),
            profileVisibility: asString(storedPrivacy.profileVisibility, defaultPrivacy.profileVisibility),
            healthDataUsage: asString(storedPrivacy.healthDataUsage, defaultPrivacy.healthDataUsage),
            locationSharing: asString(storedPrivacy.locationSharing, defaultPrivacy.locationSharing),
          });

          setNotifications({
            missionReminder: asBoolean(storedReminders.missionReminder, defaultNotifications.missionReminder),
            sleepReminder: asBoolean(storedReminders.sleepReminder, defaultNotifications.sleepReminder),
            weeklyReport: asBoolean(storedReminders.weeklyReport, defaultNotifications.weeklyReport),
            glitchAlert: asBoolean(storedReminders.glitchAlert, defaultNotifications.glitchAlert),
          });

          if (Object.keys(storedPermissions).length > 0) {
            const mergedPermissions = { ...defaultPermissions, ...storedPermissions };
            setPermissions(mergedPermissions);
            localStorage.setItem("wellfit-permissions", JSON.stringify(mergedPermissions));
          }

          if (!hasLoadedCurrentUserDoc) {
            setSaveMessage("Einstellungen geladen.");
            hasLoadedCurrentUserDoc = true;
          }
          setIsLoadingUser(false);
        },
        (error) => {
          console.error("Fehler beim Live-Laden der Einstellungen", error);
          setSaveMessage("Einstellungen konnten nicht live geladen werden.");
          setIsLoadingUser(false);
        },
      );
    });

    return () => {
      unsubscribeUserDoc?.();
      unsubscribeAuth();
    };
  }, []);
}
