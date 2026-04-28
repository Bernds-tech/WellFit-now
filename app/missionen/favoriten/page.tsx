import PreparedMissionPage, { type PreparedMissionCard } from "../components/PreparedMissionPage";

const favoriteCards: PreparedMissionCard[] = [
  {
    id: "favorites-main",
    title: "Gemerkte Hauptmissionen",
    description: "Vorbereiteter Bereich fuer favorisierte Tagesmissionen, Wochenmissionen, Abenteuer, Challenges und Wettkaempfe.",
    icon: "⭐",
    categoryLabel: "favoriten · Anzeige",
    status: "placeholder",
    notes: [
      "Favoriten sind nur eine Merkliste und keine Mission-Freigabe.",
      "Startbare Eintraege brauchen spaeter approved Status und Serverpruefung.",
    ],
  },
  {
    id: "favorites-drafts",
    title: "Gespeicherte KI-Vorschlaege",
    description: "Vorbereiteter Bereich fuer Buddy-Vorschlaege, die spaeter nach Pruefung gemerkt werden koennen.",
    icon: "🤖",
    categoryLabel: "favoriten · KI",
    status: "placeholder",
    notes: [
      "KI-Vorschlaege sind keine fertigen Missionen.",
      "Nicht freigegebene Vorschlaege duerfen nicht als startbare Favoriten erscheinen.",
    ],
  },
  {
    id: "favorites-sidequests",
    title: "Wiederholbare Side Quests",
    description: "Vorbereiteter Bereich fuer AR-Buddy-Nebenmissionen, falls daraus spaeter wiederholbare Lern- oder Rallye-Aufgaben entstehen.",
    icon: "🧭",
    categoryLabel: "favoriten · Side Quest",
    status: "placeholder",
    notes: [
      "AR-Buddy-Nebenmissionen zaehlen nicht automatisch als Tages- oder Abenteuer-Mission.",
      "Favoriten bleiben Anzeige und Merkliste.",
    ],
  },
];

export default function FavoritenPage() {
  return (
    <PreparedMissionPage
      routeKey="favoriten"
      title="Favoriten"
      subtitle="Favoriten sind als sichere Anzeige vorbereitet. Sie merken Missionen oder gepruefte Vorschlaege vor, sind aber keine Quelle fuer Freigaben."
      cards={favoriteCards}
      detailTitle="Favoriten als Anzeige"
      detailBody="Diese Seite ist als Anzeige vorbereitet. Freigaben, Abschluesse und Buchungen folgen spaeter aus dem Serverpfad."
    />
  );
}
