"use client";

/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  getUserSettingsState,
  recordUserSessionActivity,
} from "@/lib/beta1/clientUserPreferences";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";

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
  setHealthConsentActive: (value: boolean) => void;
  setHealthImprovementConsentActive: (value: boolean) => void;
};

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
  setHealthConsentActive,
  setHealthImprovementConsentActive,
}: UseSettingsDataParams) {
  useEffect(() => {
    let disposed = false;
    let loadGeneration = 0;

    const resetForms = () => {
      setProfile(defaultProfile);
      setBiometrics(defaultBiometrics);
      setNotifications(defaultNotifications);
      setVitalValues(defaultVitalValues);
      setAiBuddy(defaultAiBuddy);
      setLifestyle(defaultLifestyle);
      setActivity(defaultActivity);
      setPrivacy(defaultPrivacy);
      setPermissions(defaultPermissions);
      setHealthConsentActive(false);
      setHealthImprovementConsentActive(false);
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
      setPermissions(defaultPermissions);
      setHealthConsentActive(false);
      setHealthImprovementConsentActive(false);
      setSaveMessage("Sichere Registrierung noch nicht abgeschlossen. Bitte schließe zuerst das Onboarding ab.");
      setIsLoadingUser(false);
    };

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      const generation = ++loadGeneration;
      setIsLoadingUser(true);
      setSaveMessage("Lade serverseitige Einstellungen...");

      if (!firebaseUser) {
        setUserId(null);
        resetForms();
        setIsLoadingUser(false);
        setSaveMessage("Nicht eingeloggt.");
        return;
      }

      setUserId(firebaseUser.uid);
      try {
        const session = await recordUserSessionActivity("settings");
        if (disposed || generation !== loadGeneration) return;
        if (session.requiresInitialization) {
          applyMissingProfileState(firebaseUser);
          return;
        }

        const state = await getUserSettingsState();
        if (disposed || generation !== loadGeneration) return;
        setProfile(state.profile);
        setNotifications(state.notifications);
        setPermissions(state.permissions);
        setActivity(state.activity);
        setAiBuddy(state.aiBuddy);
        setPrivacy(state.privacy);
        setBiometrics(state.biometrics ?? defaultBiometrics);
        setVitalValues(state.vitalValues ?? defaultVitalValues);
        setLifestyle(state.lifestyle ?? defaultLifestyle);
        setHealthConsentActive(state.healthConsentActive);
        setHealthImprovementConsentActive(state.healthImprovementConsentActive);
        localStorage.setItem("wellfit-permissions", JSON.stringify(state.permissions));
        setSaveMessage(
          state.healthConsentActive
            ? "Einstellungen und freiwillige private Health-Daten serverseitig geladen."
            : "Einstellungen geladen. Health-Personalisierung ist nicht aktiviert.",
        );
      } catch (error) {
        if (disposed || generation !== loadGeneration) return;
        console.error("Fehler beim Laden der serverseitigen Einstellungen", error);
        const message = error instanceof Error ? error.message : "Einstellungen konnten nicht geladen werden.";
        if (message.toLowerCase().includes("registrierung")) {
          applyMissingProfileState(firebaseUser);
          return;
        }
        setSaveMessage(message);
        setIsLoadingUser(false);
        return;
      }
      setIsLoadingUser(false);
    });

    return () => {
      disposed = true;
      loadGeneration += 1;
      unsubscribeAuth();
    };
  }, []);
}
