"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [brightness, setBrightness] = useState(100);

  const [permissions, setPermissions] = useState({
    location: false,
    camera: true,
    microphone: true,
    backgroundTracking: true,
  });

  const [profile, setProfile] = useState({
    displayName: "Bernd Guggenberger",
    email: "bernd@wellfit.pro",
    phone: "+43 600 1234567",
    language: "Deutsch",
    birthDate: "14.05.1990",
  });

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
  }, []);

  useEffect(() => {
    const savedProfile = localStorage.getItem("wellfit-profile");

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch (error) {
        console.error("Fehler beim Laden des Profils", error);
      }
    }
  }, []);

  const saveProfile = () => {
    localStorage.setItem("wellfit-profile", JSON.stringify(profile));
  };

  const updatePermission = (
    key: "location" | "camera" | "microphone" | "backgroundTracking",
    value: boolean
  ) => {
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
    "mt-5 inline-flex rounded-xl bg-orange-500 px-6 py-3 font-bold text-white transition hover:bg-orange-600";
  const toggleBase =
    "relative inline-flex h-7 w-14 items-center rounded-full transition";

  return (
    <main
      className="h-screen w-screen overflow-hidden text-white"
      style={{
        background: `linear-gradient(to bottom right, rgba(0,170,190,${
          brightness / 100
        }), rgba(0,80,90,1))`,
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
                  <input className={inputClass} defaultValue={profile.displayName} />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    E-Mail Adresse
                  </label>
                  <input className={inputClass} defaultValue={profile.email} />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Telefonnummer
                  </label>
                  <input className={inputClass} defaultValue={profile.phone} />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Sprache
                  </label>
                  <select className={selectClass} defaultValue="Deutsch">
                    <option>Deutsch</option>
                    <option>English</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Geburtsdatum
                  </label>
                  <input className={inputClass} defaultValue={profile.birthDate} />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Geschlecht
                  </label>
                  <select className={selectClass} defaultValue="Männlich">
                    <option>Männlich</option>
                    <option>Weiblich</option>
                    <option>Divers</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Zeitzone
                  </label>
                  <select className={selectClass} defaultValue="Europe/Vienna">
                    <option>Europe/Vienna</option>
                    <option>Europe/Berlin</option>
                    <option>UTC</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Einheiten
                  </label>
                  <select className={selectClass} defaultValue="kg / km">
                    <option>kg / km</option>
                    <option>lbs / miles</option>
                  </select>
                </div>
              </div>

              <button onClick={saveProfile} className={saveButtonClass}>
                Änderungen speichern
              </button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">
                Sicherheit
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Aktuelles Passwort
                  </label>
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Neues Passwort
                  </label>
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Neues Passwort bestätigen
                  </label>
                  <input
                    type="password"
                    className={inputClass}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button className={saveButtonClass}>Passwort ändern</button>

              <div className="mt-6 rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-white">2FA</p>
                    <p className="text-sm text-white/60">
                      Zwei-Faktor-Authentifizierung aktivieren
                    </p>
                  </div>
                  <button
                    type="button"
                    className="relative inline-flex h-7 w-14 items-center rounded-full bg-white/20"
                  >
                    <span className="inline-block h-5 w-5 translate-x-1 rounded-full bg-white" />
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                <p className="font-semibold text-white">Geräteverwaltung</p>
                <p className="mb-3 text-sm text-white/60">
                  Verbundene Geräte und Sessions verwalten
                </p>
                <button className="rounded-lg border border-cyan-300/20 px-4 py-2 font-semibold text-cyan-100">
                  Geräte anzeigen
                </button>
              </div>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">
                Biometrie & Körper
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-[1fr_120px_60px_120px_40px] items-center gap-3">
                  <label className="text-sm text-white/70">Größe & Gewicht</label>
                  <input className={inputClass} defaultValue="180" />
                  <span className="text-white/70">cm</span>
                  <input className={inputClass} defaultValue="82" />
                  <span className="text-white/70">kg</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                  <span className="text-white/85">Zielgewicht anstreben</span>
                  <button
                    type="button"
                    className="relative inline-flex h-7 w-14 items-center rounded-full bg-cyan-400"
                  >
                    <span className="inline-block h-5 w-5 translate-x-8 rounded-full bg-white" />
                  </button>
                </div>

                <div className="grid grid-cols-[1fr_120px_40px] items-center gap-3">
                  <label className="text-sm text-white/70">Zielgewicht</label>
                  <input className={inputClass} defaultValue="78" />
                  <span className="text-white/70">kg</span>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Körperbau
                  </label>
                  <select className={selectClass} defaultValue="Schlank">
                    <option>Schlank</option>
                    <option>Normal</option>
                    <option>Kräftig</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Fitnesslevel
                  </label>
                  <select className={selectClass} defaultValue="Anfänger">
                    <option>Anfänger</option>
                    <option>Fortgeschritten</option>
                    <option>Aktiv</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Einschränkungen / Verletzungen
                  </label>
                  <input className={inputClass} defaultValue="Keine" />
                </div>
              </div>

              <button className={saveButtonClass}>Änderungen speichern</button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">
                Erweiterte Vitalwerte
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-[1fr_100px_40px] items-center gap-3">
                  <label className="text-white/85">Körperfettanteil</label>
                  <input className={inputClass} placeholder="--" />
                  <span>%</span>
                </div>

                <div className="grid grid-cols-[1fr_100px_60px] items-center gap-3">
                  <label className="text-white/85">Ruhepuls</label>
                  <input className={inputClass} placeholder="--" />
                  <span>bpm</span>
                </div>

                <div className="grid grid-cols-[1fr_100px_70px] items-center gap-3">
                  <label className="text-white/85">Blutdruck</label>
                  <input className={inputClass} placeholder="--/--" />
                  <span>mmHg</span>
                </div>

                <div className="grid grid-cols-[1fr_120px_60px] items-center gap-3">
                  <label className="text-white/85">Schlafziel</label>
                  <input className={inputClass} defaultValue="8" />
                  <span>Stunden</span>
                </div>
              </div>

              <button className={saveButtonClass}>Änderungen speichern</button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">
                Lebensstil & Ernährung
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Ernährungstyp
                  </label>
                  <select className={selectClass} defaultValue="Allesesser">
                    <option>Allesesser</option>
                    <option>Vegetarisch</option>
                    <option>Vegan</option>
                  </select>
                </div>

                <div className="grid grid-cols-[1fr_120px_60px] items-center gap-3">
                  <label className="text-white/85">Zielkalorien pro Tag</label>
                  <input className={inputClass} defaultValue="2200" />
                  <span>kcal</span>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Allergien & Unverträglichkeiten
                  </label>
                  <input className={inputClass} defaultValue="Keine" />
                </div>

                <div className="grid grid-cols-[1fr_100px_50px] items-center gap-3">
                  <label className="text-white/85">Tägliches Trinkziel</label>
                  <input className={inputClass} defaultValue="2,5" />
                  <span>Liter</span>
                </div>
              </div>

              <button className={saveButtonClass}>Änderungen speichern</button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">
                Aktivität & Interessen
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Aktuelles Aktivitätslevel
                  </label>
                  <select className={selectClass} defaultValue="Trainiere regelmäßig">
                    <option>Sehr aktiv (täglich)</option>
                    <option>Trainiere regelmäßig</option>
                    <option>Gelegentlich aktiv</option>
                    <option>Selten aktiv</option>
                    <option>Einsteiger</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Bevorzugte Aktivitäten
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Laufen, Wandern, AR-Touren ..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Hauptinteressen
                  </label>
                  <input
                    className={inputClass}
                    placeholder="Fitness, Gesundheit, Natur, Geschichte ..."
                  />
                </div>
              </div>

              <button className={saveButtonClass}>Änderungen speichern</button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">
                KI-Tuning & Ziele
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Größtes Hindernis
                  </label>
                  <select className={selectClass} defaultValue="Fehlende Motivation">
                    <option>Fehlende Motivation</option>
                    <option>Zu wenig Zeit</option>
                    <option>Keine Routine</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Buddy-Tonalität
                  </label>
                  <select className={selectClass} defaultValue="Motivierend & Sanft">
                    <option>Motivierend & Sanft</option>
                    <option>Direkt & Hart</option>
                    <option>Spielerisch</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Motivationsstil
                  </label>
                  <select className={selectClass} defaultValue="Positiv">
                    <option>Positiv</option>
                    <option>Direkt</option>
                    <option>Spielerisch</option>
                    <option>Ruhig</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm text-white/70">
                    Erinnerungsintensität
                  </label>
                  <select className={selectClass} defaultValue="Mittel">
                    <option>Niedrig</option>
                    <option>Mittel</option>
                    <option>Hoch</option>
                  </select>
                </div>
              </div>

              <button className={saveButtonClass}>Änderungen speichern</button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">
                Privatsphäre
              </h2>

              <div className="space-y-5">
                {[
                  "Leaderboard Sichtbarkeit",
                  "Buddy-Sharing",
                  "Anonyme Analyse",
                  "Freundesanfragen erlauben",
                  "Team-Einladungen erlauben",
                  "Lokale Nutzer sichtbar",
                  "PvP erlauben",
                ].map((label, index) => {
                  const enabled = index !== 1;
                  return (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3"
                    >
                      <span className="text-white/85">{label}</span>
                      <button
                        type="button"
                        className={`${toggleBase} ${
                          enabled ? "bg-cyan-400" : "bg-white/20"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                            enabled ? "translate-x-8" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button className={saveButtonClass}>Änderungen speichern</button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">
                App-Berechtigungen
              </h2>

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
                      updatePermission("location", e.target.value === "Immer")
                    }
                  >
                    <option>Immer</option>
                    <option>Nur beim Verwenden</option>
                    <option>Nie</option>
                  </select>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                  <div>
                    <p className="font-semibold text-white">Kamera-Zugriff</p>
                    <p className="text-sm text-white/60">
                      Für AR-Erlebnisse & Edge-AI Tracking
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updatePermission("camera", !permissions.camera)}
                    className={`${toggleBase} ${
                      permissions.camera ? "bg-cyan-400" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                        permissions.camera ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                  <div>
                    <p className="font-semibold text-white">Mikrofon</p>
                    <p className="text-sm text-white/60">
                      Für Spracheingabe und Buddy-Funktionen
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updatePermission("microphone", !permissions.microphone)
                    }
                    className={`${toggleBase} ${
                      permissions.microphone ? "bg-cyan-400" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                        permissions.microphone ? "translate-x-8" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                  <div>
                    <p className="font-semibold text-white">Hintergrund-Aktivität</p>
                    <p className="text-sm text-white/60">
                      Schritte im Hintergrund weiterzählen
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      updatePermission(
                        "backgroundTracking",
                        !permissions.backgroundTracking
                      )
                    }
                    className={`${toggleBase} ${
                      permissions.backgroundTracking ? "bg-cyan-400" : "bg-white/20"
                    }`}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                        permissions.backgroundTracking
                          ? "translate-x-8"
                          : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                  <div>
                    <p className="font-semibold text-white">Auto-Start beim Öffnen</p>
                    <p className="text-sm text-white/60">
                      Tracking automatisch vorbereiten
                    </p>
                  </div>
                  <button
                    type="button"
                    className="relative inline-flex h-7 w-14 items-center rounded-full bg-white/20"
                  >
                    <span className="inline-block h-5 w-5 translate-x-1 rounded-full bg-white" />
                  </button>
                </div>
              </div>

              <button className={saveButtonClass}>Änderungen speichern</button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-cyan-300">
                Benachrichtigungen
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                  <span className="text-white/85">Trink-Erinnerung</span>
                  <button
                    type="button"
                    className="relative inline-flex h-7 w-14 items-center rounded-full bg-cyan-400"
                  >
                    <span className="inline-block h-5 w-5 translate-x-8 rounded-full bg-white" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                  <span className="text-white/85">Buddy-Warnungen</span>
                  <button
                    type="button"
                    className="relative inline-flex h-7 w-14 items-center rounded-full bg-cyan-400"
                  >
                    <span className="inline-block h-5 w-5 translate-x-8 rounded-full bg-white" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                  <span className="text-white/85">Missions-Erinnerung</span>
                  <button
                    type="button"
                    className="relative inline-flex h-7 w-14 items-center rounded-full bg-cyan-400"
                  >
                    <span className="inline-block h-5 w-5 translate-x-8 rounded-full bg-white" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                  <span className="text-white/85">Schlaf-Erinnerung</span>
                  <button
                    type="button"
                    className="relative inline-flex h-7 w-14 items-center rounded-full bg-cyan-400"
                  >
                    <span className="inline-block h-5 w-5 translate-x-8 rounded-full bg-white" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                  <span className="text-white/85">Wochenreport</span>
                  <button
                    type="button"
                    className="relative inline-flex h-7 w-14 items-center rounded-full bg-cyan-400"
                  >
                    <span className="inline-block h-5 w-5 translate-x-8 rounded-full bg-white" />
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-cyan-300/10 bg-[#0a3d46] px-4 py-3">
                  <span className="text-white/85">Glitch-Alarm</span>
                  <button
                    type="button"
                    className="relative inline-flex h-7 w-14 items-center rounded-full bg-cyan-400"
                  >
                    <span className="inline-block h-5 w-5 translate-x-8 rounded-full bg-white" />
                  </button>
                </div>
              </div>

              <button className={saveButtonClass}>Änderungen speichern</button>
            </div>

            <div className={cardClass}>
              <h2 className="mb-5 text-3xl font-bold text-red-400">
                Account Verwaltung
              </h2>

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