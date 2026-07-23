"use client";

import AppShell from "@/app/components/AppShell";
import Beta1AdminPanel from "@/components/admin/Beta1AdminPanel";
import MissionEvidenceReviewQueue from "@/components/admin/MissionEvidenceReviewQueue";
import { Beta1PageShell } from "@/components/beta1/Beta1Foundation";

export default function Beta1AdminPage() {
  return (
    <AppShell contentClassName="px-7 py-5 pb-4 overflow-y-auto">
      <Beta1PageShell
        title="Beta-1 Admin Operations"
        subtitle="Diese Ansicht nutzt bestehende Beta-1-Callables. Der Client bleibt Bedienoberfläche; finale Autorität bleibt serverseitig."
      >
        <MissionEvidenceReviewQueue />
        <Beta1AdminPanel />
      </Beta1PageShell>
    </AppShell>
  );
}
