"use client";

import { useEffect, useState } from "react";
import { readCheckpointAndGlitch, readGuardianChildProfiles, readInventoryAndShop, readPublishedMissions, readXpLedgerEvents, readXpWalletProjection } from "@/lib/beta1/clientReadProjections";
import type { Beta1CheckpointSummary, Beta1ChildProfileSummary, Beta1GlitchEventSummary, Beta1InventoryItem, Beta1MissionSummary, Beta1ShopItem, Beta1XpLedgerEvent, Beta1XpWalletProjection } from "@/lib/beta1/beta1Types";

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

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
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
      if (cancelled) return;
      setWallet(walletRes.data);
      setLedger(ledgerRes.data);
      setMissions(missionRes.data);
      setInventory(inventoryShopRes.inventory);
      setShopItems(inventoryShopRes.shopItems);
      setCheckpoints(checkpointGlitchRes.checkpoints);
      setGlitches(checkpointGlitchRes.glitches);
      setChildProfiles(childRes.data);
      setError(walletRes.error || ledgerRes.error || missionRes.error || inventoryShopRes.error || checkpointGlitchRes.error || childRes.error);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="rounded-[24px] border border-emerald-200/20 bg-[#063844]/80 p-5">
      <h2 className="text-xl font-black text-emerald-200">Beta-1 Read Projections (Client Read-only)</h2>
      <p className="mt-2 text-sm text-white/70">Nur serverseitig projizierte Lesedaten. Keine clientseitige XP-, Mission-, Shop-, Mayor-, Glitch- oder Admin-Autorität.</p>
      {loading && <p className="mt-3 text-sm text-emerald-100/80">Lade sichere Beta-1 Projektionen...</p>}
      {!loading && error && <p className="mt-3 text-sm text-amber-200">{error}</p>}
      {!loading && !error && wallet === null && <p className="mt-3 text-sm text-white/70">Noch keine Wallet-Projektion vorhanden.</p>}

      {!loading && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-black/20 p-3 text-sm">Wallet: <b>{wallet?.balance ?? 0} WFXP</b></div>
          <div className="rounded-xl bg-black/20 p-3 text-sm">Ledger Events: <b>{ledger.length}</b></div>
          <div className="rounded-xl bg-black/20 p-3 text-sm">Published Missions: <b>{missions.length}</b></div>
          <div className="rounded-xl bg-black/20 p-3 text-sm">Inventory Items: <b>{inventory.length}</b></div>
          <div className="rounded-xl bg-black/20 p-3 text-sm">Shop Items: <b>{shopItems.length}</b></div>
          <div className="rounded-xl bg-black/20 p-3 text-sm">Checkpoints: <b>{checkpoints.length}</b> · Glitches: <b>{glitches.length}</b></div>
          <div className="rounded-xl bg-black/20 p-3 text-sm md:col-span-2">Guardian Child Profiles: <b>{childProfiles.length}</b></div>

          <ul className="rounded-xl bg-black/20 p-3 text-xs text-white/75">
            <li className="mb-1 font-semibold text-white">Ledger Preview</li>
            {ledger.slice(0, 3).map((item) => <li key={item.id}>{item.type}: {item.amount} WFXP</li>)}
            {ledger.length === 0 && <li>Keine Ledger-Einträge.</li>}
          </ul>
          <ul className="rounded-xl bg-black/20 p-3 text-xs text-white/75">
            <li className="mb-1 font-semibold text-white">Mission Preview</li>
            {missions.slice(0, 3).map((item) => <li key={item.id}>{item.title}</li>)}
            {missions.length === 0 && <li>Keine veröffentlichten Missionen.</li>}
          </ul>
        </div>
      )}
    </section>
  );
}
