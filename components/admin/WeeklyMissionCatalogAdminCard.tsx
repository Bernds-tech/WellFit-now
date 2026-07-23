"use client";

import { useEffect, useState } from "react";
import {
  ensureWeeklyMissionCatalogForAdmin,
  type Beta1WeeklyMissionCatalogResult,
} from "@/lib/beta1/clientWeeklyMissionCatalog";
import { verifyAdminClaim, type AdminGuardState } from "@/lib/admin/beta1AdminGuards";
import { Beta1SectionCard, Beta1StatusBadge } from "@/components/beta1/Beta1Foundation";

export default function WeeklyMissionCatalogAdminCard() {
  const [guardState, setGuardState] = useState<AdminGuardState>("loading");
  const [guardMessage, setGuardMessage] = useState("Admin-Zugriff wird geprüft ...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Beta1WeeklyMissionCatalogResult | null>(null);

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
      const catalog = await ensureWeeklyMissionCatalogForAdmin();
      setResult(catalog);
      window.dispatchEvent(new CustomEvent("wellfit-beta1-projection-updated"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Wochenmissionskatalog konnte nicht vorbereitet werden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Beta1SectionCard
      title="Wochenmissionskatalog"
      description="Admin-only Abgleich der drei globalen Beta-1-Hauptmissionen. Jeder Nutzer kann eine Mission höchstens einmal pro eigener lokaler Kalenderwoche abschließen."
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <Beta1StatusBadge tone="info">3 Hauptmissionen</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Admin-Review erforderlich</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Nutzerlokale Woche weltweit</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Keine Child Profiles</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Kein Token / Cashout</Beta1StatusBadge>
      </div>

      {guardState !== "allowed" ? (
        <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-xs text-amber-50">{guardMessage}</p>
      ) : (
        <>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-white/75">
            <p><strong>Quelle:</strong> `functions/config/beta1-weekly-missions.json`</p>
            <p><strong>Missionen:</strong> 50.000 Schritte · 3 Workouts · 5 Lernmodule</p>
            <p><strong>Rewards:</strong> 25 / 15 / 25 WFXP, ausschließlich nach Review und Completion</p>
            <p><strong>Evidence:</strong> `weekly-user-confirmation`, keine Rohmedien vorgeschrieben</p>
            <p><strong>Policy:</strong> `once-per-mission-per-user-local-week`</p>
          </div>

          {error && <p className="mt-3 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-xs text-rose-100">{error}</p>}
          {result && (
            <p className="mt-3 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-3 text-xs text-emerald-100">
              Veröffentlicht/abgeglichen: {result.count} Missionen · Katalog {result.catalogVersion} · Wochenziel {result.weeklyGoal} · {result.currency}.
            </p>
          )}

          <button
            type="button"
            onClick={ensureCatalog}
            disabled={loading}
            className="mt-3 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Katalog wird serverseitig abgeglichen..." : "Wochenmissionen veröffentlichen / abgleichen"}
          </button>
        </>
      )}
    </Beta1SectionCard>
  );
}