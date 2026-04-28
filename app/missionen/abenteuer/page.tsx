import PreparedMissionPage, { type PreparedMissionCard } from "../components/PreparedMissionPage";

const adventureCards: PreparedMissionCard[] = [
  {
    id: "adventure-zoo-template",
    title: "Zoo- / Tierpark-Abenteuer",
    description: "Vorbereiteter Container für ortsbasierte Tierpark-Rallyes, QR-/AR-Hinweise und kindgerechte Wissensfragen.",
    icon: "🦁",
    categoryLabel: "adventure · Ort / AR",
    status: "placeholder",
    notes: [
      "Abenteuer brauchen später sichere Orts-/Radius-/Altersprüfung.",
      "Partner- oder Zoo-Inhalte werden nicht direkt produktiv, sondern durch Server/Policy geprüft.",
    ],
  },
  {
    id: "adventure-museum-template",
    title: "Museum- / Kultur-Rallye",
    description: "Vorbereiteter Container für Museumsfragen, Artefakt-Suche, Audioguide-Routen und KI-Buddy-Hinweise.",
    icon: "🏛️",
    categoryLabel: "adventure · Lernen",
    status: "placeholder",
    notes: [
      "Der KI-Buddy kann Rätsel und Hinweise vorschlagen.",
      "Completion entsteht später nur durch Evidence und serverseitige Auswertung.",
    ],
  },
  {
    id: "adventure-castle-template",
    title: "Burg- / Schwert-Abenteuer",
    description: "Vorbereiteter Container für Fantasy-AR, Schatzsuche, Schwert-Finden und Buddy-geführte Rätselketten.",
    icon: "🏰",
    categoryLabel: "adventure · Fantasy",
    status: "placeholder",
    notes: [
      "Keine lokalen Reise- oder WFT-Kosten mehr im Client.",
      "Item-Bedarf darf später keine Paywall-Kette erzeugen; faire Nebenwege bleiben Pflicht.",
    ],
  },
  {
    id: "adventure-city-template",
    title: "Stadt- / Park-Abenteuer",
    description: "Vorbereiteter Container für Stadtpfade, sichere Checkpoints, Bewegung und lokale Lernaufgaben.",
    icon: "🌳",
    categoryLabel: "adventure · Outdoor",
    status: "placeholder",
    notes: [
      "AR-Buddy-Nebenmissionen können hier inspirieren, zählen aber nicht automatisch als Abenteuer.",
      "Rewards werden erst nach Serverprüfung sichtbar oder gebucht.",
    ],
  },
];

export default function AbenteuerPage() {
  return (
    <PreparedMissionPage
      routeKey="abenteuer"
      title="Abenteuer"
      subtitle="Abenteuerbereiche sind vorbereitet für Zoo, Museum, Burg, Park und Stadt. Echte Abenteuer entstehen später aus KI-Drafts, Partnerfreigabe und serverseitiger Safety-Prüfung."
      cards={adventureCards}
      detailTitle="Abenteuer als KI- und AR-Container"
      detailBody="Diese Seite enthält keine lokale WFT-Reise-, Reward- oder Completion-Logik mehr. Sie zeigt nur sichere Vorlagen für spätere geprüfte Abenteuer."
    />
  );
}
