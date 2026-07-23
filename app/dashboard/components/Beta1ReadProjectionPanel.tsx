"use client";

import { useCallback, useEffect, useState } from "react";
import {
  readCheckpointAndGlitch,
  readGuardianChildProfiles,
  readInventoryAndShop,
  readPublishedMissions,
  readXpLedgerEvents,
  readXpWalletProjection,
} from "@/lib/beta1/clientReadProjections";
import type {
  Beta1CheckpointSummary,
  Beta1ChildProfileSummary,
  Beta1GlitchEventSummary,
  Beta1InventoryItem,
  Beta1MissionSummary,
  Beta1ShopItem,
  Beta1XpLedgerEvent,
  Beta1XpWalletProjection,
} from "@/lib/beta1/beta1Types";
import {
  Beta1EmptyState,
  Beta1MetricCard,
  Beta1SectionCard,
  Beta1StatusBadge,
} from "@/components/beta1/Beta1Foundation";

export default function Beta1ReadProjectionPanel() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<Beta1XpWalletProjection | null>(null);
  const [ledger, setLedger] = useState<Beta1XpLedgerEvent[]>([]);
  const [missions, setMissions] = useState<Beta1MissionSummary[]>([]);
  const [inventory, setInventory] = useState<Beta1InventoryItem[]>([]);
  const [shopItems, setShopItems] = useState<Beta1ShopItem[]>([]);
  const [checkpoints, setCheckpoints] = useState<Beta1CheckpointSummary[]>([]);
  const [glitches, setGlitches] = useState<Beta1GlitchEventSummary[]>([]);
  const [childProfiles, setChildProfiles] = useState<Beta1ChildProfileSummary[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [walletRes, ledgerRes, missionRes, inventoryShopRes, checkpointGlitchRes, childRes] = await Promise.all([
      readXpWalletProjection(),
      readXpLedgerEvents(),
      readPublishedMissions(),
      readInventoryAndShop(),
      readCheckpointAndGlitch(),
      readGuardianChildProfiles(),
    ]);
    setWallet(walletRes.data);
    setLedger(ledgerRes.data);
    setMissions(missionRes.data);
    setInventory(inventoryShopRes.inventory);
    setShopItems(inventoryShopRes.shopItems);
    setCheckpoints(checkpointGlitchRes.checkpoints);
    setGlitches(checkpointGlitchRes.glitches);
    setChildProfiles(childRes.data);
    setError(
      walletRes.error
        || ledgerRes.error
        || missionRes.error
        || inventoryShopRes.error
        || checkpointGlitchRes.error
        || childRes.error,
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    const safeLoad = async () => {
      if (!active) return;
      await load();
    };
    safeLoad();
    const onProjectionUpdated = () => {
      safeLoad();
    };
    window.addEventListener("wellfit-beta1-projection-updated", onProjectionUpdated);
    return () => {
      active = false;
      window.removeEventListener("wellfit-beta1-projection-updated", onProjectionUpdated);
    };
  }, [load]);

  return (
    <Beta1SectionCard
      title="Beta-1 Read Projections"
      description="Ausschließlich serverseitig projizierte Lesedaten. Keine clientseitige Autorität für XP, Missionen, Shop, Glitches oder Admin-Freigaben."
    >
      <div className="mb-3 flex flex-wrap gap-2">
        <Beta1StatusBadge tone="info">Client Read-only</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Authority bleibt serverseitig</Beta1StatusBadge>
      </div>
      {loading && <p className="text-sm text-slate-200/80">Lade Beta-1-Projektionen ...</p>}
      {!loading && error && <p className="rounded-lg border border-amber-300/30 bg-amber-500/10 p-3 text-sm text-amber-100">{error}</p>}
      {!loading && !error && wallet === null && <Beta1EmptyState title="Noch keine Wallet-Projektion" detail="Sobald eine serverseitige Projektion vorliegt, werden Werte hier angezeigt." />}

      {!loading && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Beta1MetricCard label="Wallet" value={`${wallet?.balance ?? 0} WFXP`} />
            <Beta1MetricCard label="Ledger Events" value={ledger.length} />
            <Beta1MetricCard label="Published Missions" value={missions.length} />
            <Beta1MetricCard label="Inventory Items" value={inventory.length} />
            <Beta1MetricCard label="Shop Items" value={shopItems.length} />
            <Beta1MetricCard label="Checkpoints / Glitches" value={`${checkpoints.length} / ${glitches.length}`} />
            <Beta1MetricCard label="Guardian Child Profiles" value={childProfiles.length} note="Read-Projektion ohne Client-Freigabe." />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <ul className="rounded-xl border border-slate-200/10 bg-slate-950/45 p-3 text-xs text-slate-200/85">
              <li className="mb-2 text-sm font-semibold text-slate-50">Ledger Preview</li>
              {ledger.slice(0, 3).map((item) => <li key={item.id}>{item.type}: {item.amount} WFXP</li>)}
              {ledger.length === 0 && <li>Keine Ledger-Einträge.</li>}
            </ul>
            <ul className="rounded-xl border border-slate-200/10 bg-slate-950/45 p-3 text-xs text-slate-200/85">
              <li className="mb-2 text-sm font-semibold text-slate-50">Mission Preview (erste 3)</li>
              {missions.slice(0, 3).map((item) => {
                const rewardLabel = typeof item.rewardXp === "number" ? `${item.rewardXp} WFXP` : "Reward offen";
                return <li key={item.id}>{item.title} · {item.type} · {rewardLabel}</li>;
              })}
              {missions.length === 0 && <li>Keine veröffentlichten Missionen.</li>}
            </ul>
          </div>
        </div>
      )}
    </Beta1SectionCard>
  );
}
