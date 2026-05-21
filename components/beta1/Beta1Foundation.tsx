import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "info";

const toneClasses: Record<Tone, string> = {
  neutral: "border-slate-300/20 bg-slate-700/40 text-slate-100",
  success: "border-emerald-300/30 bg-emerald-500/15 text-emerald-100",
  warning: "border-amber-300/35 bg-amber-500/15 text-amber-100",
  info: "border-sky-300/35 bg-sky-500/15 text-sky-100",
};

export function Beta1PageShell({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-5">
      <header className="space-y-2 rounded-2xl border border-slate-200/15 bg-slate-900/55 p-5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-50">{title}</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-200/85">{subtitle}</p>
      </header>
      {children}
    </div>
  );
}

export function Beta1SectionCard({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200/15 bg-slate-900/45 p-4 md:p-5">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-slate-50">{title}</h2>
        {description ? <p className="mt-1 text-sm text-slate-200/80">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Beta1StatusBadge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${toneClasses[tone]}`}>{children}</span>;
}

export function Beta1MetricCard({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <article className="rounded-xl border border-slate-200/10 bg-slate-950/45 p-3.5">
      <p className="text-xs uppercase tracking-wide text-slate-300/85">{label}</p>
      <p className="mt-2 text-xl font-semibold text-slate-50">{value}</p>
      {note ? <p className="mt-1 text-xs text-slate-300/80">{note}</p> : null}
    </article>
  );
}

export function Beta1EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300/20 bg-slate-950/30 p-4 text-sm text-slate-200/80">
      <p className="font-medium text-slate-100">{title}</p>
      <p className="mt-1">{detail}</p>
    </div>
  );
}
