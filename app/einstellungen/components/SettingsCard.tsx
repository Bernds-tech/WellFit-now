"use client";

import type { ReactNode } from "react";

export default function SettingsCard({
  title,
  children,
  titleClassName = "text-cyan-300",
}: {
  title: string;
  children: ReactNode;
  titleClassName?: string;
}) {
  return (
    <div className="rounded-[22px] bg-[#053841]/85 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
      <h2 className={`mb-3 text-2xl font-bold ${titleClassName}`}>{title}</h2>
      {children}
    </div>
  );
}
