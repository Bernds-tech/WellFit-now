"use client";

import { useEffect, useState } from "react";
import { Beta1EmptyState, Beta1MetricCard, Beta1SectionCard } from "./Beta1Foundation";
import { readLeaderboardPreview } from "@/lib/beta1/clientReadProjections";
import type { Beta1LeaderboardPreview } from "@/lib/beta1/beta1Types";
import Beta1LeaderboardRow from "./Beta1LeaderboardRow";
import Beta1LeaderboardPrivacyNotice from "./Beta1LeaderboardPrivacyNotice";

export default function Beta1Leaderboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<Beta1LeaderboardPreview | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const result = await readLeaderboardPreview();
      if (cancelled) return;
      setPreview(result.data);
      setError(result.error);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <Beta1LeaderboardPrivacyNotice />
      {loading && <p className="text-sm text-slate-200/80">Lade Leaderboard-Projektionen ...</p>}
      {!loading && error && <p className="rounded-lg border border-amber-300/30 bg-amber-500/10 p-3 text-sm text-amber-100">{error}</p>}
      {!loading && preview && (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            <Beta1MetricCard label="Eigene WFXP" value={preview.summary.wfxp} />
            <Beta1MetricCard label="Eigene Missions-Projektion" value={preview.summary.missions} />
            <Beta1MetricCard label="Eigene Checkpoints" value={preview.summary.checkpoints} />
          </div>

          <Beta1SectionCard title="Leaderboard Preview (limited)" description="Aktuell nur sichere, begrenzte Vorschau. Finale Ranglogik bleibt serverseitig.">
            {preview.rows.length === 0 ? (
              <Beta1EmptyState title="Keine sichere Leaderboard-Projektion" detail="Es sind noch keine freigegebenen anonymisierten Rangdaten vorhanden. Nur eigene Fortschrittsmetriken werden angezeigt." />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-300/85">
                      <th className="px-3 py-2">Rang</th>
                      <th className="px-3 py-2">Anzeige</th>
                      <th className="px-3 py-2">WFXP</th>
                      <th className="px-3 py-2">Missionen</th>
                      <th className="px-3 py-2">Checkpoints</th>
                      <th className="px-3 py-2">Scope</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((row) => (
                      <Beta1LeaderboardRow key={row.id} row={row} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Beta1SectionCard>
        </>
      )}
    </div>
  );
}
