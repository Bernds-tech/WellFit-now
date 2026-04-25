"use client";

import type { ActivityForm } from "../types";
import SensitiveNotice from "./SensitiveNotice";
import SettingsCard from "./SettingsCard";

export default function ActivityCard({
  activity,
  inputClass,
  selectClass,
  saveButtonClass,
  isLoadingUser,
  updateActivityField,
  saveActivity,
}: {
  activity: ActivityForm;
  inputClass: string;
  selectClass: string;
  saveButtonClass: string;
  isLoadingUser: boolean;
  updateActivityField: (key: keyof ActivityForm, value: string) => void;
  saveActivity: () => void;
}) {
  return (
    <SettingsCard title="Aktivität & Interessen">
      <SensitiveNotice />
      <div className="space-y-3">
        <SelectField label="Aktivitätslevel" value={activity.activityLevel} options={["Kaum aktiv", "Gelegentlich aktiv", "Regelmäßig aktiv", "Sehr aktiv", "Sportlich ambitioniert"]} className={selectClass} onChange={(value) => updateActivityField("activityLevel", value)} />
        <SelectField label="Bevorzugte Trainingszeit" value={activity.trainingTime} options={["Morgens", "Mittags", "Nachmittags", "Abends", "Flexibel"]} className={selectClass} onChange={(value) => updateActivityField("trainingTime", value)} />
        <SelectField label="Community-Modus" value={activity.communityMode} options={["Alleine", "Alleine & gelegentlich gemeinsam", "Freunde & kleine Gruppen", "Community & Events", "Familie / Generationen-Tandem"]} className={selectClass} onChange={(value) => updateActivityField("communityMode", value)} />
        <TextAreaField label="Interessen" value={activity.interests} inputClass={inputClass} placeholder="z. B. Fitness, Natur, Gaming, Lernen" onChange={(value) => updateActivityField("interests", value)} />
        <TextAreaField label="Aktivitäten" value={activity.activities} inputClass={inputClass} placeholder="z. B. Gehen, Radfahren, Workouts" onChange={(value) => updateActivityField("activities", value)} />
        <TextAreaField label="Ziele" value={activity.goals} inputClass={inputClass} placeholder="z. B. Fitter werden, abnehmen, Stress reduzieren" onChange={(value) => updateActivityField("goals", value)} />
        <TextAreaField label="Bevorzugte Missionstypen" value={activity.preferredMissionTypes} inputClass={inputClass} placeholder="z. B. Bewegung, Wissen, AR, Team, Natur" onChange={(value) => updateActivityField("preferredMissionTypes", value)} />
        <SelectField label="Soziale Präferenz" value={activity.socialPreference} options={["Alleine", "Freunde & kleine Gruppen", "Familie", "Öffentliche Gruppen", "Gemischt"]} className={selectClass} onChange={(value) => updateActivityField("socialPreference", value)} />
        <SelectField label="Wettbewerbsmodus" value={activity.competitionMode} options={["Aus", "Locker", "Motivierend", "Stark kompetitiv"]} className={selectClass} onChange={(value) => updateActivityField("competitionMode", value)} />
        <TextAreaField label="Notizen für Missionen" value={activity.notes} inputClass={inputClass} placeholder="Optional: was der KI-Buddy bei Missionen beachten soll" minHeight="min-h-[80px]" onChange={(value) => updateActivityField("notes", value)} />
      </div>
      <button className={saveButtonClass} onClick={saveActivity} disabled={isLoadingUser}>
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

function TextAreaField({ label, value, inputClass, placeholder, minHeight = "min-h-[70px]", onChange }: { label: string; value: string; inputClass: string; placeholder: string; minHeight?: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label className="mb-1 block text-xs text-white/70">{label}</label>
      <textarea className={`${inputClass} ${minHeight} resize-none`} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
    </div>
  );
}
