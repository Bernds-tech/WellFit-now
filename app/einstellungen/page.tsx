"use client";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { sendPasswordResetEmail, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

import SettingsHeader from "./components/SettingsHeader";
import { useSettingsData } from "./hooks/useSettingsData";
import AppSidebar from "@/app/AppSidebar";
import { useSettingsActions } from "./hooks/useSettingsActions";

import ProfileCard from "./components/ProfileCard";
import SecurityCard from "./components/SecurityCard";
import BiometricsCard from "./components/BiometricsCard";
import VitalValuesCard from "./components/VitalValuesCard";

import NotificationsCard from "./components/NotificationsCard";
import LifestyleCard from "./components/LifestyleCard";

import AiBuddyCard from "./components/AiBuddyCard";
import PrivacyCard from "./components/PrivacyCard";
import PermissionsCard from "./components/PermissionsCard";
import AccountManagementCard from "./components/AccountManagementCard";

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

  const {
  handleLogout,
} = useSettingsActions({
  userId,
  setSaveMessage,
  setSecurityMessage,
  setIsSendingPasswordReset,
  setPermissions,
});

  useSettingsData({
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
  });

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

<ProfileCard
  profile={profile}
  inputClass={inputClass}
  selectClass={selectClass}
  saveButtonClass={saveButtonClass}
  isLoadingUser={isLoadingUser}
  updateProfileField={updateProfileField}
  saveProfile={saveProfile}
/>

<SecurityCard
  email={profile.email}
  securityMessage={securityMessage}
  isLoadingUser={isLoadingUser}
  isSendingPasswordReset={isSendingPasswordReset}
  saveButtonClass={saveButtonClass}
  sendSecurityPasswordReset={sendSecurityPasswordReset}
/>

<BiometricsCard
  biometrics={biometrics}
  inputClass={inputClass}
  selectClass={selectClass}
  saveButtonClass={saveButtonClass}
  isLoadingUser={isLoadingUser}
  updateBiometricsField={updateBiometricsField}
  saveBiometrics={saveBiometrics}
  ToggleButton={ToggleButton}
  toggleBase={toggleBase}
/>

<NotificationsCard
  notifications={notifications}
  saveButtonClass={saveButtonClass}
  isLoadingUser={isLoadingUser}
  updateNotificationField={updateNotificationField}
  saveNotifications={saveNotifications}
  ToggleButton={ToggleButton}
  toggleBase={toggleBase}
/>

<VitalValuesCard
  vitalValues={vitalValues}
  inputClass={inputClass}
  selectClass={selectClass}
  saveButtonClass={saveButtonClass}
  isLoadingUser={isLoadingUser}
  updateVitalValuesField={updateVitalValuesField}
  saveVitalValues={saveVitalValues}
/>            

<LifestyleCard
  lifestyle={lifestyle}
  inputClass={inputClass}
  selectClass={selectClass}
  saveButtonClass={saveButtonClass}
  isLoadingUser={isLoadingUser}
  updateLifestyleField={updateLifestyleField}
  saveLifestyle={saveLifestyle}
/>

<AiBuddyCard
  aiBuddy={aiBuddy}
  selectClass={selectClass}
  saveButtonClass={saveButtonClass}
  isLoadingUser={isLoadingUser}
  updateAiBuddyField={updateAiBuddyField}
  saveAiBuddy={saveAiBuddy}
  ToggleButton={ToggleButton}
  toggleBase={toggleBase}
/>

<PrivacyCard
  privacy={privacy}
  selectClass={selectClass}
  saveButtonClass={saveButtonClass}
  isLoadingUser={isLoadingUser}
  updatePrivacyField={updatePrivacyField}
  savePrivacy={savePrivacy}
  ToggleButton={ToggleButton}
  toggleBase={toggleBase}
/>

<PermissionsCard
  permissions={permissions}
  selectClass={selectClass}
  saveButtonClass={saveButtonClass}
  isLoadingUser={isLoadingUser}
  updatePermission={updatePermission}
  savePermissions={() => savePermissions()}
  toggleBase={toggleBase}
/>

<AccountManagementCard />
      
          </div>
        </section>
      </div>
    </main>
  );
}
