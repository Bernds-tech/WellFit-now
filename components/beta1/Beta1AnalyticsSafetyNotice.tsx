import { Beta1SectionCard, Beta1StatusBadge } from "./Beta1Foundation";

export default function Beta1AnalyticsSafetyNotice() {
  return (
    <Beta1SectionCard
      title="Analytics Safety"
      description="Diese Ansicht ist auf eigene, sichere Read-Projections begrenzt und bleibt rein informativ."
    >
      <div className="flex flex-wrap gap-2">
        <Beta1StatusBadge tone="info">Own-view</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Read-only</Beta1StatusBadge>
        <Beta1StatusBadge tone="warning">Keine Diagnose</Beta1StatusBadge>
      </div>
      <p className="mt-3 text-sm text-slate-200/85">
        Es werden keine Gesundheitsdiagnosen, keine Standort-Rohdaten, keine Kinder-Rohdaten und keine fremden Profil-Rohdaten angezeigt.
      </p>
    </Beta1SectionCard>
  );
}
