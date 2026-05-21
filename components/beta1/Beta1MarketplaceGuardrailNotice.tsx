import { Beta1SectionCard, Beta1StatusBadge } from "./Beta1Foundation";

export default function Beta1MarketplaceGuardrailNotice() {
  return (
    <Beta1SectionCard title="Beta-1 Guardrails" description="Diese Seite ist eine Preview und aktiviert keine Marktplatz-Transaktionen.">
      <div className="flex flex-wrap gap-2">
        <Beta1StatusBadge tone="warning">Preview / nicht aktiv</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Kein Handel</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Keine Wallet- oder Payment-Funktion</Beta1StatusBadge>
      </div>
      <p className="mt-3 text-sm text-slate-200/85">
        Keine Buy-/Sell-Buttons, keine Listings, keine Auktionen, keine Echtgeldpreise und keine clientseitige Handels- oder Transfer-Authority.
      </p>
    </Beta1SectionCard>
  );
}
