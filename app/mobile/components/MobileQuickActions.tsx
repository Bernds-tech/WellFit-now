import Link from "next/link";
import type { MobileQuickAction } from "../types";

type MobileQuickActionsProps = {
  actions: MobileQuickAction[];
};

export default function MobileQuickActions({ actions }: MobileQuickActionsProps) {
  return (
    <section className="px-4 pt-4">
      <h2 className="mb-3 text-xl font-black text-cyan-200">Schnellstart</h2>
      <div className="grid gap-3">
        {actions.map((action) => {
          const className = "block rounded-[24px] bg-[#053841]/90 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.14)] transition active:scale-[0.98]";
          const content = (
            <>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black text-white">{action.label}</h3>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${action.disabled ? "bg-white/10 text-white/45" : "bg-orange-400 text-[#042f35]"}`}>
                  {action.disabled ? "bald" : "öffnen"}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{action.description}</p>
            </>
          );

          if (action.disabled || !action.href) {
            return <div key={action.label} className={`${className} opacity-75`}>{content}</div>;
          }

          return <Link key={action.label} href={action.href} className={className}>{content}</Link>;
        })}
      </div>
    </section>
  );
}
