"use client";

import SettingsCard from "./SettingsCard";
import SensitiveNotice from "./SensitiveNotice";

export default function VitalValuesCard({
  vitalValues,
  inputClass,
  selectClass,
  saveButtonClass,
  isLoadingUser,
  updateVitalValuesField,
  saveVitalValues,
}: any) {
  return (
    <SettingsCard title="Erweiterte Vitalwerte">
      <SensitiveNotice />

      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_80px_30px] items-center gap-2">
          <label>Körperfettanteil</label>
          <input
            className={inputClass}
            value={vitalValues.bodyFat}
            onChange={(e) =>
              updateVitalValuesField("bodyFat", e.target.value)
            }
          />
          <span>%</span>
        </div>

        <div className="grid grid-cols-[1fr_80px_45px] items-center gap-2">
          <label>Ruhepuls</label>
          <input
            className={inputClass}
            value={vitalValues.restingPulse}
            onChange={(e) =>
              updateVitalValuesField("restingPulse", e.target.value)
            }
          />
          <span>bpm</span>
        </div>

        <div className="grid grid-cols-[1fr_80px_45px] items-center gap-2">
          <label>Durchschnittspuls</label>
          <input
            className={inputClass}
            value={vitalValues.averagePulse}
            onChange={(e) =>
              updateVitalValuesField("averagePulse", e.target.value)
            }
          />
          <span>bpm</span>
        </div>

        <div className="grid grid-cols-[1fr_80px_55px] items-center gap-2">
          <label>Blutdruck</label>
          <input
            className={inputClass}
            value={vitalValues.bloodPressure}
            onChange={(e) =>
              updateVitalValuesField("bloodPressure", e.target.value)
            }
          />
          <span>mmHg</span>
        </div>

        <div className="grid grid-cols-[1fr_80px_45px] items-center gap-2">
          <label>Schlafdauer</label>
          <input
            className={inputClass}
            value={vitalValues.sleepHours}
            onChange={(e) =>
              updateVitalValuesField("sleepHours", e.target.value)
            }
          />
          <span>Std.</span>
        </div>

        <div>
          <label>Schlafqualität</label>
          <select
            className={selectClass}
            value={vitalValues.sleepQuality}
            onChange={(e) =>
              updateVitalValuesField("sleepQuality", e.target.value)
            }
          >
            <option>Niedrig</option>
            <option>Mittel</option>
            <option>Hoch</option>
          </select>
        </div>

        <div>
          <label>Stresslevel</label>
          <select
            className={selectClass}
            value={vitalValues.stressLevel}
            onChange={(e) =>
              updateVitalValuesField("stressLevel", e.target.value)
            }
          >
            <option>Niedrig</option>
            <option>Mittel</option>
            <option>Hoch</option>
          </select>
        </div>

        <div>
          <label>Energielevel</label>
          <select
            className={selectClass}
            value={vitalValues.energyLevel}
            onChange={(e) =>
              updateVitalValuesField("energyLevel", e.target.value)
            }
          >
            <option>Niedrig</option>
            <option>Mittel</option>
            <option>Hoch</option>
          </select>
        </div>

        <div>
          <label>Schmerzlevel</label>
          <select
            className={selectClass}
            value={vitalValues.painLevel}
            onChange={(e) =>
              updateVitalValuesField("painLevel", e.target.value)
            }
          >
            <option>Keine</option>
            <option>Leicht</option>
            <option>Mittel</option>
            <option>Stark</option>
          </select>
        </div>

        <div>
          <label>Medikamentenhinweis</label>
          <input
            className={inputClass}
            value={vitalValues.medicationNote}
            onChange={(e) =>
              updateVitalValuesField("medicationNote", e.target.value)
            }
          />
        </div>

        <div>
          <label>Gesundheitliche Hinweise</label>
          <textarea
            className={inputClass}
            value={vitalValues.healthNotes}
            onChange={(e) =>
              updateVitalValuesField("healthNotes", e.target.value)
            }
          />
        </div>
      </div>

      <button
        className={saveButtonClass}
        onClick={saveVitalValues}
        disabled={isLoadingUser}
      >
        Änderungen speichern
      </button>
    </SettingsCard>
  );
}
