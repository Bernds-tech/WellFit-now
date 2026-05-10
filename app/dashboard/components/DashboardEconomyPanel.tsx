import { createDashboardEconomySnapshot } from "@/lib/economy/dashboardSnapshot";

type DashboardEconomyPanelProps = {
  pointsBalance: number;
  userId?: string;
  projectionSource?: "server" | "local";
};

const getHealthLabel = (healthState: "healthy" | "watch" | "critical") => {
  if (healthState === "critical") return "kritisch";
  if (healthState === "watch") return "beobachten";
  return "gesund";
};

const getPreviewStatusLabel = (status: string) => {
  if (status === "preview_allowed") return "Preview bereit";
  if (status === "manual_review") return "Review nötig";
  return "Blockiert";
};

const compactDraftTarget = (collection: string, documentId: string) => {
  const shortId = documentId.length > 28 ? `${documentId.slice(0, 14)}…${documentId.slice(-10)}` : documentId;
  return `${collection}/${shortId}`;
};

export default function DashboardEconomyPanel({
  pointsBalance,
  userId,
  projectionSource = "local",
}: DashboardEconomyPanelProps) {
  const economySnapshot = createDashboardEconomySnapshot({ pointsBalance, userId });
  const previewStatus = economySnapshot.sampleRewardPreview.status;
  const ledgerSummary = economySnapshot.ledgerSummary;
  const draftTarget = compactDraftTarget(
    ledgerSummary.auditDraft.collection,
    ledgerSummary.auditDraft.documentId
  );
  const projectionLabel = projectionSource === "server" ? "Projection API" : "lokaler Fallback";

  return (
    <section className="rounded-[24px] border border-cyan-200/15 bg-[#042f37]/90 p-5 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-100/60">
            Interne Beta-Economy
          </p>
          <h2 className="mt-1 text-2xl font-black text-cyan-300">
            {economySnapshot.displayBalance} {economySnapshot.currencyLabel}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/70">
            Diese Punkte sind aktuell ein internes WellFit-Beta-System fuer Missionen, XP,
            Buddy-Fortschritt und spaetere Abrechnungstests. Sie sind noch keine Token,
            keine WFT und keine Auszahlung.
          </p>
        </div>

        <div className="rounded-2xl bg-cyan-100/10 px-4 py-3 text-right">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/60">
            Status
          </p>
          <p className="mt-1 text-sm font-black text-cyan-100">Internes Ledger zuerst</p>
          <p className="mt-1 text-xs text-white/55">Economy: {getHealthLabel(economySnapshot.healthState)}</p>
          <p className="mt-1 text-xs text-cyan-100/70">Quelle: {projectionLabel}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-sm font-black text-white">1. Punkte stabilisieren</p>
          <p className="mt-1 text-xs leading-relaxed text-white/60">
            Missionen, XP, Streaks und Buddy-Fortschritt laufen zuerst intern.
          </p>
        </div>
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-sm font-black text-white">2. Abrechnung pruefen</p>
          <p className="mt-1 text-xs leading-relaxed text-white/60">
            Ledger, Caps, Audit-Events und Korrekturen muessen vor Tokenisierung funktionieren.
          </p>
        </div>
        <div className="rounded-2xl bg-black/18 p-3">
          <p className="text-sm font-black text-white">3. Token spaeter</p>
          <p className="mt-1 text-xs leading-relaxed text-white/60">
            Token koennen spaeter interne Punkte ersetzen oder spiegeln, aber erst nach stabiler Beta.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/50">UserDailyCap</p>
          <p className="mt-1 text-lg font-black text-white">{economySnapshot.userDailyCap.toLocaleString("de-DE")}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/50">DailyEmissionCap</p>
          <p className="mt-1 text-lg font-black text-white">{economySnapshot.dailyEmissionCap.toLocaleString("de-DE")}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/50">Reward Preview</p>
          <p className="mt-1 text-lg font-black text-white">{getPreviewStatusLabel(previewStatus)}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-200/10 bg-cyan-100/5 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/50">Reserve</p>
          <p className="mt-1 text-lg font-black text-white">{economySnapshot.reserveDisplay}</p>
        </div>
        <div className="rounded-2xl border border-cyan-200/10 bg-cyan-100/5 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/50">Ausschüttung</p>
          <p className="mt-1 text-lg font-black text-white">{economySnapshot.rewardRateDisplay}</p>
        </div>
        <div className="rounded-2xl border border-cyan-200/10 bg-cyan-100/5 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-100/50">Goodie-Preise</p>
          <p className="mt-1 text-lg font-black text-white">{economySnapshot.priceRateDisplay}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-orange-300/20 bg-orange-300/8 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-100/60">
              Ledger / Review / Correction
            </p>
            <h3 className="mt-1 text-lg font-black text-orange-100">{ledgerSummary.authorityLabel}</h3>
            <p className="mt-2 max-w-3xl text-xs leading-relaxed text-white/65">
              Die App nutzt bereits Server-Preview, Completion-Drafts und Projection-Read-Vorstufen. Finale Punkte-, XP- und Avatar-Autoritaet
              bleibt noch bewusst deaktiviert, bis serverseitige Persistenz, Audit und Firestore Rules stabil sind.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-right">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">Live Write</p>
            <p className="mt-1 text-sm font-black text-orange-100">
              {ledgerSummary.liveWriteEnabled ? "aktiv" : "noch aus"}
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <div className="rounded-xl bg-black/18 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Preview API</p>
            <p className="mt-1 text-sm font-black text-white">aktiv</p>
          </div>
          <div className="rounded-xl bg-black/18 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Completion</p>
            <p className="mt-1 text-sm font-black text-white">vorbereitet</p>
          </div>
          <div className="rounded-xl bg-black/18 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Projection Read</p>
            <p className="mt-1 text-sm font-black text-white">{projectionLabel}</p>
          </div>
          <div className="rounded-xl bg-black/18 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Rules-Härtung</p>
            <p className="mt-1 text-sm font-black text-white">wartet auf Server-Persistenz</p>
          </div>
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Review-Pfad</p>
            <p className="mt-1 text-xs font-semibold text-white/75">Manual Review vorbereitet</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Correction-Pfad</p>
            <p className="mt-1 text-xs font-semibold text-white/75">Korrektur-Events geplant</p>
          </div>
          <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">Draft-Ziel</p>
            <p className="mt-1 max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs font-semibold text-white/75" title={`${ledgerSummary.auditDraft.collection}/${ledgerSummary.auditDraft.documentId}`}>
              {draftTarget}
            </p>
            <p className="mt-1 text-[10px] text-white/40">gekürzt; volle ID intern im Draft</p>
          </div>
        </div>
      </div>
    </section>
  );
}
