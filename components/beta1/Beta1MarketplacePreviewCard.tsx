import { Beta1StatusBadge } from "./Beta1Foundation";

type Beta1MarketplacePreviewCardProps = {
  title: string;
  description: string;
  statusLabel: string;
};

export default function Beta1MarketplacePreviewCard({ title, description, statusLabel }: Beta1MarketplacePreviewCardProps) {
  return (
    <article className="rounded-xl border border-slate-200/10 bg-slate-950/45 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <Beta1StatusBadge tone="warning">{statusLabel}</Beta1StatusBadge>
      </div>
      <p className="text-sm text-slate-200/80">{description}</p>
    </article>
  );
}
