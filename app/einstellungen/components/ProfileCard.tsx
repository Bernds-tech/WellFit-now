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
  saveProfile: () => void;
};

const languages = ["Deutsch", "English"];
const genders = ["Männlich", "Weiblich", "Divers"];
const timezones = ["Europe/Vienna", "Europe/Berlin", "UTC"];
const units = ["kg / km", "lbs / miles"];

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
          <label className="mb-1 block text-xs text-white/70">E-Mail Adresse</label>
          <input
            className={inputClass}
            value={profile.email}
            onChange={(event) => updateProfileField("email", event.target.value)}
            placeholder="name@example.com"
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
          <label className="mb-1 block text-xs text-white/70">Geburtsdatum</label>
          <input
            type="date"
            className={inputClass}
            value={profile.birthDate}
            onChange={(event) => updateProfileField("birthDate", event.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/70">Geschlecht</label>
          <select
            className={selectClass}
            value={profile.gender}
            onChange={(event) => updateProfileField("gender", event.target.value)}
          >
            {genders.map((gender) => (
              <option key={gender}>{gender}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-white/70">Zeitzone</label>
          <select
            className={selectClass}
            value={profile.timezone}
            onChange={(event) => updateProfileField("timezone", event.target.value)}
          >
            {timezones.map((timezone) => (
              <option key={timezone}>{timezone}</option>
            ))}
          </select>
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
        Änderungen speichern
      </button>
    </SettingsCard>
  );
}
