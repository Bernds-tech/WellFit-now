"use client";

import type { ProfileForm } from "../types";
import SettingsCard from "./SettingsCard";

type ProfileCardProps = {
  profile: ProfileForm;
  inputClass: string;
  selectClass: string;
  saveButtonClass: string;
  isLoadingUser: boolean;
  updateProfileField: (key: keyof ProfileForm, value: string) => void;
  saveProfile: () => void | Promise<void>;
};

const languages = ["Deutsch", "English"];
const units = ["kg / km", "lb / mi"];

export default function ProfileCard({
  profile,
  inputClass,
  selectClass,
  saveButtonClass,
  isLoadingUser,
  updateProfileField,
  saveProfile,
}: ProfileCardProps) {
  return (
    <SettingsCard title="Profil & Account">
      <p className="mb-3 rounded-lg border border-cyan-300/20 bg-[#0a3d46] px-3 py-2 text-xs text-cyan-100">
        Das Geburtsdatum wird nach der Altersprüfung nicht gespeichert. Die E-Mail stammt ausschließlich aus Firebase Authentication. Zeitzonen werden weltweit als gültige IANA-Zonen serverseitig geprüft.
      </p>
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-xs text-white/70">Anzeigename</label>
          <input
            className={inputClass}
            value={profile.displayName}
            onChange={(event) => updateProfileField("displayName", event.target.value)}
            placeholder="Vorname Nachname"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/70">E-Mail-Adresse aus dem Auth-Konto</label>
          <input
            className={`${inputClass} cursor-not-allowed opacity-70`}
            value={profile.email}
            readOnly
            aria-readonly="true"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/70">Telefonnummer</label>
          <input
            className={inputClass}
            value={profile.phone}
            onChange={(event) => updateProfileField("phone", event.target.value)}
            placeholder="+43 ..."
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/70">Sprache</label>
          <select
            className={selectClass}
            value={profile.language}
            onChange={(event) => updateProfileField("language", event.target.value)}
          >
            {languages.map((language) => (
              <option key={language}>{language}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/70">Lokale IANA-Zeitzone</label>
          <input
            className={inputClass}
            value={profile.timezone}
            onChange={(event) => updateProfileField("timezone", event.target.value)}
            placeholder="z. B. Europe/Berlin, Asia/Tokyo"
            autoComplete="off"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/70">Einheiten</label>
          <select
            className={selectClass}
            value={profile.units}
            onChange={(event) => updateProfileField("units", event.target.value)}
          >
            {units.map((unit) => (
              <option key={unit}>{unit}</option>
            ))}
          </select>
        </div>
      </div>

      <button className={saveButtonClass} onClick={saveProfile} disabled={isLoadingUser}>
        Änderungen serverseitig speichern
      </button>
    </SettingsCard>
  );
}
