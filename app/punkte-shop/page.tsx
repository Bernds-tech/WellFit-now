import ProductModulePlaceholderPage from "@/app/components/ProductModulePlaceholderPage";
import { getBetaShopItemsWithPrices } from "@/lib/economy/shopItems";
import ShopSpendPreviewPanel from "./ShopSpendPreviewPanel";

export default function PointsShopPage() {
  const shopItems = getBetaShopItemsWithPrices();

  return (
    <div className="min-h-screen bg-[#052f36]">
      <ProductModulePlaceholderPage
        eyebrow="Produktmodul"
        title="Punkte-Shop"
        subtitle="Der Punkte-Shop wird zuerst als internes Punkte- und Spend-Modul vorbereitet. Echte Käufe, Token, NFTs oder Wallet-Funktionen werden nicht im MVP aktiviert."
        status="Interne Beta-Preise"
        cards={[
          {
            title: "Interne Punkte zuerst",
            body: "Shop-Aktionen müssen später über ein serverseitiges Punkte-Ledger, Spend-Events und Sink-Regeln laufen.",
          },
          ...shopItems.map((item) => ({
            title: `${item.title} · ${item.price.toLocaleString("de-DE")} ${item.currencyLabel}`,
            body: `${item.betaDescription} Basispreis: ${item.basePrice.toLocaleString("de-DE")} Punkte. Dynamischer Preisfaktor: ${item.priceRate.toFixed(2)}x. ${item.tokenizedLater ? "Spaeter eventuell tokenisierbar, aktuell aber rein intern." : "Nicht tokenisiert und App-Store-sicher."}`,
          })),
          {
            title: "Sinks & Systemgesundheit",
            body: "Punkteausgaben, Gebühren und Burn-Äquivalente werden zuerst intern simuliert, bevor externe Economy-Schichten entstehen.",
          },
          {
            title: "Nächste technische Stufe",
            body: "Shop-Item-Datenmodell, Preise, Limits, Audit-Events und Spend-Policy als serverseitige Architektur vorbereiten.",
          },
        ]}
        safetyNotes={[
          "Keine clientseitige Punkte-, Reward-, Wallet-, Token- oder NFT-Autorität.",
          "Alle Preise sind interne Beta-Punkte und keine echten Käufe.",
          "Token, NFT, Trading, Staking und Presale bleiben deaktiviert.",
          "Goodie-Preise reagieren später auf Reserve und Umlauf, aktuell als interne Simulation.",
        ]}
      />

      <div className="mx-auto max-w-6xl px-6 pb-10">
        <ShopSpendPreviewPanel items={shopItems} />
      </div>
    </div>
  );
}
