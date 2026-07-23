"use client";

import { useEffect, useState } from "react";
import { ensureBuddyFoodCatalogForAdmin, type Beta1BuddyFoodItem } from "@/lib/beta1/clientBuddyCareCommands";
import { verifyAdminClaim, type AdminGuardState } from "@/lib/admin/beta1AdminGuards";
import { Beta1SectionCard, Beta1StatusBadge } from "@/components/beta1/Beta1Foundation";

export default function BuddyCareCatalogAdminCard() {
  const [guardState, setGuardState] = useState<AdminGuardState>("loading");
  const [guardMessage, setGuardMessage] = useState("Admin-Zugriff wird geprüft ...");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [item, setItem] = useState<Beta1BuddyFoodItem | null>(null);

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
      const ensured = await ensureBuddyFoodCatalogForAdmin();
      setItem(ensured);
      window.dispatchEvent(new CustomEvent("wellfit-beta1-projection-updated"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Buddy-Futterkatalog konnte nicht sicher vorbereitet werden.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Beta1SectionCard
      title="Buddy-Care WFXP-Katalog"
      description="Admin-only Vorbereitung des kanonischen Beta-1-Energie-Snacks. Die Aktion erstellt oder korrigiert ausschließlich das vorhandene Item-/Shop-Datenmodell."
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <Beta1StatusBadge tone="info">5 WFXP</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Kein Echtgeld</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Kein Token / Cashout</Beta1StatusBadge>
      </div>

      {guardState !== "allowed" ? (
        <p className="rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-xs text-amber-50">{guardMessage}</p>
      ) : (
        <>
          <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-xs leading-relaxed text-white/75">
            <p><strong>Item:</strong> `buddy_food_basic`</p>
            <p><strong>Wirkung:</strong> +10 Buddy-Hunger, einmalig konsumierbar</p>
            <p><strong>Authority:</strong> Serverkatalog, WFXP-Wallet, Ledger, Inventar und `userAvatars`</p>
          </div>

          {error && <p className="mt-3 rounded-lg border border-rose-300/30 bg-rose-300/10 p-3 text-xs text-rose-100">{error}</p>}
          {item && (
            <p className="mt-3 rounded-lg border border-emerald-300/30 bg-emerald-300/10 p-3 text-xs text-emerald-100">
              Veröffentlicht: {item.title} · {item.priceWfxp} WFXP · Wirkung +{item.effectAmount} Hunger.
            </p>
          )}

          <button
            type="button"
            onClick={ensureCatalog}
            disabled={loading}
            className="mt-3 rounded-lg bg-cyan-400 px-4 py-2 text-xs font-black text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Katalog wird serverseitig geprüft..." : "Energie-Snack veröffentlichen / abgleichen"}
          </button>
        </>
      )}
    </Beta1SectionCard>
  );
}
