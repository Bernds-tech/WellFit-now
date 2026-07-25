"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getBetaOperationsSnapshot,
  type BetaOperationsSnapshot,
  type OperationsWindowDays,
  type RetentionMetric,
} from "@/lib/admin/betaOperationsClient";
import { verifyAdminClaim, type AdminGuardState } from "@/lib/admin/beta1AdminGuards";
import {
  Beta1EmptyState,
  Beta1MetricCard,
  Beta1SectionCard,
  Beta1StatusBadge,
} from "@/components/beta1/Beta1Foundation";

const WINDOWS: OperationsWindowDays[] = [7, 14, 30];

function formatPercent(value: number | null | undefined): string {
  return typeof value === "number" ? `${value.toLocaleString("de-AT", { maximumFractionDigits: 1 })} %` : "–";
}

function formatNumber(value: number | null | undefined): string {
  return typeof value === "number" ? value.toLocaleString("de-AT") : "–";
}

function formatHours(value: number | null | undefined): string {
  if (typeof value !== "number") return "–";
  if (value < 1) return `${Math.round(value * 60)} Min.`;
  return `${value.toLocaleString("de-AT", { maximumFractionDigits: 1 })} Std.`;
}

function formatDateTime(value: string | null | undefined): string {
  if (!value) return "–";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("de-AT", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date);
}

function retentionValue(metric: RetentionMetric): string {
  return metric.suppressed ? "geschützt" : formatPercent(metric.ratePercent);
}

function retentionNote(metric: RetentionMetric): string {
  if (metric.suppressed) {
    return `Kohorte ${metric.eligibleAccounts}; Anzeige erst ab ${metric.minimumCohortSize} Konten.`;
  }
  return `${formatNumber(metric.retainedAccounts)} von ${formatNumber(metric.eligibleAccounts)} Konten mit Produktinteraktion.`;
}

