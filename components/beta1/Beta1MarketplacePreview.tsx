import Link from "next/link";
import { Beta1MetricCard, Beta1SectionCard, Beta1StatusBadge } from "./Beta1Foundation";
import Beta1MarketplacePreviewCard from "./Beta1MarketplacePreviewCard";
import Beta1MarketplaceGuardrailNotice from "./Beta1MarketplaceGuardrailNotice";

const previewCards = [
  {
    title: "Kuratiertes Konzeptfenster",
    description: "Die Marktplatz-Zone zeigt in Beta-1 nur einen professionellen Ausblick auf kuenftige Inhaltskategorien. Es werden keine echten Angebote oder Preise freigeschaltet.",
    statusLabel: "Nicht aktiv",
  },
  {
    title: "Server-Authority bleibt verpflichtend",
    description: "Kuenftige Freigaben fuer Inhalte, Verfuegbarkeit und Regelwerke bleiben serverseitig. Diese Preview fuehrt keine Handels- oder Kaufpfade aus.",
    statusLabel: "Authority serverseitig",
  },
  {
    title: "Beta-1 Scope Abgrenzung",
    description: "Der Beta-1 Runtime-Scope enthaelt hier ausschliesslich Placeholder-Inhalte. Trading, Wallet-Connect, Auszahlungen und Echtgeldfluesse bleiben deaktiviert.",
    statusLabel: "Scope begrenzt",
  },
];

export default function Beta1MarketplacePreview() {
  return (
    <div className="space-y-4">
      <Beta1MarketplaceGuardrailNotice />

      <div className="grid gap-3 md:grid-cols-3">
        <Beta1MetricCard label="Preview-Status" value="Nicht aktiv" note="Konzeptbereich ohne Handelsfunktion." />
        <Beta1MetricCard label="Live-Listings" value={0} note="Keine Listings oder Orders in Beta-1." />
        <Beta1MetricCard label="Transaktionspfade" value="Deaktiviert" note="Keine clientseitige Purchase-/Transfer-Authority." />
      </div>

      <Beta1SectionCard title="Marktplatz Preview" description="Sachlicher Platzhalter fuer den spaeteren Bereich ohne aktive Handelskomponenten.">
        <div className="mb-3 flex flex-wrap gap-2">
          <Beta1StatusBadge tone="info">Beta-1 Preview</Beta1StatusBadge>
          <Beta1StatusBadge tone="warning">Kein aktiver Marktplatz</Beta1StatusBadge>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {previewCards.map((card) => (
            <Beta1MarketplacePreviewCard key={card.title} {...card} />
          ))}
        </div>
      </Beta1SectionCard>

      <Beta1SectionCard title="Aktuell verfuegbarer Bereich" description="Der derzeitige Runtime-Slice fuer Einloesung bleibt der Punkte-Shop mit WFXP-only Read/Intent-Ausrichtung.">
        <p className="text-sm text-slate-200/85">
          Falls du den aktuellen Beta-1 Shop-Status einsehen willst, nutze den bestehenden Punkte-Shop-Bereich ohne Echtgeld- oder Wallet-Funktion.
        </p>
        <Link href="/shop" className="mt-3 inline-flex text-sm font-medium text-sky-300 hover:text-sky-200">
          Zum Punkte-Shop (read/intent-only)
        </Link>
      </Beta1SectionCard>
    </div>
  );
}
