"use client";

import { useState } from "react";

import AppSidebar from "@/app/AppSidebar";
import { useWellFitBrightness } from "@/app/hooks/useWellFitBrightness";
import AccountManagementCard from "./components/AccountManagementCard";
import ActivityCard from "./components/ActivityCard";
import AiBuddyCard from "./components/AiBuddyCard";
import BiometricsCard from "./components/BiometricsCard";
import LifestyleCard from "./components/LifestyleCard";
import NotificationsCard from "./components/NotificationsCard";
import PermissionsCard from "./components/PermissionsCard";
import PrivacyCard from "./components/PrivacyCard";
import ProfileCard from "./components/ProfileCard";
import SecurityCard from "./components/SecurityCard";
import SettingsHeader from "./components/SettingsHeader";
import ToggleButton from "./components/ToggleButton";
import VitalValuesCard from "./components/VitalValuesCard";
import { useSettingsActions } from "./hooks/useSettingsActions";
import { useSettingsData } from "./hooks/useSettingsData";
import {
  defaultActivity,
  defaultAiBuddy,
  defaultBiometrics,
  defaultLifestyle,
  defaultNotifications,
  defaultPermissions,
  defaultPrivacy,
  defaultProfile,
  defaultVitalValues,
} from "./lib/settingsDefaults";
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
} from "./types";