export default function BetaOperationsCockpit() {
  const [guardState, setGuardState] = useState<AdminGuardState>("loading");
  const [guardMessage, setGuardMessage] = useState("Admin-Zugriff wird geprüft ...");
  const [windowDays, setWindowDays] = useState<OperationsWindowDays>(14);
  const [snapshot, setSnapshot] = useState<BetaOperationsSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    verifyAdminClaim().then((guard) => {
      if (!active) return;
      setGuardState(guard.state);
      setGuardMessage(guard.message);
    });
    return () => {
      active = false;
    };
  }, []);

  const loadSnapshot = useCallback(async () => {
    if (guardState !== "allowed" || loading) return;
    try {
      setLoading(true);
      setError("");
      const result = await getBetaOperationsSnapshot(windowDays);
      setSnapshot(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Das Beta-Betriebscockpit konnte nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  }, [guardState, loading, windowDays]);

  useEffect(() => {
    if (guardState === "allowed" && snapshot === null && !loading) void loadSnapshot();
  }, [guardState, loadSnapshot, loading, snapshot]);

  const maxDailyEngagement = useMemo(
    () => Math.max(1, ...(snapshot?.daily.map((entry) => entry.engagedUsers) || [1])),
    [snapshot],
  );

  return (
    <Beta1SectionCard
      title="Beta-Betriebscockpit"
      description="Aggregierte Produkt-, Evidence-, Retention- und Risikokennzahlen für den geschlossenen Beta-Betrieb. Die Projektion ist read-only und serverautoritativ."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Beta1StatusBadge tone="success">Nur Aggregate</Beta1StatusBadge>
        <Beta1StatusBadge tone="info">UTC-Zeitfenster</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Keine Health-Daten</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Keine Koordinaten</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Kein Token / Cash-out</Beta1StatusBadge>
      </div>

      {guardState !== "allowed" ? (
        <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-xs text-amber-50">{guardMessage}</p>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 p-3">
            <div>
              <p className="text-sm font-semibold text-white">Auswertungsfenster</p>
              <p className="mt-1 text-xs text-white/65">
                Aktivierung = erster Missionsstart binnen 24 Stunden. D1/D7 = mindestens eine Mission-, Evidence-, Completion- oder Buddy-Care-Interaktion am jeweiligen UTC-Tag.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {WINDOWS.map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => {
                    setWindowDays(days);
                    setSnapshot(null);
                  }}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold ${
                    windowDays === days
                      ? "border-cyan-300/60 bg-cyan-300/20 text-cyan-50"
                      : "border-white/15 bg-white/5 text-white/75"
                  }`}
                >
                  {days} Tage
                </button>
              ))}
              <button
                type="button"
                onClick={() => void loadSnapshot()}
                disabled={loading}
                className="rounded-lg bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Wird aggregiert ..." : "Aktualisieren"}
              </button>
            </div>
          </div>

          {error ? (
            <p className="mb-4 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-xs text-rose-100">{error}</p>
          ) : null}

          {!snapshot && loading ? (
            <Beta1EmptyState title="Betriebsdaten werden aggregiert" detail="Die Admin-Funktion liest ausschließlich vorhandene Serverdaten und erzeugt keine neue Nutzerhistorie." />
          ) : null}

          {snapshot ? (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Beta1MetricCard
                  label="Initialisierte Konten"
                  value={formatNumber(snapshot.accounts.initializedTotal)}
                  note={`${formatNumber(snapshot.accounts.newInWindow)} neu im Zeitfenster`}
                />
                <Beta1MetricCard
                  label="Engagierte Nutzer"
                  value={formatNumber(snapshot.accounts.engagedInWindow)}
                  note="Mindestens eine relevante Produktinteraktion"
                />
                <Beta1MetricCard
                  label="Aktivierung ≤ 24 h"
                  value={formatPercent(snapshot.accounts.activationRatePercent)}
                  note={`${formatNumber(snapshot.accounts.activatedWithin24Hours)} von ${formatNumber(snapshot.accounts.activationEligibleAccounts)} neuen Konten`}
                />
                <Beta1MetricCard
                  label="Analytics Opt-in"
                  value={formatPercent(snapshot.accounts.analyticsOptInRatePercent)}
                  note={`${formatNumber(snapshot.accounts.analyticsOptInTotal)} freiwillige Zustimmungen`}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Beta1MetricCard label="D1-Retention" value={retentionValue(snapshot.retention.d1)} note={retentionNote(snapshot.retention.d1)} />
                <Beta1MetricCard label="D7-Retention" value={retentionValue(snapshot.retention.d7)} note={retentionNote(snapshot.retention.d7)} />
                <Beta1MetricCard
                  label="Evidence-Quote"
                  value={formatPercent(snapshot.missions.evidenceSubmissionRatePercent)}
                  note={`${formatNumber(snapshot.missions.attemptsWithEvidence)} Attempts mit Evidence`}
                />
                <Beta1MetricCard
                  label="Completion-Quote"
                  value={formatPercent(snapshot.missions.completionRatePercent)}
                  note={`${formatNumber(snapshot.missions.completions)} Completions / ${formatNumber(snapshot.missions.starts)} Starts`}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Beta1MetricCard label="Missionsstarts" value={formatNumber(snapshot.missions.starts)} note={`${formatNumber(snapshot.missions.uniqueStarters)} eindeutige Starter`} />
                <Beta1MetricCard label="Evidence offen" value={formatNumber(snapshot.evidence.pendingTotal)} note={`${formatNumber(snapshot.evidence.reviewedInWindow)} im Fenster geprüft`} />
                <Beta1MetricCard label="Review Median" value={formatHours(snapshot.evidence.medianReviewHours)} note={`P90 ${formatHours(snapshot.evidence.p90ReviewHours)}`} />
                <Beta1MetricCard label="Evidence-Freigabe" value={formatPercent(snapshot.evidence.approvalRatePercent)} note={`${formatNumber(snapshot.evidence.approvedInWindow)} genehmigt, ${formatNumber(snapshot.evidence.rejectedInWindow)} abgelehnt`} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Beta1MetricCard label="WFXP vergeben" value={formatNumber(snapshot.economy.grantedInWindow)} note={`${formatNumber(snapshot.economy.uniqueEarners)} Empfänger · intern, ohne Geldwert`} />
                <Beta1MetricCard label="Offene Safety Reports" value={formatNumber(snapshot.operations.openSafetyReports)} note={`${formatNumber(snapshot.operations.safetyReportsCreatedInWindow)} neu im Fenster`} />
                <Beta1MetricCard label="Fehlersignale" value={formatNumber(snapshot.operations.knownFailureSignals)} note={`${formatNumber(snapshot.operations.failedDataExportsInWindow)} Exporte · ${formatNumber(snapshot.operations.blockedAccountDeletions)} Löschungen`} />
                <Beta1MetricCard label="Missbrauchssignale" value={formatNumber(snapshot.operations.riskSignalsInWindow)} note={`${formatNumber(snapshot.operations.manualPatternReviewsInWindow)} manuelle Reviews · ${formatNumber(snapshot.operations.hardCooldownSignalsInWindow)} harte Cooldowns`} />
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Tagesverlauf</h3>
                    <p className="mt-1 text-xs text-white/60">Alle Werte sind UTC-Aggregate; Nutzerkennungen werden nicht an den Browser übertragen.</p>
                  </div>
                  <Beta1StatusBadge tone={snapshot.scan.complete ? "success" : "warning"}>
                    {snapshot.scan.complete ? "Scan vollständig" : "Scan begrenzt"}
                  </Beta1StatusBadge>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[760px] w-full text-left text-xs text-white/75">
                    <thead className="border-b border-white/10 text-white/55">
                      <tr>
                        <th className="px-2 py-2 font-medium">UTC-Tag</th>
                        <th className="px-2 py-2 font-medium">Engagiert</th>
                        <th className="px-2 py-2 font-medium">Starts</th>
                        <th className="px-2 py-2 font-medium">Evidence</th>
                        <th className="px-2 py-2 font-medium">Completions</th>
                        <th className="px-2 py-2 font-medium">Freigaben</th>
                        <th className="px-2 py-2 font-medium">Ablehnungen</th>
                      </tr>
                    </thead>
                    <tbody>
                      {snapshot.daily.map((entry) => (
                        <tr key={entry.dateKey} className="border-b border-white/5 last:border-0">
                          <td className="whitespace-nowrap px-2 py-2.5 font-medium text-white">{entry.dateKey}</td>
                          <td className="px-2 py-2.5">
                            <div className="flex items-center gap-2">
                              <span className="w-8 text-right tabular-nums">{entry.engagedUsers}</span>
                              <span className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
                                <span
                                  className="block h-full rounded-full bg-cyan-300/75"
                                  style={{ width: `${Math.max(3, (entry.engagedUsers / maxDailyEngagement) * 100)}%` }}
                                />
                              </span>
                            </div>
                          </td>
                          <td className="px-2 py-2.5 tabular-nums">{entry.missionStarts}</td>
                          <td className="px-2 py-2.5 tabular-nums">{entry.evidenceSubmitted}</td>
                          <td className="px-2 py-2.5 tabular-nums">{entry.completions}</td>
                          <td className="px-2 py-2.5 tabular-nums">{entry.approvedEvidence}</td>
                          <td className="px-2 py-2.5 tabular-nums">{entry.rejectedEvidence}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-sky-300/20 bg-sky-400/10 p-3 text-xs leading-relaxed text-sky-50/90">
                <p><strong>Datenschutzgrenze:</strong> Keine Nutzer-IDs, E-Mail-Adressen, Gesundheitswerte, Koordinaten, Rohmedien oder Evidence-Inhalte verlassen die Admin-Callable-Projektion.</p>
                <p className="mt-1"><strong>Kohortenschutz:</strong> Retention wird bei weniger als {snapshot.privacy.minimumRetentionCohortSize} geeigneten Konten unterdrückt.</p>
                <p className="mt-1"><strong>Stand:</strong> {formatDateTime(snapshot.generatedAt)} UTC · Fenster {formatDateTime(snapshot.window.startAt)} bis {formatDateTime(snapshot.window.endAt)}.</p>
                {!snapshot.scan.complete ? (
                  <p className="mt-1 font-semibold text-amber-100">Begrenzte Collections: {snapshot.scan.truncatedCollections.join(", ")}. Prozentwerte sind dann nicht vollständig.</p>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      )}
    </Beta1SectionCard>
  );
}
