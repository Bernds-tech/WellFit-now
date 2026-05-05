import ProductModulePlaceholderPage from "@/app/components/ProductModulePlaceholderPage";

export default function PointsShopPage() {
  return (
    <ProductModulePlaceholderPage
      eyebrow="Produktmodul"
      title="Punkte-Shop"
      subtitle="Der Punkte-Shop wird zuerst als internes Punkte- und Spend-Modul vorbereitet. Echte Käufe, Token, NFTs oder Wallet-Funktionen werden nicht im MVP aktiviert."
      status="Vorbereitet"
      cards={[
        {
          title: "Interne Punkte zuerst",
          body: "Shop-Aktionen müssen später über ein serverseitiges Punkte-Ledger, Spend-Events und Sink-Regeln laufen.",
        },
        {
          title: "Digitale Belohnungen",
          body: "Mögliche Inhalte sind Skins, Mission-Pässe, kosmetische Upgrades, Hinweise oder Coachings. Kein Pay-to-Win und keine Kaufpflicht für Tagesmissionen.",
        },
        {
          title: "Sinks & Systemgesundheit",
          body: "Punkteausgaben, Gebühren und Burn-Äquivalente werden zuerst intern simuliert, bevor externe Economy-Schichten entstehen.",
        },
        {
          title: "Nächste technische Stufe",
          body: "Shop-Item-Datenmodell, Preise, Limits, Audit-Events und Spend-Policy als serverseitige Architektur vorbereiten.",
        },
      ]}
    />
  );
}
