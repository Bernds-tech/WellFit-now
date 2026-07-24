"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  buildAndDownloadUserDataExport,
  cancelAccountDeletion,
  getAccountLifecycleStatus,
  getUserDataExportStatus,
  reauthenticateAccount,
  requestAccountDeletion,
  revokeAllUserSessions,
  type AccountLifecycleStatus,
  type UserDataExportStatus,
} from "@/lib/beta1/clientAccountLifecycle";
import SettingsCard from "./SettingsCard";

function formatDate(value: string | null | undefined): string {
  if (!value) return "–";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("de-AT", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function AccountManagementCard() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [lifecycle, setLifecycle] = useState<AccountLifecycleStatus | null>(null);
  const [exportStatus, setExportStatus] = useState<UserDataExportStatus | null>(null);

  const refresh = async () => {
    const [nextLifecycle, nextExportStatus] = await Promise.all([
      getAccountLifecycleStatus(),
      getUserDataExportStatus(),
    ]);
    setLifecycle(nextLifecycle);
    setExportStatus(nextExportStatus);
  };

  useEffect(() => {
    void refresh().catch((error) => {
      setMessage(error instanceof Error ? error.message : "Accountstatus konnte nicht geladen werden.");
    });
  }, []);

  const runSensitiveAction = async (action: () => Promise<void>) => {
    try {
      setIsBusy(true);
      setMessage("Sicherheitsprüfung läuft …");
      await reauthenticateAccount(password);
      await action();
      setPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Die Sicherheitsaktion ist fehlgeschlagen.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleExport = () => runSensitiveAction(async () => {
    setMessage("Deine Daten werden serverseitig zusammengestellt …");
    const status = await buildAndDownloadUserDataExport();
    setExportStatus(status);
    setMessage(`Datenexport heruntergeladen: ${status.totalDocuments} Dokumente in ${status.totalChunks} geprüften Teilen.`);
  });

  const handleRevokeSessions = () => runSensitiveAction(async () => {
    setMessage("Alle Firebase-Sitzungen werden widerrufen …");
    await revokeAllUserSessions();
    window.location.href = "/";
  });

  const handleDeletionRequest = () => runSensitiveAction(async () => {
    const email = auth.currentUser?.email || "";
    const status = await requestAccountDeletion({
      email,
      confirmation,
      reasonCategory: "user-requested",
    });
    setLifecycle(status);
    setConfirmation("");
    setMessage(`Löschantrag gespeichert. Geplante Ausführung: ${formatDate(status.deletionScheduledFor)}.`);
  });

  const handleDeletionCancellation = async () => {
    try {
      setIsBusy(true);
      const status = await cancelAccountDeletion();
      setLifecycle(status);
      setMessage("Der Löschantrag wurde widerrufen. Das Konto ist wieder aktiv.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Der Löschantrag konnte nicht widerrufen werden.");
    } finally {
      setIsBusy(false);
    }
  };

  const deletionPending = lifecycle?.status === "deletion-pending";
  const soleGuardianCount = lifecycle?.dependencies?.soleGuardianChildProfiles || 0;

  return (
    <SettingsCard title="Account-Verwaltung" titleClassName="text-red-400">
      <p className="mb-3 text-sm text-white/70">
        Export, Sitzungswiderruf und Löschantrag laufen über geschützte Firebase-Funktionen. Für sensible Aktionen ist eine erneute Anmeldung erforderlich.
      </p>

      <label className="mb-3 block text-xs text-white/70">
        Aktuelles Passwort
        <input
          type="password"
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-cyan-300/10 bg-[#0a3d46] px-3 py-2 text-sm text-white outline-none"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Nur für die nächste Sicherheitsaktion"
          disabled={isBusy}
        />
      </label>

      <div className="space-y-3">
        <button
          type="button"
          className="w-full rounded-lg border border-cyan-300/20 bg-[#0a3d46] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleExport}
          disabled={isBusy || !password}
        >
          Meine Daten als JSON herunterladen
        </button>
        {exportStatus && exportStatus.status !== "not-requested" && (
          <p className="rounded-lg border border-cyan-300/10 bg-[#082f36] px-3 py-2 text-xs text-cyan-100">
            Exportstatus: {exportStatus.status} · {exportStatus.totalDocuments} Dokumente · gültig bis {formatDate(exportStatus.expiresAt)}
          </p>
        )}

        <button
          type="button"
          className="w-full rounded-lg border border-cyan-300/20 bg-[#0a3d46] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleRevokeSessions}
          disabled={isBusy || !password}
        >
          Auf allen Geräten abmelden
        </button>

        {deletionPending ? (
          <div className="rounded-lg border border-orange-400/40 bg-orange-400/10 p-3">
            <p className="text-sm font-bold text-orange-200">Löschantrag aktiv</p>
            <p className="mt-1 text-xs text-orange-100/90">
              Neue WFXP-Gutschriften und WFXP-Ausgaben sind eingefroren. Geplante Löschung: {formatDate(lifecycle.deletionScheduledFor)}.
            </p>
            <button
              type="button"
              className="mt-3 w-full rounded-lg border border-orange-300/40 bg-[#0a3d46] px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              onClick={handleDeletionCancellation}
              disabled={isBusy}
            >
              Löschantrag widerrufen
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3">
            <p className="text-xs text-red-100/80">
              Der Antrag startet eine {lifecycle?.gracePeriodDays || 7}-tägige Karenzzeit. Er löscht noch nicht sofort. Bei alleiniger Verantwortung für ein aktives Kinderprofil wird der Antrag blockiert.
            </p>
            {soleGuardianCount > 0 && (
              <p className="mt-2 text-xs font-semibold text-yellow-200">
                Aktuell blockiert: Du bist alleiniger Guardian von {soleGuardianCount} aktivem Kinderprofil.
              </p>
            )}
            <label className="mt-3 block text-xs text-white/70">
              Zur Bestätigung LOESCHEN eingeben
              <input
                className="mt-1 w-full rounded-lg border border-red-500/30 bg-[#0a3d46] px-3 py-2 text-sm text-white outline-none"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                placeholder="LOESCHEN"
                disabled={isBusy}
              />
            </label>
            <button
              type="button"
              className="mt-3 w-full rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
              onClick={handleDeletionRequest}
              disabled={isBusy || !password || confirmation.trim().toUpperCase() !== "LOESCHEN" || soleGuardianCount > 0}
            >
              Account-Löschung vormerken
            </button>
          </div>
        )}
      </div>

      {message && (
        <p className="mt-3 rounded-lg border border-cyan-300/10 bg-[#082f36] px-3 py-2 text-xs text-cyan-100">
          {message}
        </p>
      )}
    </SettingsCard>
  );
}
