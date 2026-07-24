"use client";

import { useEffect, useState } from "react";
import { Beta1SectionCard, Beta1StatusBadge } from "@/components/beta1/Beta1Foundation";
import { verifyAdminClaim, type AdminGuardState } from "@/lib/admin/beta1AdminGuards";
import {
  reindexAllAdminMissionLocations,
  type AdminMissionLocationReindexSummary,
} from "@/lib/beta1/clientMissionLocationAdmin";

export default function MissionLocationGeoIndexAdminCard() {
  const [guardState, setGuardState] = useState<AdminGuardState>("loading");
  const [guardMessage, setGuardMessage] = useState("Admin-Zugriff wird geprüft ...");
  const [reindexing, setReindexing] = useState(false);
  const [summary, setSummary] = useState<AdminMissionLocationReindexSummary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    verifyAdminClaim().then((guard) => {
      if (cancelled) return;
      setGuardState(guard.state);
      setGuardMessage(guard.message);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const reconcileGeoIndex = async () => {
    if (reindexing || guardState !== "allowed") return;
    try {
      setReindexing(true);
      setError("");
      setSummary(null);
      const result = await reindexAllAdminMissionLocations(300);
      setSummary(result);
      window.dispatchEvent(new CustomEvent("wellfit-beta1-projection-updated"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Der weltweite Geo-Index konnte nicht abgeglichen werden.");
    } finally {
      setReindexing(false);
    }
  };

  return (
    <Beta1SectionCard
      title="Weltweiter Geo-Index"
      description="Neue Orte werden automatisch indexiert. Dieser Admin-Vorgang ergänzt oder repariert den Index älterer Ortsdatensätze seitenweise, ohne Rohkoordinaten an Nutzer freizugeben."
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <Beta1StatusBadge tone="info">Mehrstufiges Raster</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Haversine-Endprüfung</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Admin-only Migration</Beta1StatusBadge>
        <Beta1StatusBadge tone="success">Kein Weltkatalog-Scan</Beta1StatusBadge>
      </div>

      {guardState !== "allowed" ? (
        <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-xs text-amber-50">{guardMessage}</p>
      ) : (
        <>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-white/75">
            <p><strong>Nutzersuche:</strong> Nur Geo-Zellen in der angefragten Umgebung werden serverseitig geladen; anschließend wird die exakte Entfernung berechnet.</p>
            <p className="mt-1"><strong>Migration:</strong> Maximal 300 Orte pro Seite, fortlaufender Cursor, Admin-Audit und sichere Wiederholbarkeit.</p>
          </div>

          {error && <p className="mt-3 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-xs text-rose-100">{error}</p>}
          {summary && (
            <p className="mt-3 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-3 text-xs text-emerald-100">
              Geo-Index {summary.geoIndexVersion} abgeglichen: {summary.scannedCount} Orte in {summary.pages} Seiten geprüft, {summary.updatedCount} aktualisiert, {summary.skippedCount} wegen ungültiger Altkoordinaten übersprungen.
            </p>
          )}

          <button
            type="button"
            onClick={reconcileGeoIndex}
            disabled={reindexing}
            className="mt-3 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {reindexing ? "Weltweiter Geo-Index wird seitenweise abgeglichen ..." : "Altbestand sicher indexieren / prüfen"}
          </button>
        </>
      )}
    </Beta1SectionCard>
  );
}
