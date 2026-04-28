import PreparedMissionPage, { type PreparedMissionCard } from "../components/PreparedMissionPage";

const dailyCards: PreparedMissionCard[] = [
  {
    id: "daily-short-move-template",
    title: "Kurze Tagesbewegung",
    description: "Vorbereiteter Container für kurze, altersgerechte Tagesziele mit späterer Evidence- und Safety-Prüfung.",
    icon: "👟",
    categoryLabel: "daily · max. Tagesauswahl später",
    status: "placeholder",
    notes: [
      "Tagesmissionen bleiben als Game-Loop-Prototyp wichtig, aber echte Punkte/XP/Rewards dürfen nicht clientseitig entstehen.",
      "Spätere Auswahlgrenzen, z. B. maximal 3 aktive Tagesmissionen, müssen serverseitig abgesichert werden.",
    ],
  },
  {
    id: "daily-knowledge-template",
    title: "Tägliche Wissensfrage",
    description: "Vorbereiteter Container für KI-generierte Quiz-, Natur-, Kultur- oder Ernährungsfragen.",
    icon: "🧠",
    categoryLabel: "daily · Lernen",
    status: "placeholder",
    notes: [
      "Der KI-Buddy darf Fragen vorschlagen, aber keine Mission final freigeben.",
      "Antworten sind später Evidence und werden durch Server/Policy bewertet.",
    ],
  },
  {
    id: "daily-buddy-sidequest-template",
    title: "Buddy-Nebenhinweis",
    description: "Vorbereiteter Container für spontane AR-Buddy-Nebenmissionen wie Blatt, Objekt oder Ort erkennen.",
    icon: "🔥",
    categoryLabel: "arSideQuest · zählt nicht automatisch als Tagesmission",
    status: "placeholder",
    notes: [
      "AR-Buddy-Nebenmissionen zählen nicht automatisch gegen Tagesmissionen.",
      "Side Quests dürfen in History erscheinen, aber nicht automatisch Tagesmissionen abschließen.",
    ],
  },
  {
    id: "daily-social-template",
    title: "Soziale Tagesaktion",
    description: "Vorbereiteter Container für kleine Community-, Familien- oder Hilfsaktionen ohne Drucksprache.",
    icon: "🤝",
    categoryLabel: "daily · Social",
    status: "placeholder",
    notes: [
      "Soziale Aktionen brauchen faire Privacy-, Safety- und Altersregeln.",
      "Belohnung und Completion bleiben serverseitig und auditierbar.",
    ],
  },
];

export default function MissionenPage() {
  return (
    <PreparedMissionPage
      routeKey="tagesmissionen"
      title="Tagesmissionen"
      subtitle="Tagesmissionen sind als sichere Container vorbereitet. Echte Tagesmissionen werden später vom KI-Buddy erzeugt, durch Server/Policy geprüft und erst dann sichtbar oder aktiv."
      cards={dailyCards}
      detailTitle="Tagesmissionen ohne Client-Rewards"
      detailBody="Diese Seite schreibt keine Punkte, XP, Rewards, Completion oder Buddy-Ledger mehr im Client. Der spätere Pfad bleibt: KI-Draft, Serverfreigabe, Evidence, Reward-Policy, Server-Ledger."
    />
  );
}
