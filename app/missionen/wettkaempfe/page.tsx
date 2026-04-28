import PreparedMissionPage, { type PreparedMissionCard } from "../components/PreparedMissionPage";

const competitionCards: PreparedMissionCard[] = [
  {
    id: "competition-user-duel-template",
    title: "Nutzer gegen Nutzer",
    description: "Vorbereiteter Container für Mathe-, Fitness-, Reaktions- oder Checkpoint-Duelle zwischen Nutzern.",
    icon: "⚔️",
    categoryLabel: "competition · PvP",
    status: "placeholder",
    notes: [
      "Wettkampf-Sieger dürfen niemals clientseitig bestimmt werden.",
      "Einsätze, Pot, Gebühren, Jackpot und Burn-Äquivalente brauchen später Server-/Ledger-Autorität.",
    ],
  },
  {
    id: "competition-avatar-arena-template",
    title: "Avatar gegen Avatar",
    description: "Vorbereiteter Container für Buddy-/Avatar-Arena mit Level, Fähigkeiten, Ausrüstung und Fairness-Logik.",
    icon: "🐉",
    categoryLabel: "competition · Avatar",
    status: "placeholder",
    notes: [
      "Buddy-Level kann später Matchmaking und Einsatzlimits beeinflussen, aber nicht im Client autorisieren.",
      "Anti-Cheat, Gewinnerentscheidung und Reward-Verteilung bleiben serverseitig.",
    ],
  },
  {
    id: "competition-weekly-race-template",
    title: "Wochenrennen",
    description: "Vorbereiteter Container für Wettbewerbe über eine ganze Woche, z. B. wer eine Wochenaufgabe zuerst erfüllt.",
    icon: "🏁",
    categoryLabel: "competition · Woche",
    status: "placeholder",
    notes: [
      "Wochenrennen benötigen serverseitige Zeit-, Evidence- und Fairness-Prüfung.",
      "History-Einträge entstehen erst nach geprüfter Wettkampfentscheidung.",
    ],
  },
  {
    id: "competition-spectator-template",
    title: "Zuschauen / Mitfiebern",
    description: "Vorbereiteter Container für spätere Zuschauer- und Community-Funktionen ohne clientseitige Wett- oder Reward-Autorität.",
    icon: "👀",
    categoryLabel: "competition · Social",
    status: "placeholder",
    notes: [
      "Mitwetten oder Einsätze sind rechtlich und technisch später separat zu prüfen.",
      "Mobile bleibt frei von Token-, Trading-, Presale- und NFT-Marktplatz-Funktionen.",
    ],
  },
];

export default function WettkaempfePage() {
  return (
    <PreparedMissionPage
      routeKey="wettkaempfe"
      title="Wettkämpfe"
      subtitle="Wettkämpfe sind als sichere Container vorbereitet. Nutzerduelle, Avatar-Arena, Wochenrennen und Zuschauerfunktionen brauchen später Fairness-, Anti-Cheat- und Server-Ledger-Logik."
      cards={competitionCards}
      detailTitle="Wettkämpfe ohne Client-Autorität"
      detailBody="Diese Seite enthält keine lokale Einsatz-, Jackpot-, Burn-, Sieger- oder Reward-Logik mehr. Alle wirtschaftlichen und kompetitiven Entscheidungen bleiben später serverseitig."
    />
  );
}
