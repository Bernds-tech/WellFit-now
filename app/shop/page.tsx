import { Beta1PageShell } from "@/components/beta1/Beta1Foundation";
import Beta1PointsShop from "@/components/beta1/Beta1PointsShop";

export default function ShopPage() {
  return (
    <Beta1PageShell
      title="Punkte-Shop"
      subtitle="Professioneller Beta-1 Punkte-Shop auf Basis sicherer Read-Projections. Kaufpfade bleiben request-/intent-only, finale Spend-Entscheidungen bleiben serverseitig."
    >
      <Beta1PointsShop />
    </Beta1PageShell>
  );
}
