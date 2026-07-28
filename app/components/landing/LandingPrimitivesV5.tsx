import type { ReactNode } from "react";

export function LandingToneIcon({ tone, children }: { tone: string; children: ReactNode }) {
  const styles =
    tone === "amber"
      ? "border-amber-300/45 bg-amber-300/10 text-amber-200"
      : tone === "lime"
        ? "border-lime-300/40 bg-lime-300/10 text-lime-200"
        : tone === "orange"
          ? "border-orange-300/45 bg-orange-300/10 text-orange-200"
          : "border-cyan-300/45 bg-cyan-300/10 text-cyan-200";

  return (
    <span
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border text-sm font-black shadow-[0_0_24px_rgba(34,211,238,.12)] ${styles}`}
    >
      {children}
    </span>
  );
}

export function LandingSectionHeading({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center lg:mb-14">
      <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#ffd95d]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl lg:text-[46px]">
        {title}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-cyan-50/68 sm:text-base">{text}</p>
    </div>
  );
}
