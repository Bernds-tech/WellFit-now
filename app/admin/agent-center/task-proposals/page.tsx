import type { Metadata } from "next";

import AppShell from "@/app/components/AppShell";

import TaskProposalsPanel from "../TaskProposalsPanel";

export const metadata: Metadata = {
  title: "Task-Vorschläge | WellFit Admin",
  description: "Read-only Agent-to-Task Draft Übersicht für WellFit Governance.",
};

export default function AgentTaskProposalsPage() {
  return (
    <AppShell reward={0} contentClassName="px-0 py-0">
      <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,_rgba(0,170,190,0.32),_transparent_30%),linear-gradient(135deg,_#06252d,_#07111f_52%,_#0f172a)] px-5 py-8 pb-24 text-white sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <header className="rounded-[2rem] border border-white/12 bg-white/10 p-6 shadow-2xl shadow-slate-950/30 backdrop-blur md:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.28em] text-cyan-100/75">WellFit Admin · Read-only · Task Drafts</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">Task-Vorschläge</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-cyan-50/80">
              Diese Ansicht zeigt Agent-to-Task Drafts, Pflichtfelder, Queue-Kandidaten, Pfadgrenzen und Stop-Bedingungen. Es gibt keine Approval-, Execute-, Merge- oder Deploy-Aktion.
            </p>
          </header>

          <TaskProposalsPanel />
        </div>
      </div>
    </AppShell>
  );
}
