import { Beta1StatusBadge } from "./Beta1Foundation";

export default function Beta1LeaderboardPrivacyNotice() {
  return (
    <div className="rounded-xl border border-slate-200/15 bg-slate-950/45 p-4 text-sm text-slate-200/85">
      <div className="mb-2 flex flex-wrap gap-2">
        <Beta1StatusBadge tone="info">Read-only</Beta1StatusBadge>
        <Beta1StatusBadge tone="neutral">Privacy-safe</Beta1StatusBadge>
        <Beta1StatusBadge tone="warning">Keine öffentlichen Kinderprofile</Beta1StatusBadge>
      </div>
      <p>Diese Beta-1 Ansicht zeigt nur freigegebene Projektionen. Keine sensiblen Standortdaten, keine Gesundheitsdaten und keine clientseitige Ranking- oder Reward-Autorität.</p>
    </div>
  );
}
