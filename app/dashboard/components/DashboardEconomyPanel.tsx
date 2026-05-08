import { createDashboardEconomySnapshot } from "@/lib/economy/dashboardSnapshot";

type DashboardEconomyPanelProps = {
  pointsBalance: number;
  userId?: string;
};

const getHealthLabel = (healthState: "healthy" | "watch" | "critical") => {
  if (healthState === "critical") return "kritisch";
  if (healthState === "watch") return "beobachten";
  return "gesund";
};

export default function DashboardEconomyPanel({ pointsBalance, userId }: DashboardEconomyPanelProps) {
  const economySnapshot = createDashboardEconomySnapshot({ pointsBalance, userId });
  const previewStatus = economySnapshot.sampleRewardPreview.status;

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
          <p className="mt-1 text-lg font-black text-white">{previewStatus === "preview_allowed" ? "bereit" : "Review"}</p>
        </div>
      </div>
    </section>
  );
}
