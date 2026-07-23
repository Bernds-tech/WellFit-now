"use client";

import { useEffect, useState } from "react";
import {
  ensureChallengeMissionCatalogForAdmin,
  type Beta1ChallengeCatalogResult,
} from "@/lib/beta1/clientChallengeMissionCatalog";
import { verifyAdminClaim, type AdminGuardState } from "@/lib/admin/beta1AdminGuards";
import { Beta1SectionCard, Beta1StatusBadge } from "@/components/beta1/Beta1Foundation";

export default function ChallengeMissionCatalogAdminCard() {
  const [guardState, setGuardState] = useState<AdminGuardState>("loading");
  const [guardMessage, setGuardMessage] = useState("Admin-Zugriff wird geprüft ...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Beta1ChallengeCatalogResult | null>(null);

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
      const catalog = await ensureChallengeMissionCatalogForAdmin();
      setResult(catalog);
      window.dispatchEvent(new CustomEvent("wellfit-beta1-projection-updated"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Challenge-Katalog konnte nicht vorbereitet werden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Beta1SectionCard
      title="Challenge-Katalog"
      description="Admin-only Abgleich der sechs kanonischen Beta-1-Challenges. Jede Challenge kann pro Nutzer höchstens einmal WFXP erzeugen."
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <Beta1StatusBadge tone="info">6 Challenges</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Admin-Review erforderlich</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Ein Abschluss pro Nutzer</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Keine Child Profiles</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Kein Token / Cashout</Beta1StatusBadge>
      </div>

      {guardState !== "allowed" ? (
        <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-xs text-amber-50">{guardMessage}</p>
      ) : (
        <>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-white/75">
            <p><strong>Quelle:</strong> `functions/config/beta1-challenge-missions.json`</p>
            <p><strong>Missionen:</strong> Balance, Fitness, Wissen, Reaktion, AR und Mindset</p>
            <p><strong>Rewards:</strong> 60 bis 140 WFXP, ausschließlich nach Review und Completion</p>
            <p><strong>Evidence:</strong> `challenge-user-confirmation`, keine Rohmedien vorgeschrieben</p>
            <p><strong>Policy:</strong> `once-per-mission-per-user`</p>
          </div>

          {error && <p className="mt-3 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-xs text-rose-100">{error}</p>}
          {result && (
            <p className="mt-3 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-3 text-xs text-emerald-100">
              Veröffentlicht/abgeglichen: {result.count} Challenges · Katalog {result.catalogVersion} · {result.currency}.
            </p>
          )}

          <button
            type="button"
            onClick={ensureCatalog}
            disabled={loading}
            className="mt-3 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Katalog wird serverseitig abgeglichen..." : "Challenges veröffentlichen / abgleichen"}
          </button>
        </>
      )}
    </Beta1SectionCard>
  );
}
