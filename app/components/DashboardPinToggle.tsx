"use client";

import type { ButtonHTMLAttributes } from "react";

type DashboardPinToggleProps = {
  isPinned: boolean;
  label?: string;
  disabled?: boolean;
  onToggle?: (nextPinned: boolean) => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "disabled" | "onClick">;

export default function DashboardPinToggle({
  isPinned,
  label = "Karte im Dashboard anzeigen",
  disabled = false,
  onToggle,
  className = "",
  ...buttonProps
}: DashboardPinToggleProps) {
  const nextLabel = isPinned ? `${label}: aktiv` : `${label}: inaktiv`;

  return (
    <button
      type="button"
      aria-label={nextLabel}
      aria-pressed={isPinned}
      disabled={disabled}
      onClick={() => onToggle?.(!isPinned)}
      title={nextLabel}
      className={`group inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition ${
        isPinned
          ? "border-orange-300 bg-orange-400/20 text-orange-200 shadow-[0_0_16px_rgba(251,146,60,0.35)]"
          : "border-cyan-200/35 bg-[#082c39]/80 text-cyan-100/70 hover:border-cyan-100 hover:text-cyan-50"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`}
      {...buttonProps}
    >
      <span className={`block rounded-full transition ${isPinned ? "h-3 w-3 bg-orange-300" : "h-2 w-2 bg-cyan-100/70 group-hover:bg-cyan-50"}`} />
    </button>
  );
}
