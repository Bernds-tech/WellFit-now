import { ReactNode } from "react";

export default function RegisterPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-[28px] bg-[#053841]/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
      <h3 className="mb-4 text-xl font-bold text-white">{title}</h3>
      {children}
    </div>
  );
}
