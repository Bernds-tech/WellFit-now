import PreparedMissionPage, { type PreparedMissionCard } from "../components/PreparedMissionPage";

const historyCards: PreparedMissionCard[] = [
  {
    id: "history-main-completions",
    title: "Gepruefte Hauptmissionen",
    description: "Vorbereiteter Bereich fuer spaetere serverseitig abgeschlossene Tagesmissionen, Wochenmissionen, Abenteuer, Challenges und Wettkaempfe.",
    icon: "📜",
    categoryLabel: "history · Server-Completion",
    status: "placeholder",
    notes: [
      "Completed darf erst nach Serverentscheidung angezeigt werden.",
      "History ist Anzeige und Audit-Verlauf, nicht Reward-Autoritaet.",
    ],
  },
  {
    id: "history-sidequest-events",
    title: "AR-Buddy Side Quest Events",
    description: "Vorbereiteter Bereich fuer Evidence beantwortet, Reward geprueft, manuelle Pruefung oder Wiederholschutz.",
    icon: "🧭",
    categoryLabel: "history · Side Quest",
    status: "placeholder",
    notes: [
      "Side Quests erscheinen nicht automatisch als abgeschlossene Tagesmission oder Abenteuer.",
      "Status wie evidenceSubmitted, rewardPreviewed oder manualReview folgt spaeter serverseitig.",
    ],
  },
  {
    id: "history-review-events",
    title: "Review- und Sicherheitsereignisse",
    description: "Vorbereiteter Bereich fuer PatternReview, CooldownReview, EvidenceReview und spaetere Audit-Events.",
    icon: "🛡️",
    categoryLabel: "history · Audit",
    status: "placeholder",
    notes: [
      "Rejected und Manual-Review-Pfade muessen nachvollziehbar bleiben.",
      "Client darf keine Audit- oder Reward-Ledger-Events selbst erzeugen.",
    ],
  },
];

export default function HistoryPage() {
  return (
    <PreparedMissionPage
      routeKey="history"
      title="History"
      subtitle="History ist als sichere Ereignis- und Anzeigeansicht vorbereitet. Abschluesse, Side Quests und Reviews werden spaeter nur nach Serverentscheidung sichtbar."
      cards={historyCards}
      detailTitle="History als Anzeige- und Auditpfad"
      detailBody="Diese Seite ist kein Reward-Ledger und keine Completion-Autoritaet. Sie zeigt spaeter nur serverseitig gepruefte Ereignisse."
    />
  );
}
