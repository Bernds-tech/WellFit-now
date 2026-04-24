import { ReactNode } from "react";

export default function RegisterPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[20px] bg-[#053841]/90 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.12)]">
      <h3 className="mb-3 text-base font-bold text-white">{title}</h3>
      {children}
    </div>
  );
}
