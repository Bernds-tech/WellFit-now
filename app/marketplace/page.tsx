import { Beta1PageShell } from "@/components/beta1/Beta1Foundation";
import Beta1MarketplacePreview from "@/components/beta1/Beta1MarketplacePreview";

export default function MarketplacePreviewPage() {
  return (
    <Beta1PageShell
      title="Marktplatz Preview"
      subtitle="Professioneller Beta-1 Platzhalter. Kein aktiver Handel, keine Listings und keine Wallet-/Payment-Funktion."
    >
      <Beta1MarketplacePreview />
    </Beta1PageShell>
  );
}
