"use client";

import { auth } from "@/lib/firebase";
import { updateUserAccountProfile } from "@/lib/beta1/clientUserSettings";
import {
  updateUserPrivacyConsents,
  updateUserSettingsSection,
  type PermissionState,
} from "@/lib/beta1/clientUserPreferences";
import { sendPasswordResetEmail, signOut } from "firebase/auth";

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
  defaultBiometrics,
  defaultLifestyle,
  defaultVitalValues,
} from "../lib/settingsDefaults";
import { textToArray } from "../lib/settingsMappers";

type Params = {
  userId: string | null;
  setSaveMessage: (message: string) => void;
  setSecurityMessage: (message: string) => void;
  setIsSendingPasswordReset: (value: boolean) => void;
  setPermissions: React.Dispatch<React.SetStateAction<PermissionState>>;
  setBiometrics: React.Dispatch<React.SetStateAction<BiometricsForm>>;
  setVitalValues: React.Dispatch<React.SetStateAction<VitalValuesForm>>;
  setLifestyle: React.Dispatch<React.SetStateAction<LifestyleForm>>;
  setPrivacy: React.Dispatch<React.SetStateAction<PrivacyForm>>;
  setHealthConsentActive: (value: boolean) => void;
  setHealthImprovementConsentActive: (value: boolean) => void;
};

