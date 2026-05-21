import { Beta1StatusBadge } from "./Beta1Foundation";
import type { Beta1LeaderboardPreviewRow } from "@/lib/beta1/beta1Types";

export default function Beta1LeaderboardRow({ row }: { row: Beta1LeaderboardPreviewRow }) {
  return (
    <tr className="border-b border-slate-200/10 text-sm text-slate-100 last:border-0">
      <td className="px-3 py-2 font-medium">{row.rankLabel}</td>
      <td className="px-3 py-2">{row.displayName}</td>
      <td className="px-3 py-2">{row.wfxp} WFXP</td>
      <td className="px-3 py-2">{row.missions}</td>
      <td className="px-3 py-2">{row.checkpoints}</td>
      <td className="px-3 py-2">
        <Beta1StatusBadge tone={row.scope === "self" ? "success" : "neutral"}>{row.scope === "self" ? "Eigene Projektion" : "Platzhalter"}</Beta1StatusBadge>
      </td>
    </tr>
  );
}
