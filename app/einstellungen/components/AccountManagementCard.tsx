"use client";

import SettingsCard from "./SettingsCard";

export default function AccountManagementCard() {
  return (
    <SettingsCard title="Account Verwaltung" titleClassName="text-red-400">
      <p className="mb-3 text-sm text-white/70">
        Aktionen in diesem Bereich können nicht rückgängig gemacht werden.
      </p>
      <div className="space-y-3">
        <button className="w-full rounded-lg border border-cyan-300/20 bg-[#0a3d46] px-4 py-3 text-sm font-bold text-white">
          Meine Daten anfordern (DSGVO)
        </button>
        <button className="w-full rounded-lg border border-cyan-300/20 bg-[#0a3d46] px-4 py-3 text-sm font-bold text-white">
          Logout auf allen Geräten
        </button>
        <button className="w-full rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">
          Account & Wallet unwiderruflich löschen
        </button>
      </div>
    </SettingsCard>
  );
}
