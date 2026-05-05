import ProductModulePlaceholderPage from "@/app/components/ProductModulePlaceholderPage";

export default function MarketplacePage() {
  return (
    <ProductModulePlaceholderPage
      eyebrow="Produktmodul"
      title="Marktplatz"
      subtitle="Der WellFit-Marktplatz wird als sichere MVP-Oberfläche vorbereitet. Käufe, Gebühren, Items und spätere Ownership-Funktionen werden nicht clientseitig autorisiert."
      status="Vorbereitet"
      cards={[
        {
          title: "Digitale Inhalte",
          body: "Später können geprüfte Missionen, Guides, Coachings oder Partner-Inhalte sichtbar gemacht werden. Im MVP bleibt diese Seite eine Navigations- und Strukturvorbereitung.",
        },
        {
          title: "Partner & Creator",
          body: "Coaches, Bildungspartner, Städte oder Veranstalter können später eigene Inhalte anbieten. Freigabe, Preise und Sichtbarkeit brauchen serverseitige Regeln.",
        },
        {
          title: "Keine echte NFT-/Token-Funktion",
          body: "Mobile- und MVP-Bereiche bleiben frei von Trading, Presale, Wallet-Transfer und NFT-Marktplatz-Funktionen.",
        },
        {
          title: "Nächste technische Stufe",
          body: "Datenmodell für geprüfte Marketplace-Items, Moderation, Sichtbarkeit und interne Punkte-/Spend-Events definieren.",
        },
      ]}
    />
  );
}
