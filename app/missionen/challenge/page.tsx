import PreparedMissionPage, { type PreparedMissionCard } from "../components/PreparedMissionPage";

const challengeCards: PreparedMissionCard[] = [
  {
    id: "challenge-sponsored-template",
    title: "Gesponserte Partner-Challenge",
    description: "Vorbereiteter Container für Adidas-, Stadt-, Firmen- oder Marken-Challenges mit späterer Inhalts- und Reward-Prüfung.",
    icon: "🏷️",
    categoryLabel: "challenge · Partner",
    status: "placeholder",
    notes: [
      "Partner dürfen Challenges vorschlagen, aber nicht direkt aktivieren.",
      "Branding, Alter, Radius, Sicherheit und Reward-Preview brauchen Server-/Policy-Freigabe.",
    ],
  },
  {
    id: "challenge-fitness-template",
    title: "Fitness- / Bewegungs-Challenge",
    description: "Vorbereiteter Container für Balance, Plank, Sprint, Yoga oder kleine Bewegungsaufgaben mit Evidence-Pfad.",
    icon: "🏃",
    categoryLabel: "challenge · Bewegung",
    status: "placeholder",
    notes: [
      "Bewegungsdaten sind Evidence, aber keine Client-Autorität.",
      "Anti-Cheat, Proof-Qualität und Caps werden später serverseitig bewertet.",
    ],
  },
  {
    id: "challenge-knowledge-template",
    title: "Wissens- / Rätsel-Challenge",
    description: "Vorbereiteter Container für Mathe-Speed, Quiz, Reaktions- oder Logikaufgaben aus der KI-Mission-Engine.",
    icon: "🧠",
    categoryLabel: "challenge · Wissen",
    status: "placeholder",
    notes: [
      "KI kann Fragen und Antwortoptionen vorschlagen.",
      "Nur approved Drafts dürfen später als Challenge sichtbar werden.",
    ],
  },
  {
    id: "challenge-wellness-template",
    title: "Wellness- / Mindset-Challenge",
    description: "Vorbereiteter Container für ruhige, gesunde und nicht beschämende Routinen mit positiven Buddy-Hinweisen.",
    icon: "🧘",
    categoryLabel: "challenge · Wellness",
    status: "placeholder",
    notes: [
      "Keine medizinischen Diagnosen und keine harte Drucksprache.",
      "Completion und History folgen später nur über Serverentscheidung.",
    ],
  },
];

export default function ChallengePage() {
  return (
    <PreparedMissionPage
      routeKey="challenge"
      title="Challenge"
      subtitle="Challenge-Container sind für Partner, Bewegung, Wissen und Wellness vorbereitet. Echte Challenges werden später geprüft, freigegeben und serverseitig bewertet."
      cards={challengeCards}
      detailTitle="Challenges als sichere Draft-Container"
      detailBody="Diese Seite startet keine Route, schreibt keine Rewards und speichert keine Completion im Client. Sie bereitet nur die UI-Struktur für spätere KI- und Partner-Challenges vor."
    />
  );
}
