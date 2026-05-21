import type { Beta1InventoryItem } from "@/lib/beta1/beta1Types";
import { Beta1EmptyState } from "./Beta1Foundation";

export default function Beta1InventorySummary({ items }: { items: Beta1InventoryItem[] }) {
  if (items.length === 0) {
    return <Beta1EmptyState title="Kein Inventory" detail="Noch keine serverseitig projizierten Inventory-Items gefunden." />;
  }

  return (
    <ul className="space-y-2 text-sm text-slate-200/85">
      {items.map((item) => (
        <li key={item.id} className="rounded-lg border border-slate-200/10 bg-slate-950/40 p-3">
          <span className="font-medium text-slate-100">{item.itemDefinitionId ?? item.id}</span>
          <span className="ml-2 text-slate-300">x{item.quantity}</span>
          <span className="ml-2 text-xs text-slate-400">{item.status ?? "status-offen"}</span>
        </li>
      ))}
    </ul>
  );
}
