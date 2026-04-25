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
  saveLifestyle: () => void;
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
        <div>
          <label className="mb-1 block text-xs text-white/70">Ernährungsstil</label>
          <select className={selectClass} value={lifestyle.nutrition} onChange={(event) => updateLifestyleField("nutrition", event.target.value)}>
            {nutritionOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/70">Mahlzeitenrhythmus</label>
          <select className={selectClass} value={lifestyle.mealRhythm} onChange={(event) => updateLifestyleField("mealRhythm", event.target.value)}>
            {mealRhythmOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/70">Trinkerinnerung</label>
          <select className={selectClass} value={lifestyle.drinkReminder} onChange={(event) => updateLifestyleField("drinkReminder", event.target.value)}>
            {reminderOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-[1fr_80px_45px] items-center gap-2">
          <label className="text-white/85">Trinkziel pro Tag</label>
          <input className={inputClass} value={lifestyle.drinkAmount} onChange={(event) => updateLifestyleField("drinkAmount", event.target.value)} />
          <span>Liter</span>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/70">Koffein</label>
          <select className={selectClass} value={lifestyle.caffeineIntake} onChange={(event) => updateLifestyleField("caffeineIntake", event.target.value)}>
            {levelOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/70">Alkohol</label>
          <select className={selectClass} value={lifestyle.alcoholFrequency} onChange={(event) => updateLifestyleField("alcoholFrequency", event.target.value)}>
            {alcoholOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/70">Schlafroutine</label>
          <select className={selectClass} value={lifestyle.sleepRoutine} onChange={(event) => updateLifestyleField("sleepRoutine", event.target.value)}>
            {sleepRoutineOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/70">Bewegung in der Natur</label>
          <select className={selectClass} value={lifestyle.natureMove} onChange={(event) => updateLifestyleField("natureMove", event.target.value)}>
            {natureMoveOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/70">Stress-Ausgleich</label>
          <select className={selectClass} value={lifestyle.stressCoping} onChange={(event) => updateLifestyleField("stressCoping", event.target.value)}>
            {stressCopingOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/70">Screen-Time Gefühl</label>
          <select className={selectClass} value={lifestyle.screenTime} onChange={(event) => updateLifestyleField("screenTime", event.target.value)}>
            {levelOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-white/70">Notizen für den KI-Buddy</label>
          <textarea
            className={`${inputClass} min-h-[80px] resize-none`}
            value={lifestyle.notes}
            onChange={(event) => updateLifestyleField("notes", event.target.value)}
            placeholder="Optional: Gewohnheiten, Vorlieben oder Alltagshinweise"
          />
        </div>
      </div>
      <button className={saveButtonClass} onClick={saveLifestyle} disabled={isLoadingUser}>
        Änderungen speichern
      </button>
    </SettingsCard>
  );
}
