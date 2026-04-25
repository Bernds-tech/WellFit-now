"use client";

import SettingsCard from "./SettingsCard";
import SensitiveNotice from "./SensitiveNotice";

export default function BiometricsCard({
  biometrics,
  inputClass,
  selectClass,
  saveButtonClass,
  isLoadingUser,
  updateBiometricsField,
  saveBiometrics,
  ToggleButton,
  toggleBase,
}: any) {
  return (
    <SettingsCard title="Biometrie & Körper">
      <SensitiveNotice />

      <div className="space-y-3">
        <div className="grid grid-cols-[1fr_85px_35px_85px_28px] items-center gap-2">
          <label className="text-xs text-white/70">Größe & Gewicht</label>
          <input
            className={inputClass}
            value={biometrics.height}
            onChange={(e) =>
              updateBiometricsField("height", e.target.value)
            }
          />
          <span className="text-xs text-white/70">cm</span>
          <input
            className={inputClass}
            value={biometrics.weight}
            onChange={(e) =>
              updateBiometricsField("weight", e.target.value)
            }
          />
          <span className="text-xs text-white/70">kg</span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2">
          <span>Zielgewicht anstreben</span>
          <ToggleButton
            enabled={biometrics.targetWeightEnabled}
            onClick={() =>
              updateBiometricsField(
                "targetWeightEnabled",
                !biometrics.targetWeightEnabled
              )
            }
            toggleBase={toggleBase}
          />
        </div>

        <div className="grid grid-cols-[1fr_85px_28px] items-center gap-2">
          <label className="text-xs text-white/70">Zielgewicht</label>
          <input
            className={inputClass}
            value={biometrics.targetWeight}
            onChange={(e) =>
              updateBiometricsField("targetWeight", e.target.value)
            }
          />
          <span className="text-xs text-white/70">kg</span>
        </div>

        <div>
          <label className="text-xs text-white/70">Körperbau</label>
          <select
            className={selectClass}
            value={biometrics.bodyType}
            onChange={(e) =>
              updateBiometricsField("bodyType", e.target.value)
            }
          >
            <option>Schlank</option>
            <option>Normal</option>
            <option>Kräftig</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-white/70">Fitnesslevel</label>
          <select
            className={selectClass}
            value={biometrics.fitnessLevel}
            onChange={(e) =>
              updateBiometricsField("fitnessLevel", e.target.value)
            }
          >
            <option>Anfänger</option>
            <option>Fortgeschritten</option>
            <option>Aktiv</option>
          </select>
        </div>

        <div>
          <label className="text-xs text-white/70">
            Einschränkungen / Verletzungen
          </label>
          <input
            className={inputClass}
            value={biometrics.limitations}
            onChange={(e) =>
              updateBiometricsField("limitations", e.target.value)
            }
          />
        </div>
      </div>

      <button
        className={saveButtonClass}
        onClick={saveBiometrics}
        disabled={isLoadingUser}
      >
        Änderungen speichern
      </button>
    </SettingsCard>
  );
}