export default function SettingsPage() {
  const [brightness, setBrightness] = useWellFitBrightness(100);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [securityMessage, setSecurityMessage] = useState("");
  const [isSendingPasswordReset, setIsSendingPasswordReset] = useState(false);
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [profile, setProfile] = useState<ProfileForm>(defaultProfile);
  const [biometrics, setBiometrics] = useState<BiometricsForm>(defaultBiometrics);
  const [notifications, setNotifications] = useState<NotificationsForm>(defaultNotifications);
  const [vitalValues, setVitalValues] = useState<VitalValuesForm>(defaultVitalValues);
  const [aiBuddy, setAiBuddy] = useState<AiBuddyForm>(defaultAiBuddy);
  const [lifestyle, setLifestyle] = useState<LifestyleForm>(defaultLifestyle);
  const [activity, setActivity] = useState<ActivityForm>(defaultActivity);
  const [privacy, setPrivacy] = useState<PrivacyForm>(defaultPrivacy);
  const [healthConsentActive, setHealthConsentActive] = useState(false);
  const [healthImprovementConsentActive, setHealthImprovementConsentActive] = useState(false);

  const {
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
    updatePermission: updatePermissionAction,
  } = useSettingsActions({
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
    setHealthConsentActive,
    setHealthImprovementConsentActive,
  });

  const updateProfileField = (key: keyof ProfileForm, value: string) => setProfile((previous) => ({ ...previous, [key]: value }));
  const updateBiometricsField = (key: keyof BiometricsForm, value: string | boolean) => setBiometrics((previous) => ({ ...previous, [key]: value }));
  const updateNotificationField = (key: keyof NotificationsForm, value: boolean) => setNotifications((previous) => ({ ...previous, [key]: value }));
  const updateVitalValuesField = (key: keyof VitalValuesForm, value: string | boolean) => setVitalValues((previous) => ({ ...previous, [key]: value }));
  const updateAiBuddyField = (key: keyof AiBuddyForm, value: string | boolean) => setAiBuddy((previous) => ({ ...previous, [key]: value }));
  const updateLifestyleField = (key: keyof LifestyleForm, value: string) => setLifestyle((previous) => ({ ...previous, [key]: value }));
  const updateActivityField = (key: keyof ActivityForm, value: string) => setActivity((previous) => ({ ...previous, [key]: value }));
  const updatePrivacyField = (key: keyof PrivacyForm, value: string | boolean) => setPrivacy((previous) => ({ ...previous, [key]: value }));
  const updatePermission = (key: PermissionKey, value: boolean) => updatePermissionAction(permissions, key, value);

  const inputClass = "w-full rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2 text-sm text-white outline-none placeholder:text-white/35";
  const selectClass = "w-full rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2 text-sm text-white outline-none";
  const saveButtonClass = "mt-4 inline-flex rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-500";
  const toggleBase = "relative inline-flex h-6 w-12 items-center rounded-full transition";
  const sensitiveSettingsDisabled = isLoadingUser || !healthConsentActive;

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{
        background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))`,
      }}
    >
      <div className="flex h-full">
        <AppSidebar brightness={brightness} onBrightnessChange={setBrightness} onLogout={handleLogout} />
        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-7 py-5 pb-0">
          <SettingsHeader isLoadingUser={isLoadingUser} saveMessage={saveMessage} />

          <div className="mt-2 flex items-center justify-between gap-3">
            <div className={`rounded-lg border px-4 py-2 text-xs font-semibold ${healthConsentActive ? "border-emerald-300/25 bg-emerald-500/10 text-emerald-100" : "border-yellow-300/25 bg-yellow-500/10 text-yellow-100"}`}>
              {healthConsentActive
                ? `Freiwillige Health-Personalisierung aktiv${healthImprovementConsentActive ? " · anonyme Verbesserung aktiv" : ""}.`
                : "Health-Personalisierung ist deaktiviert. Körper-, Vital- und Lebensstildaten werden nicht gespeichert."}
            </div>
            <button className="rounded-lg border border-cyan-300/20 bg-[#0a3d46] px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-[#0d4b56]">
              Generationen-Tandem
            </button>
          </div>

          <div className="mt-3 grid flex-1 grid-cols-3 gap-4 overflow-y-auto pr-2 pb-8 text-sm">
            <ProfileCard profile={profile} inputClass={inputClass} selectClass={selectClass} saveButtonClass={saveButtonClass} isLoadingUser={isLoadingUser} updateProfileField={updateProfileField} saveProfile={() => saveProfile(profile)} />
            <SecurityCard email={profile.email} securityMessage={securityMessage} isLoadingUser={isLoadingUser} isSendingPasswordReset={isSendingPasswordReset} saveButtonClass={saveButtonClass} sendSecurityPasswordReset={() => sendSecurityPasswordReset(profile.email)} />
            <BiometricsCard biometrics={biometrics} inputClass={inputClass} selectClass={selectClass} saveButtonClass={saveButtonClass} isLoadingUser={sensitiveSettingsDisabled} updateBiometricsField={updateBiometricsField} saveBiometrics={() => saveBiometrics(biometrics)} ToggleButton={ToggleButton} toggleBase={toggleBase} />
            <NotificationsCard notifications={notifications} saveButtonClass={saveButtonClass} isLoadingUser={isLoadingUser} updateNotificationField={updateNotificationField} saveNotifications={() => saveNotifications(notifications)} ToggleButton={ToggleButton} toggleBase={toggleBase} />
            <VitalValuesCard vitalValues={vitalValues} inputClass={inputClass} selectClass={selectClass} saveButtonClass={saveButtonClass} isLoadingUser={sensitiveSettingsDisabled} updateVitalValuesField={updateVitalValuesField} saveVitalValues={() => saveVitalValues(vitalValues)} ToggleButton={ToggleButton} toggleBase={toggleBase} />
            <LifestyleCard lifestyle={lifestyle} inputClass={inputClass} selectClass={selectClass} saveButtonClass={saveButtonClass} isLoadingUser={sensitiveSettingsDisabled} updateLifestyleField={updateLifestyleField} saveLifestyle={() => saveLifestyle(lifestyle)} />
            <ActivityCard activity={activity} inputClass={inputClass} selectClass={selectClass} saveButtonClass={saveButtonClass} isLoadingUser={isLoadingUser} updateActivityField={updateActivityField} saveActivity={() => saveActivity(activity)} />
            <AiBuddyCard aiBuddy={aiBuddy} selectClass={selectClass} saveButtonClass={saveButtonClass} isLoadingUser={isLoadingUser} updateAiBuddyField={updateAiBuddyField} saveAiBuddy={() => saveAiBuddy(aiBuddy)} ToggleButton={ToggleButton} toggleBase={toggleBase} />
            <PrivacyCard privacy={privacy} selectClass={selectClass} saveButtonClass={saveButtonClass} isLoadingUser={isLoadingUser} updatePrivacyField={updatePrivacyField} savePrivacy={() => savePrivacy(privacy)} ToggleButton={ToggleButton} toggleBase={toggleBase} />
            <PermissionsCard permissions={permissions} selectClass={selectClass} saveButtonClass={saveButtonClass} isLoadingUser={isLoadingUser} updatePermission={updatePermission} savePermissions={() => savePermissions(permissions)} toggleBase={toggleBase} />
            <AccountManagementCard />
          </div>
        </section>
      </div>
    </main>
  );
}
