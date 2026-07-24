"use client";

import type { LifestyleForm } from "../types";
import SensitiveNotice from "./SensitiveNotice";
import SettingsCard from "./SettingsCard";

type LifestyleCardProps = {
  lifestyle: LifestyleForm;
  inputClass: string;
  selectClass: string;
  saveButtonClass: string;
  isLoadingUser: boolean;
  updateLifestyleField: (key: keyof LifestyleForm, value: string) => void;
  saveLifestyle: () => void | Promise<void>;
};

const nutritionOptions = ["Ausgewogen", "Vegetarisch", "Vegan", "Low Carb", "High Protein", "Unregelmäßig"];
const mealRhythmOptions = ["Regelmäßig", "Unregelmäßig", "Intervallfasten", "Viele kleine Mahlzeiten"];
const reminderOptions = ["Niedrig", "Normal", "Hoch"];
const levelOptions = ["Niedrig", "Mittel", "Hoch"];
const alcoholOptions = ["Nie", "Selten", "Gelegentlich", "Regelmäßig"];
const sleepRoutineOptions = ["Regelmäßig", "Unregelmäßig", "Schicht / wechselnd"];
const natureMoveOptions = ["Selten", "Gelegentlich", "Häufig", "Täglich"];
const stressCopingOptions = [
  "Spaziergang / Bewegung",
  "Musik",
  "Meditation / Atmung",
  "Gaming",
  "Freunde / Familie",
  "Noch keine Routine",
];

export default function LifestyleCard({
  lifestyle,
  inputClass,
  selectClass,
  saveButtonClass,
  isLoadingUser,
  updateLifestyleField,
  saveLifestyle,
}: LifestyleCardProps) {
  return (
    <SettingsCard title="Lebensstil & Ernährung">
      <SensitiveNotice />
      <div className="space-y-3">
        <SelectField label="Ernährungsstil" value={lifestyle.nutrition} options={nutritionOptions} className={selectClass} onChange={(value) => updateLifestyleField("nutrition", value)} />
        <SelectField label="Mahlzeitenrhythmus" value={lifestyle.mealRhythm} options={mealRhythmOptions} className={selectClass} onChange={(value) => updateLifestyleField("mealRhythm", value)} />
        <SelectField label="Trinkerinnerung" value={lifestyle.drinkReminder} options={reminderOptions} className={selectClass} onChange={(value) => updateLifestyleField("drinkReminder", value)} />
        <div className="grid grid-cols-[1fr_80px_45px] items-center gap-2">
          <label className="text-white/85">Trinkziel pro Tag</label>
          <input type="number" inputMode="decimal" className={inputClass} value={lifestyle.drinkAmount} onChange={(event) => updateLifestyleField("drinkAmount", event.target.value)} />
          <span>Liter</span>
        </div>
        <SelectField label="Koffein" value={lifestyle.caffeineIntake} options={levelOptions} className={selectClass} onChange={(value) => updateLifestyleField("caffeineIntake", value)} />
        <SelectField label="Alkohol" value={lifestyle.alcoholFrequency} options={alcoholOptions} className={selectClass} onChange={(value) => updateLifestyleField("alcoholFrequency", value)} />
        <SelectField label="Schlafroutine" value={lifestyle.sleepRoutine} options={sleepRoutineOptions} className={selectClass} onChange={(value) => updateLifestyleField("sleepRoutine", value)} />
        <SelectField label="Bewegung in der Natur" value={lifestyle.natureMove} options={natureMoveOptions} className={selectClass} onChange={(value) => updateLifestyleField("natureMove", value)} />
        <SelectField label="Stress-Ausgleich" value={lifestyle.stressCoping} options={stressCopingOptions} className={selectClass} onChange={(value) => updateLifestyleField("stressCoping", value)} />
        <SelectField label="Screen-Time Gefühl" value={lifestyle.screenTime} options={levelOptions} className={selectClass} onChange={(value) => updateLifestyleField("screenTime", value)} />
        <p className="rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-[10px] text-white/55">
          Freie Lebensstil- oder Gesundheitsnotizen werden in Beta 1 nicht gespeichert. Die Auswahlfelder werden nur im privaten Serverprofil abgelegt.
        </p>
      </div>
      <button className={saveButtonClass} onClick={saveLifestyle} disabled={isLoadingUser}>
        Privat serverseitig speichern
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
