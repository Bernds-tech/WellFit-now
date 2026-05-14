"use client";

import { useEffect, useMemo, useState } from "react";
import type { InternalShopItemWithPrice } from "@/lib/economy/shopItems";

type ShopSpendPreviewPanelProps = {
  items: InternalShopItemWithPrice[];
};

type SpendPreviewState = {
  status: "idle" | "loading" | "ready" | "blocked" | "error";
  itemId: string | null;
  message: string;
  source: "server" | "local";
};

type SpendPreviewResponse = {
  ok?: boolean;
  status?: string;
  spendPoints?: number;
  remainingPoints?: number;
  reasons?: string[];
  source?: string;
  item?: { title?: string } | null;
};

export default function ShopSpendPreviewPanel({ items }: ShopSpendPreviewPanelProps) {
  const [pointsBalance, setPointsBalance] = useState(120);
  const [selectedItemId, setSelectedItemId] = useState(items[0]?.id ?? "");
  const [previewState, setPreviewState] = useState<SpendPreviewState>({
    status: "idle",
    itemId: null,
    message: "Waehle ein internes Goodie und pruefe den Server-Spend-Pfad.",
    source: "local",
  });

  const selectedItem = useMemo(
    () => items.find((item) => item.id === selectedItemId) ?? items[0],
    [items, selectedItemId]
  );

  useEffect(() => {
    if (!selectedItem) return;

    let isCancelled = false;
    queueMicrotask(() => {
      setPreviewState({
        status: "loading",
        itemId: selectedItem.id,
        message: "Server-Spend-Preview wird vorbereitet...",
        source: "server",
      });
    });

    fetch("/api/economy/spend-preview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: "points-shop-preview-user",
        itemId: selectedItem.id,
        pointsBalance,
        sourceId: "points-shop-preview",
      }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("spend_preview_http_error");
        return (await response.json()) as SpendPreviewResponse;
      })
      .then((data) => {
        if (isCancelled) return;

        if (!data.ok) {
          setPreviewState({
            status: "error",
            itemId: selectedItem.id,
            message: "Server-Preview konnte nicht gelesen werden. Lokale Anzeige bleibt aktiv.",
            source: "local",
          });
          return;
        }

        const spendPoints = Number(data.spendPoints ?? selectedItem.price);
        const remainingPoints = Number(data.remainingPoints ?? Math.max(0, pointsBalance - selectedItem.price));
        const allowed = data.status === "spend_allowed";

        setPreviewState({
          status: allowed ? "ready" : "blocked",
          itemId: selectedItem.id,
          message: allowed
            ? `${data.item?.title ?? selectedItem.title}: ${spendPoints.toLocaleString("de-DE")} interne Punkte vorgemerkt. Rest: ${remainingPoints.toLocaleString("de-DE")}. Keine echte Ausgabe.`
            : `Preview blockiert: ${(data.reasons ?? ["nicht genug interne Punkte"]).join(", ")}. Keine Ausgabe erfolgt.`,
          source: data.source === "server" ? "server" : "local",
        });
      })
      .catch(() => {
        if (isCancelled) return;
        setPreviewState({
          status: "error",
          itemId: selectedItem.id,
          message: "Server-Preview nicht erreichbar. Punkte-Shop bleibt eine sichere interne Beta-Anzeige.",
          source: "local",
        });
      });

    return () => {
      isCancelled = true;
    };
  }, [pointsBalance, selectedItem]);

  if (!selectedItem) return null;

  return (
    <section className="rounded-[28px] border border-cyan-200/20 bg-[#043940]/90 p-5 text-white shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">
            Server-Spend-Preview
          </p>
          <h2 className="mt-1 text-2xl font-black text-cyan-200">Punkte-Shop Spend-Pfad</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-white/65">
            Diese Kachel prueft nur die interne Server-Preview fuer Punkte-Sinks. Es wird kein echter Kauf,
            keine Wallet-Transaktion, kein Token, kein NFT und keine Auszahlung aktiviert.
          </p>
        </div>

        <div className="rounded-2xl bg-cyan-100/10 px-4 py-3 text-right">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-100/50">Quelle</p>
          <p className="mt-1 text-sm font-black text-cyan-100">
            {previewState.source === "server" ? "Server-Preview" : "lokaler Fallback"}
          </p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">
            keine finale Autoritaet
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_2fr]">
        <label className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Beta-Punkte</span>
          <input
            type="number"
            min={0}
            value={pointsBalance}
            onChange={(event) => setPointsBalance(Math.max(0, Number(event.target.value) || 0))}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-lg font-black text-white outline-none"
          />
        </label>

        <label className="rounded-2xl border border-white/10 bg-white/5 p-3">
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/45">Goodie</span>
          <select
            value={selectedItem.id}
            onChange={(event) => setSelectedItemId(event.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-bold text-white outline-none"
          >
            {items.map((item) => (
              <option key={item.id} value={item.id} className="bg-[#043940] text-white">
                {item.title} - {item.price} Punkte
              </option>
            ))}
          </select>
        </label>

        <div className="rounded-2xl border border-orange-200/15 bg-orange-200/8 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-100/55">Preview-Ergebnis</p>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-white/75">{previewState.message}</p>
        </div>
      </div>
    </section>
  );
}
