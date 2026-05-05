"use client";

import AppShell from "@/app/components/AppShell";

type ProductModulePlaceholderPageProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  status: string;
  cards: {
    title: string;
    body: string;
  }[];
  safetyNotes?: string[];
};

export default function ProductModulePlaceholderPage({
  eyebrow,
  title,
  subtitle,
  status,
  cards,
  safetyNotes = [
    "Keine clientseitige Punkte-, Reward-, Wallet-, Token- oder NFT-Autorität.",
    "Dieses Modul ist ein MVP-Platzhalter und bereitet nur UI, Navigation und spätere Serveranbindung vor.",
  ],
}: ProductModulePlaceholderPageProps) {
  return (
    <AppShell reward={0}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyan-200/80">{eyebrow}</p>
          <h1 className="mt-2 text-5xl font-extrabold leading-none">{title}</h1>
          <p className="mt-2 max-w-4xl text-lg leading-relaxed text-cyan-100/90">{subtitle}</p>
        </div>
        <div className="shrink-0 rounded-full border border-orange-300/30 bg-orange-400/15 px-4 py-2 text-sm font-bold text-orange-100">
          {status}
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1.6fr_0.9fr] gap-5 overflow-hidden pb-20">
        <div className="min-h-0 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {cards.map((card) => (
              <div key={card.title} className="rounded-[22px] border border-cyan-300/10 bg-[#053841]/90 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
                <h2 className="text-xl font-extrabold text-white">{card.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{card.body}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="min-h-0 overflow-y-auto rounded-[24px] bg-[#053841]/90 p-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyan-300/80">Sicherheitsstatus</p>
          <h2 className="mt-2 text-2xl font-extrabold text-white">MVP-sicher vorbereitet</h2>
          <div className="mt-5 space-y-3">
            {safetyNotes.map((note) => (
              <div key={note} className="rounded-[16px] border border-white/10 bg-[#082c39] px-4 py-3 text-sm leading-relaxed text-white/78">
                {note}
              </div>
            ))}
          </div>
          <p className="mt-5 text-xs leading-relaxed text-white/55">
            Die produktive Umsetzung erfolgt später über Firestore Rules, Cloud Functions, serverseitige Audit-Events und interne Punkteökonomie.
          </p>
        </aside>
      </div>
    </AppShell>
  );
}
