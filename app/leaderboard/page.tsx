import ProductModulePlaceholderPage from "@/app/components/ProductModulePlaceholderPage";

export default function LeaderboardPage() {
  return (
    <ProductModulePlaceholderPage
      eyebrow="Produktmodul"
      title="Leaderboard"
      subtitle="Ranglisten werden als MVP-Modul vorbereitet, aber Wertungen bleiben später serverseitig geprüft. Clientdaten dürfen keine finale Platzierung oder Punktewertung autorisieren."
      status="Vorbereitet"
      cards={[
        {
          title: "Faire Ranglisten",
          body: "Später werden Tages-, Wochen-, Freunde-, Team- und Firmenranglisten möglich. Grundlage müssen validierte Missionen, Anti-Cheat und sichere History-Daten sein.",
        },
        {
          title: "Anti-Farming zuerst",
          body: "Leaderboard-Scores dürfen erst produktiv werden, wenn Pattern-, Cooldown-, Evidence- und Mission-Completion-Prüfungen angebunden sind.",
        },
        {
          title: "Privatsphäre",
          body: "Sichtbarkeit muss an Profileinstellungen, Minderjährigenmodus, Teamkontext und Datenschutz gekoppelt werden.",
        },
        {
          title: "Nächste technische Stufe",
          body: "Serverseitige Score-Snapshots und auditierbare Ranking-Events planen, ohne clientseitige Score-Autorität.",
        },
      ]}
    />
  );
}
