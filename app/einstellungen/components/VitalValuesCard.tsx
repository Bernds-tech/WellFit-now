"use client";

import type { VitalValuesForm } from "../types";
import SettingsCard from "./SettingsCard";
import SensitiveNotice from "./SensitiveNotice";

type VitalValuesCardProps = {
  vitalValues: VitalValuesForm;
  inputClass: string;
  selectClass: string;
  saveButtonClass: string;
  isLoadingUser: boolean;
  updateVitalValuesField: (key: keyof VitalValuesForm, value: string | boolean) => void;
  saveVitalValues: () => void | Promise<void>;
  ToggleButton: React.ComponentType<{ enabled: boolean; onClick: () => void; toggleBase: string }>;
  toggleBase: string;
};

export default function VitalValuesCard({
  vitalValues,
  inputClass,
  selectClass,
  saveButtonClass,
  isLoadingUser,
  updateVitalValuesField,
  saveVitalValues,
  ToggleButton,
  toggleBase,
}: VitalValuesCardProps) {
  return (
    <SettingsCard title="Erweiterte Vitalwerte">
      <SensitiveNotice />

      <div className="space-y-3">
        <NumberField label="Körperfettanteil" suffix="%" value={vitalValues.bodyFat} inputClass={inputClass} onChange={(value) => updateVitalValuesField("bodyFat", value)} />
        <NumberField label="Ruhepuls" suffix="bpm" value={vitalValues.restingPulse} inputClass={inputClass} onChange={(value) => updateVitalValuesField("restingPulse", value)} />
        <NumberField label="Durchschnittspuls" suffix="bpm" value={vitalValues.averagePulse} inputClass={inputClass} onChange={(value) => updateVitalValuesField("averagePulse", value)} />

        <div className="grid grid-cols-[1fr_100px_55px] items-center gap-2">
          <label>Blutdruck</label>
          <input
            className={inputClass}
            value={vitalValues.bloodPressure}
            onChange={(event) => updateVitalValuesField("bloodPressure", event.target.value)}
            placeholder="120/80"
          />
          <span>mmHg</span>
        </div>

        <NumberField label="Schlafdauer" suffix="Std." value={vitalValues.sleepHours} inputClass={inputClass} onChange={(value) => updateVitalValuesField("sleepHours", value)} />

        <SelectField label="Schlafqualität" value={vitalValues.sleepQuality} options={["Niedrig", "Mittel", "Hoch"]} className={selectClass} onChange={(value) => updateVitalValuesField("sleepQuality", value)} />
        <SelectField label="Stresslevel" value={vitalValues.stressLevel} options={["Niedrig", "Mittel", "Hoch"]} className={selectClass} onChange={(value) => updateVitalValuesField("stressLevel", value)} />
        <SelectField label="Energielevel" value={vitalValues.energyLevel} options={["Niedrig", "Mittel", "Hoch"]} className={selectClass} onChange={(value) => updateVitalValuesField("energyLevel", value)} />
        <SelectField label="Schmerzlevel" value={vitalValues.painLevel} options={["Keine", "Leicht", "Mittel", "Stark"]} className={selectClass} onChange={(value) => updateVitalValuesField("painLevel", value)} />

        <div className="flex items-center justify-between rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2">
          <div>
            <div className="text-white/85">Medikamenteneinnahme angegeben</div>
            <div className="text-[10px] text-white/50">Es werden keine Namen, Dosen oder freien Notizen gespeichert.</div>
          </div>
          <ToggleButton
            enabled={vitalValues.medicationDeclared}
            onClick={() => updateVitalValuesField("medicationDeclared", !vitalValues.medicationDeclared)}
            toggleBase={toggleBase}
          />
        </div>
      </div>

      <button
        className={saveButtonClass}
        onClick={saveVitalValues}
        disabled={isLoadingUser}
      >
        Privat serverseitig speichern
      </button>
    </SettingsCard>
  );
}

function NumberField({ label, suffix, value, inputClass, onChange }: { label: string; suffix: string; value: string; inputClass: string; onChange: (value: string) => void }) {
  return (
    <div className="grid grid-cols-[1fr_80px_45px] items-center gap-2">
      <label>{label}</label>
      <input
        type="number"
        inputMode="decimal"
        className={inputClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <span>{suffix}</span>
    </div>
  );
}

function SelectField({ label, value, options, className, onChange }: { label: string; value: string; options: string[]; className: string; onChange: (value: string) => void }) {
  return (
    <div>
      <label>{label}</label>
      <select className={className} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}
