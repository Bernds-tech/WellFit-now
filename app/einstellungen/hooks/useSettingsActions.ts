"use client";

import { auth, db } from "@/lib/firebase";
import { sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

import type {
  ActivityForm,
  AiBuddyForm,
  BiometricsForm,
  LifestyleForm,
  NotificationsForm,
  PermissionKey,
  PrivacyForm,
  ProfileForm,
  VitalValuesForm,
} from "../types";
import {
  bodyTypeToStorage,
  fitnessLevelToStorage,
  genderToStorage,
  textToArray,
} from "../lib/settingsMappers";

type PermissionState = Record<PermissionKey, boolean>;

type Params = {
  userId: string | null;
  setSaveMessage: (message: string) => void;
  setSecurityMessage: (message: string) => void;
  setIsSendingPasswordReset: (value: boolean) => void;
  setPermissions: React.Dispatch<React.SetStateAction<PermissionState>>;
};

export function useSettingsActions({
  userId,
  setSaveMessage,
  setSecurityMessage,
  setIsSendingPasswordReset,
  setPermissions,
}: Params) {
  const requireUser = (message: string) => {
    if (userId) return true;
    setSaveMessage(message);
    return false;
  };

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

  const saveProfile = async (profile: ProfileForm, permissions: PermissionState) => {
    if (!requireUser("Bitte melde dich an, um dein Profil zu speichern.")) return;

    try {
      const [firstName, ...lastNameParts] = profile.displayName.trim().split(" ");
      await setDoc(
        doc(db, "users", userId!),
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

  const saveBiometrics = async (biometrics: BiometricsForm) => {
    if (!requireUser("Bitte melde dich an, um Körperdaten zu speichern.")) return;

    try {
      await setDoc(
        doc(db, "users", userId!),
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

  const saveNotifications = async (notifications: NotificationsForm) => {
    if (!requireUser("Bitte melde dich an, um Benachrichtigungen zu speichern.")) return;

    try {
      await setDoc(
        doc(db, "users", userId!),
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

  const saveVitalValues = async (vitalValues: VitalValuesForm) => {
    if (!requireUser("Bitte melde dich an, um Vitalwerte zu speichern.")) return;

    try {
      await setDoc(
        doc(db, "users", userId!),
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

  const saveAiBuddy = async (aiBuddy: AiBuddyForm) => {
    if (!requireUser("Bitte melde dich an, um deinen KI-Buddy zu speichern.")) return;

    try {
      await setDoc(
        doc(db, "users", userId!),
        { profile: { aiBuddy }, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      setSaveMessage("KI-Buddy & Avatar-Verhalten gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern des KI-Buddys", error);
      setSaveMessage("KI-Buddy konnte nicht gespeichert werden.");
    }
  };

  const saveLifestyle = async (lifestyle: LifestyleForm) => {
    if (!requireUser("Bitte melde dich an, um Lebensstil & Ernährung zu speichern.")) return;

    try {
      await setDoc(
        doc(db, "users", userId!),
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

  const saveActivity = async (activity: ActivityForm) => {
    if (!requireUser("Bitte melde dich an, um Aktivität & Interessen zu speichern.")) return;

    try {
      const activityPayload = {
        ...activity,
        interests: textToArray(activity.interests),
        activities: textToArray(activity.activities),
        goals: textToArray(activity.goals),
        preferredMissionTypes: textToArray(activity.preferredMissionTypes),
      };
      await setDoc(
        doc(db, "users", userId!),
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
      setSaveMessage("Aktivität & Interessen konnten nicht gespeichert werden.");
    }
  };

  const savePrivacy = async (privacy: PrivacyForm) => {
    if (!requireUser("Bitte melde dich an, um Privatsphäre zu speichern.")) return;

    try {
      await setDoc(
        doc(db, "users", userId!),
        { settings: { privacy }, updatedAt: new Date().toISOString() },
        { merge: true },
      );
      setSaveMessage("Privatsphäre gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern der Privatsphäre", error);
      setSaveMessage("Privatsphäre konnte nicht gespeichert werden.");
    }
  };

  const sendSecurityPasswordReset = async (email: string) => {
    if (!email) {
      setSecurityMessage("Keine E-Mail-Adresse für diesen Account gefunden.");
      return;
    }

    try {
      setIsSendingPasswordReset(true);
      setSecurityMessage("Passwort-Link wird gesendet...");
      await sendPasswordResetEmail(auth, email);
      setSecurityMessage("Passwort-Reset-Link wurde an deine E-Mail-Adresse gesendet.");
      setSaveMessage("Sicherheits-E-Mail gesendet.");
    } catch (error) {
      console.error("Fehler beim Passwort-Reset", error);
      setSecurityMessage("Passwort-Reset konnte nicht gesendet werden. Bitte prüfe die E-Mail-Adresse.");
    } finally {
      setIsSendingPasswordReset(false);
    }
  };

  const savePermissions = async (permissions: PermissionState) => {
    if (!requireUser("Bitte melde dich an, um Berechtigungen zu speichern.")) return;

    try {
      await setDoc(
        doc(db, "users", userId!),
        {
          settings: { permissions },
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

  const updatePermission = (permissions: PermissionState, key: PermissionKey, value: boolean) => {
    const updated = { ...permissions, [key]: value };
    setPermissions(updated);
    localStorage.setItem("wellfit-permissions", JSON.stringify(updated));
    return updated;
  };

  return {
    handleLogout,
    saveProfile,
    saveBiometrics,
    saveNotifications,
    saveVitalValues,
    saveAiBuddy,
    saveLifestyle,
    saveActivity,
    savePrivacy,
    sendSecurityPasswordReset,
    savePermissions,
    updatePermission,
  };
}
