import ProductModulePlaceholderPage from "@/app/components/ProductModulePlaceholderPage";

export default function AnalyticsPage() {
  return (
    <ProductModulePlaceholderPage
      eyebrow="Produktmodul"
      title="Analytics & Stats"
      subtitle="Analytics wird als sichere Auswertungsoberfläche vorbereitet. Gesundheits-, Kamera-, Pose-, Face- und Bewegungsdaten benötigen klare Zustimmung und Datenminimierung."
      status="Vorbereitet"
      cards={[
        {
          title: "Persönliche Statistik",
          body: "Später können Nutzer Fortschritt, Aktivität, Missionen, Streaks und interne Punkte nachvollziehen. Medizinische Diagnosen oder Therapieaussagen bleiben ausgeschlossen.",
        },
        {
          title: "Datenschutz zuerst",
          body: "Auswertungen müssen opt-in, minimiert und transparent sein. Sensible Rohdaten werden nicht automatisch für Forschung, Partner oder Werbung genutzt.",
        },
        {
          title: "Team- und Firmenberichte",
          body: "B2B-Analytics darf später nur aggregiert, anonymisiert und streng vom Arbeitgeberzugriff auf Einzelpersonen getrennt erfolgen.",
        },
        {
          title: "Nächste technische Stufe",
          body: "Analytics-Readmodels, Consent-Flags und sichere Aggregationspfade definieren, bevor echte Auswertungen produktiv erscheinen.",
        },
      ]}
    />
  );
}
