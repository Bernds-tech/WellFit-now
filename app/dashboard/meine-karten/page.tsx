"use client";

import Link from "next/link";
import AppShell from "@/app/components/AppShell";
import DashboardSavedCardsPanel from "../components/DashboardSavedCardsPanel";

export default function DashboardSavedCardsPage() {
  return (
    <AppShell reward={0}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-200/80">Dashboard</p>
          <h1 className="mt-2 text-5xl font-extrabold leading-none">Meine Karten</h1>
          <p className="mt-2 max-w-5xl text-lg leading-relaxed text-cyan-100/90">
            Hier siehst du dieselbe gespeicherte Karten-Auswahl, die du unter Dashboard anpassen eingerichtet hast.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
          <Link href="/dashboard/anpassen" className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100 hover:bg-cyan-300/15">
            Karten anpassen
          </Link>
          <Link href="/dashboard" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/75 hover:bg-white/10">
            Zurück zum Dashboard
          </Link>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-20 pr-2">
        <DashboardSavedCardsPanel />
      </div>
    </AppShell>
  );
}