function optionalNumber(value: string): number | null {
  if (!value.trim()) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : Number.NaN;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function useSettingsActions({
  userId,
  setSaveMessage,
  setSecurityMessage,
  setIsSendingPasswordReset,
  setPermissions,
  setBiometrics,
  setVitalValues,
  setLifestyle,
  setPrivacy,
  setHealthConsentActive,
  setHealthImprovementConsentActive,
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

  const saveProfile = async (profile: ProfileForm) => {
    if (!requireUser("Bitte melde dich an, um dein Profil zu speichern.")) return;
    try {
      const result = await updateUserAccountProfile({
        displayName: profile.displayName,
        phone: profile.phone,
        language: profile.language,
        timeZone: profile.timezone,
        units: profile.units,
      });
      setSaveMessage(
        result.timeZoneChangeDeferred
          ? "Profil gespeichert. Der Zeitzonenwechsel wurde zum Schutz vor Mehrfachbelohnungen vorübergehend zurückgestellt."
          : "Profil & Account serverseitig gespeichert.",
      );
    } catch (error) {
      console.error("Fehler beim Speichern des Profils", error);
      setSaveMessage(errorMessage(error, "Profil konnte nicht gespeichert werden."));
    }
  };

  const saveBiometrics = async (biometrics: BiometricsForm) => {
    if (!requireUser("Bitte melde dich an, um Körperdaten zu speichern.")) return;
    try {
      await updateUserSettingsSection("biometrics", {
        heightCm: optionalNumber(biometrics.height),
        weightKg: optionalNumber(biometrics.weight),
        targetWeightEnabled: biometrics.targetWeightEnabled,
        targetWeightKg: biometrics.targetWeightEnabled ? optionalNumber(biometrics.targetWeight) : null,
        bodyType: biometrics.bodyType,
        fitnessLevel: biometrics.fitnessLevel,
        limitations: textToArray(biometrics.limitations),
      });
      setSaveMessage("Körperdaten im privaten Serverprofil gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern der Körperdaten", error);
      setSaveMessage(errorMessage(error, "Körperdaten konnten nicht gespeichert werden."));
    }
  };

  const saveNotifications = async (notifications: NotificationsForm) => {
    if (!requireUser("Bitte melde dich an, um Benachrichtigungen zu speichern.")) return;
    try {
      await updateUserSettingsSection("notifications", notifications);
      setSaveMessage("Benachrichtigungen serverseitig gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern der Benachrichtigungen", error);
      setSaveMessage(errorMessage(error, "Benachrichtigungen konnten nicht gespeichert werden."));
    }
  };

  const saveVitalValues = async (vitalValues: VitalValuesForm) => {
    if (!requireUser("Bitte melde dich an, um Vitalwerte zu speichern.")) return;
    try {
      await updateUserSettingsSection("vitals", {
        bodyFatPercent: optionalNumber(vitalValues.bodyFat),
        restingPulseBpm: optionalNumber(vitalValues.restingPulse),
        averagePulseBpm: optionalNumber(vitalValues.averagePulse),
        bloodPressure: vitalValues.bloodPressure,
        sleepHours: optionalNumber(vitalValues.sleepHours),
        sleepQuality: vitalValues.sleepQuality,
        stressLevel: vitalValues.stressLevel,
        energyLevel: vitalValues.energyLevel,
        painLevel: vitalValues.painLevel,
        medicationDeclared: vitalValues.medicationDeclared,
      });
      setSaveMessage("Minimierte Vitalwerte im privaten Serverprofil gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern der Vitalwerte", error);
      setSaveMessage(errorMessage(error, "Vitalwerte konnten nicht gespeichert werden."));
    }
  };

  const saveAiBuddy = async (aiBuddy: AiBuddyForm) => {
    if (!requireUser("Bitte melde dich an, um deinen KI-Buddy zu speichern.")) return;
    try {
      await updateUserSettingsSection("buddy", aiBuddy);
      setSaveMessage("KI-Buddy-Präferenzen serverseitig gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern des KI-Buddys", error);
      setSaveMessage(errorMessage(error, "KI-Buddy konnte nicht gespeichert werden."));
    }
  };

  const saveLifestyle = async (lifestyle: LifestyleForm) => {
    if (!requireUser("Bitte melde dich an, um Lebensstil & Ernährung zu speichern.")) return;
    try {
      await updateUserSettingsSection("lifestyle", {
        ...lifestyle,
        drinkAmountLiters: optionalNumber(lifestyle.drinkAmount),
      });
      setSaveMessage("Lebensstil-Daten im privaten Serverprofil gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern von Lebensstil & Ernährung", error);
      setSaveMessage(errorMessage(error, "Lebensstil & Ernährung konnten nicht gespeichert werden."));
    }
  };

  const saveActivity = async (activity: ActivityForm) => {
    if (!requireUser("Bitte melde dich an, um Aktivität & Interessen zu speichern.")) return;
    try {
      await updateUserSettingsSection("activity", {
        ...activity,
        interests: textToArray(activity.interests),
        activities: textToArray(activity.activities),
        goals: textToArray(activity.goals),
        preferredMissionTypes: textToArray(activity.preferredMissionTypes),
      });
      setSaveMessage("Aktivität & Interessen serverseitig gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern von Aktivität & Interessen", error);
      setSaveMessage(errorMessage(error, "Aktivität & Interessen konnten nicht gespeichert werden."));
    }
  };

  const savePrivacy = async (privacy: PrivacyForm) => {
    if (!requireUser("Bitte melde dich an, um Privatsphäre zu speichern.")) return;
    try {
      const result = await updateUserPrivacyConsents(privacy);
      setPrivacy(result.privacy);
      setHealthConsentActive(result.healthConsentActive);
      setHealthImprovementConsentActive(result.healthImprovementConsentActive);
      if (result.healthDataDeleted) {
        setBiometrics(defaultBiometrics);
        setVitalValues(defaultVitalValues);
        setLifestyle(defaultLifestyle);
      }
      setSaveMessage(
        result.healthDataDeleted
          ? "Privatsphäre gespeichert. Die freiwilligen Gesundheitsdaten wurden serverseitig gelöscht."
          : "Privatsphäre und Einwilligungen serverseitig gespeichert.",
      );
    } catch (error) {
      console.error("Fehler beim Speichern der Privatsphäre", error);
      setSaveMessage(errorMessage(error, "Privatsphäre konnte nicht gespeichert werden."));
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
      await updateUserSettingsSection("permissions", permissions);
      localStorage.setItem("wellfit-permissions", JSON.stringify(permissions));
      setSaveMessage("App-Berechtigungen serverseitig gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern der Berechtigungen", error);
      setSaveMessage(errorMessage(error, "Berechtigungen konnten nicht gespeichert werden."));
    }
  };

  const updatePermission = (permissions: PermissionState, key: PermissionKey, value: boolean) => {
    const updated = { ...permissions, [key]: value };
    setPermissions(updated);
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
