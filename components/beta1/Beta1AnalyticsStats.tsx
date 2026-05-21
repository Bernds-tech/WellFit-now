"use client";

import { useEffect, useState } from "react";
import { Beta1EmptyState, Beta1SectionCard, Beta1StatusBadge } from "./Beta1Foundation";
import { readAnalyticsOwnView } from "@/lib/beta1/clientReadProjections";
import type { Beta1AnalyticsOwnViewProjection } from "@/lib/beta1/beta1Types";
import Beta1AnalyticsMetricGrid from "./Beta1AnalyticsMetricGrid";
import Beta1AnalyticsSafetyNotice from "./Beta1AnalyticsSafetyNotice";

export default function Beta1AnalyticsStats() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ownView, setOwnView] = useState<Beta1AnalyticsOwnViewProjection | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await readAnalyticsOwnView();
      if (cancelled) return;
      setOwnView(result.data);
      setError(result.error);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <Beta1AnalyticsSafetyNotice />
      {loading && <p className="text-sm text-slate-200/80">Lade sichere Analytics-Projektionen ...</p>}
      {!loading && error && <p className="rounded-lg border border-amber-300/30 bg-amber-500/10 p-3 text-sm text-amber-100">{error}</p>}
      {!loading && ownView && (
        <>
          <Beta1AnalyticsMetricGrid ownView={ownView} />
          <Beta1SectionCard title="Analytics Scope" description={ownView.note}>
            <div className="flex flex-wrap gap-2">
              <Beta1StatusBadge tone={ownView.hasServerAnalyticsProjection ? "success" : "warning"}>
                {ownView.hasServerAnalyticsProjection ? "Server Analytics Projection aktiv" : "Limited Preview"}
              </Beta1StatusBadge>
              <Beta1StatusBadge tone="neutral">Keine Client-Authority</Beta1StatusBadge>
            </div>
          </Beta1SectionCard>
          {!ownView.hasServerAnalyticsProjection && (
            <Beta1EmptyState
              title="Sichere Analytics-Projektion fehlt"
              detail="Aktuell wird nur eine begrenzte Own-View aus vorhandenen Read-Projections gezeigt. Follow-up: serverseitige Analytics-Projektion definieren."
            />
          )}
        </>
      )}
    </div>
  );
}
