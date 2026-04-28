"use client";

import type { MissionUiStatus } from "@/lib/missions";
import { getMissionUiStatusDefinition } from "@/lib/missions";

const badgeClasses: Record<MissionUiStatus, string> = {
  placeholder: "border-slate-300/25 bg-slate-300/10 text-slate-100",
  kiDraft: "border-purple-300/35 bg-purple-400/15 text-purple-100",
  needsReview: "border-yellow-300/35 bg-yellow-400/15 text-yellow-100",
  approved: "border-cyan-300/35 bg-cyan-400/15 text-cyan-100",
  active: "border-emerald-300/35 bg-emerald-400/15 text-emerald-100",
  completed: "border-green-300/35 bg-green-400/15 text-green-100",
  rejected: "border-red-300/35 bg-red-400/15 text-red-100",
};

type MissionStatusBadgeProps = {
  status: MissionUiStatus;
  compact?: boolean;
  className?: string;
};

export default function MissionStatusBadge({ status, compact = false, className = "" }: MissionStatusBadgeProps) {
  const definition = getMissionUiStatusDefinition(status);

  return (
    <div
      className={`inline-flex max-w-full flex-col rounded-xl border px-3 py-2 text-left shadow-[0_8px_20px_rgba(0,0,0,0.12)] ${badgeClasses[status]} ${className}`}
      title={definition.description}
    >
      <span className="text-[10px] font-black uppercase tracking-[0.24em]">{definition.label}</span>
      {!compact && <span className="mt-1 text-xs font-semibold leading-snug opacity-90">{definition.description}</span>}
    </div>
  );
}
