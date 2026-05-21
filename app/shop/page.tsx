import AppShell from "@/app/components/AppShell";
import { Beta1PageShell } from "@/components/beta1/Beta1Foundation";
import Beta1PointsShop from "@/components/beta1/Beta1PointsShop";

export default function ShopPage() {
  return (
    <AppShell contentClassName="px-7 py-5 pb-4 overflow-y-auto">
      <Beta1PageShell
        title="Punkte-Shop"
        subtitle="Professioneller Beta-1 Punkte-Shop auf Basis sicherer Read-Projections. Kaufpfade bleiben request-/intent-only, finale Spend-Entscheidungen bleiben serverseitig."
      >
        <Beta1PointsShop />
      </Beta1PageShell>
    </AppShell>
  );
}
