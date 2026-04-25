"use client";

import type { PrivacyForm } from "../types";
import SettingsCard from "./SettingsCard";

export default function PrivacyCard({
  privacy,
  selectClass,
  saveButtonClass,
  isLoadingUser,
  updatePrivacyField,
  savePrivacy,
  ToggleButton,
  toggleBase,
}: {
  privacy: PrivacyForm;
  selectClass: string;
  saveButtonClass: string;
  isLoadingUser: boolean;
  updatePrivacyField: (key: keyof PrivacyForm, value: string | boolean) => void;
  savePrivacy: () => void;
  ToggleButton: React.ComponentType<{ enabled: boolean; onClick: () => void; toggleBase: string }>;
  toggleBase: string;
}) {
  const toggles: { key: keyof PrivacyForm; label: string }[] = [
    { key: "leaderboardVisible", label: "Im Leaderboard sichtbar" },
    { key: "buddySharing", label: "Buddy-Status mit Freunden teilen" },
    { key: "anonymousAnalytics", label: "Anonyme Nutzungsanalyse erlauben" },
    { key: "friendRequests", label: "Freundschaftsanfragen erlauben" },
    { key: "teamInvitations", label: "Team-Einladungen erlauben" },
    { key: "localUsersVisible", label: "Für lokale Nutzer sichtbar sein" },
    { key: "pvpAllowed", label: "Direkte Challenges / PvP erlauben" },
  ];

  return (
    <SettingsCard title="Privatsphäre">
      <p className="mb-3 rounded-lg border border-cyan-300/20 bg-[#0a3d46] px-3 py-2 text-xs text-cyan-100">
        Hier steuerst du, welche Daten sichtbar sind und wofür sie verwendet werden. Gesundheits- und Verfassungsdaten bleiben standardmäßig nur für Personalisierung aktiv.
      </p>
      <div className="space-y-3">
        <SelectField label="Profil-Sichtbarkeit" value={privacy.profileVisibility} options={["Privat", "Freunde", "Community"]} className={selectClass} onChange={(value) => updatePrivacyField("profileVisibility", value)} />
        <SelectField label="Nutzung von Gesundheits-/Verfassungsdaten" value={privacy.healthDataUsage} options={["Nur Personalisierung", "Personalisierung & anonyme Verbesserung", "Nicht verwenden"]} className={selectClass} onChange={(value) => updatePrivacyField("healthDataUsage", value)} />
        <SelectField label="Standortfreigabe" value={privacy.locationSharing} options={["Nie", "Nur Freunde", "Nur Team", "Community"]} className={selectClass} onChange={(value) => updatePrivacyField("locationSharing", value)} />
        {toggles.map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2">
            <span className="text-white/85">{item.label}</span>
            <ToggleButton enabled={Boolean(privacy[item.key])} onClick={() => updatePrivacyField(item.key, !Boolean(privacy[item.key]))} toggleBase={toggleBase} />
          </div>
        ))}
      </div>
      <button className={saveButtonClass} onClick={savePrivacy} disabled={isLoadingUser}>
        Änderungen speichern
      </button>
    </SettingsCard>
  );
}

function SelectField({ label, value, options, className, onChange }: { label: string; value: string; options: string[]; className: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-white/70">{label}</label>
      <select className={className} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}
