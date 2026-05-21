import { Beta1MetricCard } from "./Beta1Foundation";

export type Beta1AnalyticsOwnView = {
  wfxpBalance: number;
  ledgerEvents: number;
  publishedMissions: number;
  publishedCheckpoints: number;
  inventoryItems: number;
  publishedShopItems: number;
  hasServerAnalyticsProjection: boolean;
  note: string;
};

export default function Beta1AnalyticsMetricGrid({ ownView }: { ownView: Beta1AnalyticsOwnView }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      <Beta1MetricCard label="Eigene WFXP" value={ownView.wfxpBalance} note="Read-Projektion." />
      <Beta1MetricCard label="Eigene Ledger Events" value={ownView.ledgerEvents} />
      <Beta1MetricCard label="Published Missions" value={ownView.publishedMissions} />
      <Beta1MetricCard label="Published Checkpoints" value={ownView.publishedCheckpoints} />
      <Beta1MetricCard label="Inventory Positionen" value={ownView.inventoryItems} />
      <Beta1MetricCard label="Published Shop Items" value={ownView.publishedShopItems} />
    </div>
  );
}
