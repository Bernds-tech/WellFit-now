"use client";

import type { AiBuddyForm } from "../types";
import SensitiveNotice from "./SensitiveNotice";
import SettingsCard from "./SettingsCard";

export default function AiBuddyCard({
  aiBuddy,
  selectClass,
  saveButtonClass,
  isLoadingUser,
  updateAiBuddyField,
  saveAiBuddy,
  ToggleButton,
  toggleBase,
}: {
  aiBuddy: AiBuddyForm;
  selectClass: string;
  saveButtonClass: string;
  isLoadingUser: boolean;
  updateAiBuddyField: (key: keyof AiBuddyForm, value: string | boolean) => void;
  saveAiBuddy: () => void;
  ToggleButton: React.ComponentType<{ enabled: boolean; onClick: () => void; toggleBase: string }>;
  toggleBase: string;
}) {
  const toggles: { key: keyof AiBuddyForm; label: string }[] = [
    { key: "reactsToStress", label: "Auf Stress reagieren" },
    { key: "reactsToSleep", label: "Auf Schlafqualität reagieren" },
    { key: "reactsToActivity", label: "Auf Aktivität reagieren" },
    { key: "reactsToMood", label: "Auf Stimmung reagieren" },
  ];

  return (
    <SettingsCard title="KI-Tuning & Ziele">
      <SensitiveNotice />
      <div className="space-y-3">
        <SelectField label="Avatar-Typ" value={aiBuddy.avatarType} options={["Tierischer Begleiter", "Roboter / Cyborg", "Magisches Wesen", "Abenteuer-Begleiter", "Lese-Freund / Lern-Buddy", "Social Buddy"]} className={selectClass} onChange={(value) => updateAiBuddyField("avatarType", value)} />
        <SelectField label="Buddy-Charakter" value={aiBuddy.personality} options={["Sanft & motivierend", "Direkt & fordernd", "Spielerisch & lustig", "Ruhig & achtsam", "Wettbewerbsorientiert", "Beschützend / fürsorglich"]} className={selectClass} onChange={(value) => updateAiBuddyField("personality", value)} />
        <SelectField label="Beziehungsmodus" value={aiBuddy.relationshipMode} options={["Begleiter", "Coach", "Haustier / Pflegewesen", "Mentor", "Freund", "Abenteuerpartner"]} className={selectClass} onChange={(value) => updateAiBuddyField("relationshipMode", value)} />
        <SelectField label="Verhaltensdynamik" value={aiBuddy.behaviorDynamics} options={["Stabil", "Adaptiv", "Emotional reagierend", "Herausfordernd"]} className={selectClass} onChange={(value) => updateAiBuddyField("behaviorDynamics", value)} />
        <SelectField label="Motivationsstil" value={aiBuddy.motivationStyle} options={["Sanft", "Ausgewogen", "Stärker antreibend"]} className={selectClass} onChange={(value) => updateAiBuddyField("motivationStyle", value)} />
        {toggles.map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2">
            <span className="text-white/85">{item.label}</span>
            <ToggleButton enabled={Boolean(aiBuddy[item.key])} onClick={() => updateAiBuddyField(item.key, !Boolean(aiBuddy[item.key]))} toggleBase={toggleBase} />
          </div>
        ))}
      </div>
      <button className={saveButtonClass} onClick={saveAiBuddy} disabled={isLoadingUser}>
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
