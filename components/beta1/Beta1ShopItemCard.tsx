import type { Beta1ShopItem } from "@/lib/beta1/beta1Types";
import { Beta1StatusBadge } from "./Beta1Foundation";

const mapTone = (status?: string): "neutral" | "success" | "warning" | "info" => {
  if (status === "published" || status === "active") return "success";
  if (status === "paused" || status === "preview") return "warning";
  return "neutral";
};

export default function Beta1ShopItemCard({ item }: { item: Beta1ShopItem }) {
  return (
    <article className="rounded-xl border border-slate-200/10 bg-slate-950/45 p-4">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-50">{item.title}</h3>
        <Beta1StatusBadge tone={mapTone(item.status)}>{item.status || "unknown"}</Beta1StatusBadge>
      </div>
      <p className="mt-2 text-xl font-semibold text-slate-100">{item.priceWfxp} WFXP</p>
      <p className="mt-1 text-xs text-slate-300/80">Kategorie: {item.category ?? "n/a"} · Seltenheit: {item.rarity ?? "n/a"}</p>
      <button type="button" disabled className="mt-4 w-full rounded-lg border border-slate-300/20 bg-slate-800/50 px-3 py-2 text-xs font-medium text-slate-300">
        Anfrage vormerken (finale Freigabe serverseitig)
      </button>
    </article>
  );
}
