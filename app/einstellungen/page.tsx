"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

type PermissionKey = "location" | "camera" | "microphone" | "backgroundTracking";

type ProfileForm = {
  displayName: string;
  email: string;
  phone: string;
  language: string;
  birthDate: string;
  gender: string;
  timezone: string;
  units: string;
};

type BiometricsForm = {
  height: string;
  weight: string;
  targetWeightEnabled: boolean;
  targetWeight: string;
  bodyType: string;
  fitnessLevel: string;
  limitations: string;
};

type NotificationsForm = {
  missionReminder: boolean;
  sleepReminder: boolean;
  weeklyReport: boolean;
  glitchAlert: boolean;
};

const defaultPermissions = {
  location: false,
  camera: true,
  microphone: true,
  backgroundTracking: true,
};

const defaultProfile: ProfileForm = {
  displayName: "",
  email: "",
  phone: "",
  language: "Deutsch",
  birthDate: "",
  gender: "Männlich",
  timezone: "Europe/Vienna",
  units: "kg / km",
};

const defaultBiometrics: BiometricsForm = {
  height: "180",
  weight: "82",
  targetWeightEnabled: false,
  targetWeight: "78",
  bodyType: "Schlank",
  fitnessLevel: "Anfänger",
  limitations: "Keine",
};

const defaultNotifications: NotificationsForm = {
  missionReminder: true,
  sleepReminder: true,
  weeklyReport: true,
  glitchAlert: true,
};

const genderToDisplay = (gender?: string) => {
  if (gender === "female") return "Weiblich";
  if (gender === "diverse") return "Divers";
  return "Männlich";
};

const genderToStorage = (gender: string) => {
  if (gender === "Weiblich") return "female";
  if (gender === "Divers") return "diverse";
  return "male";
};

const bodyTypeToDisplay = (bodyType?: string) => {
  if (bodyType === "athletic") return "Normal";
  if (bodyType === "strong") return "Kräftig";
  return "Schlank";
};

const bodyTypeToStorage = (bodyType: string) => {
  if (bodyType === "Normal") return "athletic";
  if (bodyType === "Kräftig") return "strong";
  return "slim";
};

const fitnessLevelToDisplay = (fitnessLevel?: string) => {
  if (fitnessLevel === "medium") return "Fortgeschritten";
  if (fitnessLevel === "pro") return "Aktiv";
  return "Anfänger";
};

const fitnessLevelToStorage = (fitnessLevel: string) => {
  if (fitnessLevel === "Fortgeschritten") return "medium";
  if (fitnessLevel === "Aktiv") return "pro";
  return "beginner";
};

