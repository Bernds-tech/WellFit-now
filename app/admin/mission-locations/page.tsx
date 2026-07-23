import Link from "next/link";
import MissionLocationAdminCard from "@/components/admin/MissionLocationAdminCard";
import { Beta1PageShell } from "@/components/beta1/Beta1Foundation";

export default function MissionLocationsAdminPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#164e63_0%,#0f172a_42%,#020617_100%)] px-4 py-6 text-white md:px-8">
      <Beta1PageShell
        title="WellFit · Weltweite Missionsorte"
        subtitle="Admin-Zentrale für sichere, serverseitig veröffentlichte Orte. Die Plattform ist global; Nutzer erhalten ausschließlich Missionen und Challenges in ihrer tatsächlichen Umgebung."
      >
        <div className="flex flex-wrap gap-3">
          <Link href="/" className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
            Zur WellFit-App
          </Link>
          <Link href="/missionen/challenge" className="rounded-lg border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-400/15">
            Challenge-Umgebung prüfen
          </Link>
          <Link href="/missionen/abenteuer" className="rounded-lg border border-cyan-300/25 bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-400/15">
            Abenteuer-Umgebung prüfen
          </Link>
        </div>
        <MissionLocationAdminCard />
      </Beta1PageShell>
    </main>
  );
}
