"use client";

import { useEffect, useState } from "react";
import { Beta1EmptyState, Beta1MetricCard, Beta1SectionCard, Beta1StatusBadge } from "./Beta1Foundation";
import { readInventoryAndShop, readXpWalletProjection } from "@/lib/beta1/clientReadProjections";
import type { Beta1InventoryItem, Beta1ShopItem, Beta1XpWalletProjection } from "@/lib/beta1/beta1Types";
import Beta1ShopItemCard from "./Beta1ShopItemCard";
import Beta1InventorySummary from "./Beta1InventorySummary";

export default function Beta1PointsShop() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<Beta1XpWalletProjection | null>(null);
  const [shopItems, setShopItems] = useState<Beta1ShopItem[]>([]);
  const [inventory, setInventory] = useState<Beta1InventoryItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [walletRes, shopRes] = await Promise.all([readXpWalletProjection(), readInventoryAndShop()]);
      if (cancelled) return;
      setWallet(walletRes.data);
      setShopItems(shopRes.shopItems);
      setInventory(shopRes.inventory);
      setError(walletRes.error || shopRes.error);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <Beta1SectionCard title="Beta-1 Shop-Sicherheit" description="WFXP-only Read/Intent Slice ohne clientseitige finale Spend-/Purchase-Authority.">
        <div className="flex flex-wrap gap-2">
          <Beta1StatusBadge tone="info">Read-Projections</Beta1StatusBadge>
          <Beta1StatusBadge tone="warning">Anfrage/Intent-only</Beta1StatusBadge>
          <Beta1StatusBadge tone="neutral">Finale Authority bleibt serverseitig</Beta1StatusBadge>
        </div>
        <p className="mt-3 text-sm text-slate-200/85">Beta-1: WFXP-only, keine Echtgeldkäufe, keine Token/NFT/Cashout-Funktion.</p>
      </Beta1SectionCard>

      {loading && <p className="text-sm text-slate-200/80">Lade Punkte-Shop-Projektionen ...</p>}
      {!loading && error && <p className="rounded-lg border border-amber-300/30 bg-amber-500/10 p-3 text-sm text-amber-100">{error}</p>}

      {!loading && (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <Beta1MetricCard label="WFXP Balance" value={`${wallet?.balance ?? 0} WFXP`} note="Read-Projektion, keine lokale Spend-Autorität." />
            <Beta1MetricCard label="Shop Items" value={shopItems.length} />
            <Beta1MetricCard label="Inventory Positionen" value={inventory.length} />
          </div>

          <Beta1SectionCard title="Shop-Katalog" description="Serverseitig freigegebene Items mit WFXP-Preisen und Status.">
            {shopItems.length === 0 ? <Beta1EmptyState title="Keine Shop-Items" detail="Aktuell sind keine veröffentlichten Shop-Items in der Read-Projektion vorhanden." /> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{shopItems.map((item) => <Beta1ShopItemCard key={item.id} item={item} />)}</div>}
          </Beta1SectionCard>

          <Beta1SectionCard title="Inventory Zusammenfassung" description="Gelesene Inventory-Projektion ohne Unlock/Grant/Spend-Schreibpfad im Client.">
            <Beta1InventorySummary items={inventory} />
          </Beta1SectionCard>
        </>
      )}
    </div>
  );
}