const ToggleButton = ({
  enabled,
  onClick,
  toggleBase,
}: {
  enabled: boolean;
  onClick: () => void;
  toggleBase: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`${toggleBase} ${enabled ? "bg-cyan-400" : "bg-white/20"}`}
  >
    <span
      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
        enabled ? "translate-x-8" : "translate-x-1"
      }`}
    />
  </button>
);

export default function SettingsPage() {
  const [brightness, setBrightness] = useState(100);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [profile, setProfile] = useState<ProfileForm>(defaultProfile);
  const [biometrics, setBiometrics] = useState<BiometricsForm>(defaultBiometrics);
  const [notifications, setNotifications] =
    useState<NotificationsForm>(defaultNotifications);

  useEffect(() => {
    const savedPermissions = localStorage.getItem("wellfit-permissions");

    if (savedPermissions) {
      try {
        const parsed = JSON.parse(savedPermissions);
        setPermissions((prev) => ({
          ...prev,
          ...parsed,
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
              lastName: firebaseUser.displayName?.split(" ").slice(1).join(" ") ?? "",
              email: firebaseUser.email ?? "",
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
              profile: {
                birthdate: "",
                gender: "male",
                height: Number(defaultBiometrics.height),
                weight: Number(defaultBiometrics.weight),
                targetWeight: defaultBiometrics.targetWeightEnabled,
                targetWeightValue: Number(defaultBiometrics.targetWeight),
                bodyType: bodyTypeToStorage(defaultBiometrics.bodyType),
                fitnessLevel: fitnessLevelToStorage(defaultBiometrics.fitnessLevel),
                otherRestriction: defaultBiometrics.limitations,
              },
              settings: {
                ...fallbackProfile,
                permissions: defaultPermissions,
                reminders: defaultNotifications,
              },
              createdAt: new Date().toISOString(),
            },
            { merge: true }
          );

          setProfile(fallbackProfile);
          setBiometrics(defaultBiometrics);
          setNotifications(defaultNotifications);
          setSaveMessage("Profil wurde neu angelegt.");
          setIsLoadingUser(false);
          return;
        }

        const data = userSnap.data();
        const storedProfile = (data.profile ?? {}) as Record<string, any>;
        const storedSettings = (data.settings ?? {}) as Record<string, any>;
        const storedReminders = (storedSettings.reminders ?? {}) as Record<string, any>;
        const storedPermissions =
          (storedSettings.permissions as Partial<typeof defaultPermissions> | undefined) ??
          undefined;

        const firstName = typeof data.firstName === "string" ? data.firstName : "";
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
            (typeof data.email === "string" ? data.email : firebaseUser.email ?? ""),
          phone: (storedSettings.phone as string | undefined) ?? "",
          language: (storedSettings.language as string | undefined) ?? "Deutsch",
          birthDate:
            (storedSettings.birthDate as string | undefined) ??
            (storedProfile.birthdate as string | undefined) ??
            "",
          gender:
            (storedSettings.gender as string | undefined) ??
            genderToDisplay(storedProfile.gender as string | undefined),
          timezone: (storedSettings.timezone as string | undefined) ?? "Europe/Vienna",
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
              defaultBiometrics.targetWeight
          ),
          bodyType: bodyTypeToDisplay(storedProfile.bodyType as string | undefined),
          fitnessLevel: fitnessLevelToDisplay(storedProfile.fitnessLevel as string | undefined),
          limitations:
            (storedProfile.otherRestriction as string | undefined) ??
            (Array.isArray(storedProfile.limitations)
              ? storedProfile.limitations.join(", ")
              : defaultBiometrics.limitations),
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
            JSON.stringify(mergedPermissions)
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

  const updateProfileField = (key: keyof ProfileForm, value: string) => {
    setProfile((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateBiometricsField = (
    key: keyof BiometricsForm,
    value: string | boolean
  ) => {
    setBiometrics((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNotificationField = (
    key: keyof NotificationsForm,
    value: boolean
  ) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveProfile = async () => {
    if (!userId) {
      setSaveMessage("Bitte melde dich an, um dein Profil zu speichern.");
      return;
    }

    try {
      const [firstName, ...lastNameParts] = profile.displayName.trim().split(" ");

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
        { merge: true }
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
        { merge: true }
      );

      setSaveMessage("Biometrie & Körper gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern der Körperdaten", error);
      setSaveMessage("Körperdaten konnten nicht gespeichert werden.");
    }
  };

  const saveNotifications = async () => {
    if (!userId) {
      setSaveMessage("Bitte melde dich an, um Benachrichtigungen zu speichern.");
      return;
    }

    try {
      await setDoc(
        doc(db, "users", userId),
        {
          settings: {
            reminders: notifications,
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setSaveMessage("Benachrichtigungen gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern der Benachrichtigungen", error);
      setSaveMessage("Benachrichtigungen konnten nicht gespeichert werden.");
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
          settings: {
            permissions: updatedPermissions,
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setSaveMessage("App-Berechtigungen gespeichert.");
    } catch (error) {
      console.error("Fehler beim Speichern der Berechtigungen", error);
      setSaveMessage("Berechtigungen konnten nicht gespeichert werden.");
    }
  };

  const updatePermission = (key: PermissionKey, value: boolean) => {
    const updated = {
      ...permissions,
      [key]: value,
    };

    setPermissions(updated);
    localStorage.setItem("wellfit-permissions", JSON.stringify(updated));
  };

  const cardClass =
    "rounded-[30px] bg-[#053841]/85 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.12)]";
  const inputClass =
    "w-full rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3 text-white outline-none placeholder:text-white/35";
  const selectClass =
    "w-full rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3 text-white outline-none";
  const saveButtonClass =
    "mt-5 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-500";
  const toggleBase =
    "relative inline-flex h-7 w-14 items-center rounded-full transition";

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{
        background: `linear-gradient(to bottom right, rgba(0,170,190,${brightness / 100}), rgba(0,80,90,1))`,
      }}
    >
      <div className="flex h-full">
        <aside className="flex h-full w-[250px] flex-col border-r border-cyan-400/10 bg-[#042f35]/95 px-5 py-6">
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo.png"
              alt="WellFit Logo"
              width={150}
              height={150}
              className="object-contain"
              priority
            />
          </div>

          <nav className="space-y-2 text-[14px]">
            <Link href="/dashboard" className="block text-white/80">
              Dashboard
            </Link>
            <div className="text-white/80">Missionen</div>
            <div className="text-white/80">Mein KI-Buddy</div>
            <div className="text-white/80">Marktplatz</div>
            <div className="text-white/80">Leaderboard</div>
            <div className="text-white/80">Punkte-Shop</div>
            <div className="text-white/80">Analytics & Stats</div>
          </nav>

          <div className="mt-10 border-t border-cyan-400/10 pt-8">
            <div className="mb-3 text-xl font-bold text-green-400">
              App aufs Handy laden
            </div>

            <label className="mb-2 block text-lg">Helligkeit</label>
            <input
              type="range"
              min="5"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full"
            />
            <div className="mt-2 text-right text-sm text-white/70">
              {brightness}%
            </div>
          </div>

          <div className="mt-auto pt-8">
            <div className="space-y-2 text-[14px]">
              <div className="block font-bold text-cyan-300">Einstellungen</div>
              <Link href="/datenschutz" className="block text-white/80">
                Datenschutz
              </Link>
              <Link href="/agb" className="block text-white/80">
                AGB
              </Link>
              <Link href="/impressum" className="block text-white/80">
                Impressum
              </Link>
              <Link href="/faq" className="block text-white/80">
                FAQ
              </Link>
              <div className="block text-white/80">Hilfe</div>
            </div>

            <div className="mt-6 border-t border-cyan-400/10 pt-4">
              <button className="text-[14px] font-bold text-red-400 hover:text-red-300">
                Abmelden
              </button>
            </div>
          </div>
        </aside>

        <section className="relative flex h-full flex-1 flex-col overflow-hidden px-10 py-7 pb-0">
          <header className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-7xl font-extrabold leading-none">
                Einstellungen
              </h1>
              <p className="mt-2 text-2xl text-cyan-100/90">
                Verwalte dein Profil, Berechtigungen und App-Verhalten
              </p>
              <p className="mt-2 text-lg text-cyan-100/70">
                {isLoadingUser ? "Lade deine gespeicherten Angaben..." : saveMessage}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button className="rounded-full border border-cyan-300/20 bg-[#0a6b78]/20 px-6 py-3 text-white/90">
                Synchron
              </button>
              <button className="rounded-[22px] bg-orange-500 px-7 py-4 font-bold text-white transition hover:bg-orange-600">
                Tracker Starten
              </button>
              <div className="rounded-full bg-[#073b44] px-5 py-3 font-semibold text-cyan-100">
                Flammi LVL 1
              </div>
            </div>
          </header>

          <div className="mt-4 flex justify-end">
            <button className="rounded-xl border border-cyan-300/20 bg-[#0a3d46] px-5 py-3 font-semibold text-cyan-100 hover:bg-[#0d4b56]">
              Generationen-Tandem
            </button>
          </div>

          <div className="grid flex-1 grid-cols-3 gap-6 overflow-y-auto pr-2 pb-10">
            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">
                Profil & Account
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Anzeigename
                  </label>
                  <input
                    className={inputClass}
                    value={profile.displayName}
                    onChange={(e) => updateProfileField("displayName", e.target.value)}
                    placeholder="Vorname Nachname"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    E-Mail Adresse
                  </label>
                  <input
                    className={inputClass}
                    value={profile.email}
                    onChange={(e) => updateProfileField("email", e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Telefonnummer
                  </label>
                  <input
                    className={inputClass}
                    value={profile.phone}
                    onChange={(e) => updateProfileField("phone", e.target.value)}
                    placeholder="+43 ..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Sprache
                  </label>
                  <select
                    className={selectClass}
                    value={profile.language}
                    onChange={(e) => updateProfileField("language", e.target.value)}
                  >
                    <option>Deutsch</option>
                    <option>English</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Geburtsdatum
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={profile.birthDate}
                    onChange={(e) => updateProfileField("birthDate", e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Geschlecht
                  </label>
                  <select
                    className={selectClass}
                    value={profile.gender}
                    onChange={(e) => updateProfileField("gender", e.target.value)}
                  >
                    <option>Männlich</option>
                    <option>Weiblich</option>
                    <option>Divers</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Zeitzone
                  </label>
                  <select
                    className={selectClass}
                    value={profile.timezone}
                    onChange={(e) => updateProfileField("timezone", e.target.value)}
                  >
                    <option>Europe/Vienna</option>
                    <option>Europe/Berlin</option>
                    <option>UTC</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Einheiten
                  </label>
                  <select
                    className={selectClass}
                    value={profile.units}
                    onChange={(e) => updateProfileField("units", e.target.value)}
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
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">Sicherheit</h2>
              <p className="text-white/70">Passwortänderung und 2FA folgen in einem separaten Sicherheitsschritt.</p>
              <button className={saveButtonClass} disabled>Passwort ändern</button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">Biometrie & Körper</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-[1fr_120px_60px_120px_40px] items-center gap-3">
                  <label className="text-sm text-white/70">Größe & Gewicht</label>
                  <input
                    className={inputClass}
                    value={biometrics.height}
                    onChange={(e) => updateBiometricsField("height", e.target.value)}
                  />
                  <span className="text-white/70">cm</span>
                  <input
                    className={inputClass}
                    value={biometrics.weight}
                    onChange={(e) => updateBiometricsField("weight", e.target.value)}
                  />
                  <span className="text-white/70">kg</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                  <span className="text-white/85">Zielgewicht anstreben</span>
                  <ToggleButton
                    enabled={biometrics.targetWeightEnabled}
                    onClick={() =>
                      updateBiometricsField(
                        "targetWeightEnabled",
                        !biometrics.targetWeightEnabled
                      )
                    }
                    toggleBase={toggleBase}
                  />
                </div>

                <div className="grid grid-cols-[1fr_120px_40px] items-center gap-3">
                  <label className="text-sm text-white/70">Zielgewicht</label>
                  <input
                    className={inputClass}
                    value={biometrics.targetWeight}
                    onChange={(e) => updateBiometricsField("targetWeight", e.target.value)}
                  />
                  <span className="text-white/70">kg</span>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">Körperbau</label>
                  <select
                    className={selectClass}
                    value={biometrics.bodyType}
                    onChange={(e) => updateBiometricsField("bodyType", e.target.value)}
                  >
                    <option>Schlank</option>
                    <option>Normal</option>
                    <option>Kräftig</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">Fitnesslevel</label>
                  <select
                    className={selectClass}
                    value={biometrics.fitnessLevel}
                    onChange={(e) => updateBiometricsField("fitnessLevel", e.target.value)}
                  >
                    <option>Anfänger</option>
                    <option>Fortgeschritten</option>
                    <option>Aktiv</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Einschränkungen / Verletzungen
                  </label>
                  <input
                    className={inputClass}
                    value={biometrics.limitations}
                    onChange={(e) => updateBiometricsField("limitations", e.target.value)}
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
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">Benachrichtigungen</h2>
              <div className="space-y-4">
                {[
                  { key: "missionReminder" as keyof NotificationsForm, label: "Missions-Erinnerung" },
                  { key: "sleepReminder" as keyof NotificationsForm, label: "Schlaf-Erinnerung" },
                  { key: "weeklyReport" as keyof NotificationsForm, label: "Wochenreport" },
                  { key: "glitchAlert" as keyof NotificationsForm, label: "Glitch-Alarm" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3"
                  >
                    <span className="text-white/85">{item.label}</span>
                    <ToggleButton
                      enabled={notifications[item.key]}
                      onClick={() =>
                        updateNotificationField(item.key, !notifications[item.key])
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
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">Erweiterte Vitalwerte</h2>
              <p className="text-white/70">Vitalwerte werden als eigene Profilsektion gespeichert.</p>
              <button className={saveButtonClass} disabled>Änderungen speichern</button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">Lebensstil & Ernährung</h2>
              <p className="text-white/70">Diese Karte wird im nächsten Schritt mit Firestore verbunden.</p>
              <button className={saveButtonClass} disabled>Änderungen speichern</button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">Aktivität & Interessen</h2>
              <p className="text-white/70">Aktivitätslevel, Interessen und Aktivitäten werden aus der Registrierung übernommen.</p>
              <button className={saveButtonClass} disabled>Änderungen speichern</button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">KI-Tuning & Ziele</h2>
              <p className="text-white/70">Buddy-Tonalität, Ziele und Erinnerungsintensität werden im nächsten Schritt ergänzt.</p>
              <button className={saveButtonClass} disabled>Änderungen speichern</button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">Privatsphäre</h2>
              <p className="text-white/70">Privatsphäre-Schalter werden im nächsten Schritt speicherbar gemacht.</p>
              <button className={saveButtonClass} disabled>Änderungen speichern</button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">App-Berechtigungen</h2>

              <div className="space-y-5">
                <div className="rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                  <p className="font-semibold text-white">Standort (GPS)</p>
                  <p className="mb-3 text-sm text-white/60">
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
                  { key: "camera" as PermissionKey, label: "Kamera-Zugriff", text: "Für AR-Erlebnisse & Edge-AI Tracking" },
                  { key: "microphone" as PermissionKey, label: "Mikrofon", text: "Für Spracheingabe und Buddy-Funktionen" },
                  { key: "backgroundTracking" as PermissionKey, label: "Hintergrund-Aktivität", text: "Schritte im Hintergrund weiterzählen" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-white">{item.label}</p>
                      <p className="text-sm text-white/60">{item.text}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => updatePermission(item.key, !permissions[item.key])}
                      className={`${toggleBase} ${permissions[item.key] ? "bg-cyan-400" : "bg-white/20"}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${permissions[item.key] ? "translate-x-8" : "translate-x-1"}`}
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
              <h2 className="mb-5 text-3xl font-bold text-red-400">Account Verwaltung</h2>
              <p className="mb-5 text-white/70">
                Aktionen in diesem Bereich können nicht rückgängig gemacht werden.
              </p>
              <div className="space-y-4">
                <button className="w-full rounded-xl border border-cyan-300/20 bg-[#0a3d46] px-6 py-4 font-bold text-white">
                  Meine Daten anfordern (DSGVO)
                </button>
                <button className="w-full rounded-xl border border-cyan-300/20 bg-[#0a3d46] px-6 py-4 font-bold text-white">
                  Logout auf allen Geräten
                </button>
                <button className="w-full rounded-xl border border-red-500/50 bg-red-500/10 px-6 py-4 font-bold text-red-300">
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
