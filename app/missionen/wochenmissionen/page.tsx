import PreparedMissionPage, { type PreparedMissionCard } from "../components/PreparedMissionPage";

const weeklyCards: PreparedMissionCard[] = [
  {
    id: "weekly-steps-template",
    title: "Wöchentliche Bewegungsmission",
    description: "Vorbereiteter Container für Wochenziele wie 90.000 bis 100.000 valide Bewegungspunkte oder KI-validierte Aktivitätsnachweise.",
    icon: "👟",
    categoryLabel: "weekly · Platzhalter",
    status: "placeholder",
    notes: [
      "Wochenmissionen laufen über mehrere Tage und brauchen später serverseitige Evidence-Auswertung.",
      "Keine lokale WFT-/XP-/Punktevergabe. Fortschritt wird später über Server/Policy geprüft.",
    ],
  },
  {
    id: "weekly-learning-template",
    title: "Wöchentliche Wissensmission",
    description: "Vorbereiteter Container für KI-generierte Lernpfade, Quiz-Serien oder Museums-/Natur-Wissensaufgaben über eine Woche.",
    icon: "🧠",
    categoryLabel: "weekly · KI-Draft später",
    status: "placeholder",
    notes: [
      "Der KI-Buddy darf Themen und Fragen vorschlagen, aber keine Mission final freigeben.",
      "Freigabe, Reward-Preview und Completion bleiben serverseitig.",
    ],
  },
  {
    id: "weekly-family-template",
    title: "Wochen-Teammission",
    description: "Vorbereiteter Container für Familien-, Firmen- oder Gruppenaufgaben mit gemeinsamer Evidence und späterer Serverprüfung.",
    icon: "🤝",
    categoryLabel: "weekly · Team",
    status: "placeholder",
    notes: [
      "Teamfortschritt darf nicht clientseitig als abgeschlossen gelten.",
      "History-Einträge entstehen später nach Serverentscheidung.",
    ],
  },
];

export default function WochenmissionenPage() {
  return (
    <PreparedMissionPage
      routeKey="wochenmissionen"
      title="Wochenmissionen"
      subtitle="Wöchentliche Missionscontainer sind vorbereitet. Echte Wochenmissionen werden später vom KI-Buddy vorgeschlagen und durch Server/Policy freigegeben."
      cards={weeklyCards}
      detailTitle="Wochenmissionen als sichere KI-Container"
      detailBody="Diese Seite zeigt nur vorbereitete Wochenmissions-Typen. Start, Completion, Punkte, XP und Rewards werden nicht im Client autorisiert."
    />
  );
}
