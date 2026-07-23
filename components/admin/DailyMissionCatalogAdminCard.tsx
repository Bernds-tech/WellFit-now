"use client";

import { useEffect, useState } from "react";
import { ensureDailyMissionCatalogForAdmin, type Beta1DailyMissionCatalogResult } from "@/lib/beta1/clientDailyMissionCatalog";
import { verifyAdminClaim, type AdminGuardState } from "@/lib/admin/beta1AdminGuards";
import { Beta1SectionCard, Beta1StatusBadge } from "@/components/beta1/Beta1Foundation";

export default function DailyMissionCatalogAdminCard() {
  const [guardState, setGuardState] = useState<AdminGuardState>("loading");
  const [guardMessage, setGuardMessage] = useState("Admin-Zugriff wird geprüft ...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Beta1DailyMissionCatalogResult | null>(null);

  useEffect(() => {
    verifyAdminClaim().then((guard) => {
      setGuardState(guard.state);
      setGuardMessage(guard.message);
    });
  }, []);

  const ensureCatalog = async () => {
    if (loading || guardState !== "allowed") return;
    try {
      setLoading(true);
      setError("");
      const catalog = await ensureDailyMissionCatalogForAdmin();
      setResult(catalog);
      window.dispatchEvent(new CustomEvent("wellfit-beta1-projection-updated"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Tagesmissionskatalog konnte nicht vorbereitet werden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Beta1SectionCard
      title="Tagesmissionskatalog"
      description="Admin-only Abgleich der zehn kanonischen Beta-1-Tagesmissionen. Frontend und Functions verwenden dieselbe versionierte Quelle."
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <Beta1StatusBadge tone="info">10 Missionen</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Evidence Review erforderlich</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Keine Child Profiles</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Kein Token / Cashout</Beta1StatusBadge>
      </div>

      {guardState !== "allowed" ? (
        <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-xs text-amber-50">{guardMessage}</p>
      ) : (
        <>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-white/75">
            <p><strong>Quelle:</strong> `functions/config/beta1-daily-missions.json`</p>
            <p><strong>Reward:</strong> 5–12 WFXP, erst nach serverseitigem Review und Completion</p>
            <p><strong>Evidence:</strong> `daily-user-confirmation`, keine Rohmedien vorgeschrieben</p>
          </div>

          {error && <p className="mt-3 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-xs text-rose-100">{error}</p>}
          {result && (
            <p className="mt-3 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-3 text-xs text-emerald-100">
              Veröffentlicht/abgeglichen: {result.count} Missionen · Katalog {result.catalogVersion} · {result.currency}.
            </p>
          )}

          <button
            type="button"
            onClick={ensureCatalog}
            disabled={loading}
            className="mt-3 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Katalog wird serverseitig abgeglichen..." : "Tagesmissionen veröffentlichen / abgleichen"}
          </button>
        </>
      )}
    </Beta1SectionCard>
  );
}
