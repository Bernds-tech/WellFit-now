"use client";

import type { PermissionKey } from "../types";
import SettingsCard from "./SettingsCard";

export default function PermissionsCard({
  permissions,
  selectClass,
  saveButtonClass,
  isLoadingUser,
  updatePermission,
  savePermissions,
  toggleBase,
}: {
  permissions: Record<PermissionKey, boolean>;
  selectClass: string;
  saveButtonClass: string;
  isLoadingUser: boolean;
  updatePermission: (key: PermissionKey, value: boolean) => void;
  savePermissions: () => void;
  toggleBase: string;
}) {
  const toggleItems: { key: PermissionKey; label: string; text: string }[] = [
    { key: "camera", label: "Kamera-Zugriff", text: "Für AR-Erlebnisse & Edge-AI Tracking" },
    { key: "microphone", label: "Mikrofon", text: "Für Spracheingabe und Buddy-Funktionen" },
    { key: "backgroundTracking", label: "Hintergrund-Aktivität", text: "Schritte im Hintergrund weiterzählen" },
  ];

  return (
    <SettingsCard title="App-Berechtigungen">
      <div className="space-y-3">
        <div className="rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2">
          <p className="font-semibold text-white">Standort (GPS)</p>
          <p className="mb-2 text-xs text-white/60">Für Checkpoints, Karten & Reality-Glitches</p>
          <select className={selectClass} value={permissions.location ? "Immer" : "Nie"} onChange={(event) => updatePermission("location", event.target.value !== "Nie")}>
            <option>Immer</option>
            <option>Nur beim Verwenden</option>
            <option>Nie</option>
          </select>
        </div>

        {toggleItems.map((item) => (
          <div key={item.key} className="flex items-center justify-between rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2">
            <div>
              <p className="font-semibold text-white">{item.label}</p>
              <p className="text-xs text-white/60">{item.text}</p>
            </div>
            <button type="button" onClick={() => updatePermission(item.key, !permissions[item.key])} className={`${toggleBase} ${permissions[item.key] ? "bg-cyan-400" : "bg-white/20"}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${permissions[item.key] ? "translate-x-7" : "translate-x-1"}`} />
            </button>
          </div>
        ))}
      </div>
      <button className={saveButtonClass} onClick={savePermissions} disabled={isLoadingUser}>
        Änderungen speichern
      </button>
    </SettingsCard>
  );
}
