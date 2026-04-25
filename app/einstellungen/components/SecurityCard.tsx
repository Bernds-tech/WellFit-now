"use client";

import SettingsCard from "./SettingsCard";

export default function SecurityCard({
  email,
  securityMessage,
  isLoadingUser,
  isSendingPasswordReset,
  saveButtonClass,
  sendSecurityPasswordReset,
}: {
  email: string;
  securityMessage: string;
  isLoadingUser: boolean;
  isSendingPasswordReset: boolean;
  saveButtonClass: string;
  sendSecurityPasswordReset: () => void;
}) {
  return (
    <SettingsCard title="Sicherheit">
      <div className="space-y-3">
        <div className="rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2">
          <p className="font-semibold text-white">Login-E-Mail</p>
          <p className="mt-1 text-xs text-white/70">{email || "Keine E-Mail geladen"}</p>
        </div>

        <div className="rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2">
          <p className="font-semibold text-white">Passwort ändern</p>
          <p className="mt-1 text-xs text-white/70">
            Aus Sicherheitsgründen senden wir einen Passwort-Reset-Link an deine registrierte E-Mail-Adresse.
          </p>
        </div>

        <button
          className={saveButtonClass}
          onClick={sendSecurityPasswordReset}
          disabled={isLoadingUser || isSendingPasswordReset}
        >
          {isSendingPasswordReset ? "Wird gesendet..." : "Passwort-Reset senden"}
        </button>

        {securityMessage && (
          <p className="rounded-lg border border-cyan-300/20 bg-[#0a3d46] px-3 py-2 text-xs text-cyan-100">
            {securityMessage}
          </p>
        )}

        <div className="rounded-lg border border-yellow-400/20 bg-yellow-400/10 px-3 py-2 text-xs text-yellow-100">
          2FA, Geräteverwaltung und aktive Sessions werden als nächste Sicherheitsausbaustufe vorbereitet.
        </div>
      </div>
    </SettingsCard>
  );
}
