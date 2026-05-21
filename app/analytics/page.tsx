import AppShell from "@/app/components/AppShell";
import { Beta1PageShell } from "@/components/beta1/Beta1Foundation";
import Beta1AnalyticsStats from "@/components/beta1/Beta1AnalyticsStats";

export default function AnalyticsPage() {
  return (
    <AppShell contentClassName="px-7 py-5 pb-4 overflow-y-auto">
      <Beta1PageShell
        title="Beta-1 Analytics & Stats"
        subtitle="Eigene, read-only Fortschrittsansicht auf Basis sicherer Projektionen. Keine Gesundheitsdiagnosen, keine sensiblen Rohdaten, keine clientseitige Authority."
      >
        <Beta1AnalyticsStats />
      </Beta1PageShell>
    </AppShell>
  );
}
