export const navItems = [
  ["So funktioniert’s", "#so-funktionierts"],
  ["Erlebnisse", "#erlebnisse"],
  ["Dein Buddy", "#buddy"],
  ["Für wen", "#fuer-wen"],
  ["Sicherheit", "#sicherheit"],
  ["Über uns", "#ueber-uns"],
] as const;

export const featureCards = [
  {
    title: "Bewege dich im Alltag",
    text: "Kleine Schritte, große Wirkung. Verfolge deine Aktivität und bleib motiviert.",
    image: "/landing/feature-movement.svg",
    icon: "↗",
    href: "#so-funktionierts",
    tone: "cyan",
  },
  {
    title: "Sammle WFXP",
    text: "Missionen und Ziele belohnen dich und deinen Buddy mit sichtbarem Fortschritt.",
    image: "/landing/feature-wfxp.svg",
    icon: "W",
    href: "#so-funktionierts",
    tone: "amber",
  },
  {
    title: "Pflege deinen Buddy",
    text: "Füttern, trainieren und spielen – wie bei einem Tamagotchi.",
    image: "/landing/feature-buddy-care.svg",
    icon: "♥",
    href: "#buddy",
    tone: "lime",
  },
  {
    title: "Erlebe echte Missionen",
    text: "Deine Umgebung wird zum Spielfeld. Entdecke Neues und wachse über dich hinaus.",
    image: "/landing/feature-missions.svg",
    icon: "⌖",
    href: "#erlebnisse",
    tone: "orange",
  },
] as const;

export const highlights = [
  ["♥", "Buddy wie ein Tamagotchi", "Wächst mit dir und feiert deine Erfolge.", "cyan"],
  ["W", "Bürgermeister & Community", "Geplante Stadtaktionen und gemeinsame Events.", "amber"],
  ["◎", "Familienfreundlich", "Für Groß & Klein, Freunde und Familien.", "lime"],
  ["◇", "Sichere Daten", "DSGVO-orientiert, transparent und kontrollierbar.", "cyan"],
] as const;

export const steps = [
  ["1", "Registrieren", "Kostenlos anmelden und deinen ersten Buddy erhalten.", "▣"],
  ["2", "Bewegen", "Schritte sammeln, Aktivitäten tracken und Ziele erreichen.", "↗"],
  ["3", "Missionen entdecken", "Spannende Aufgaben in deiner Umgebung finden.", "⌖"],
  ["4", "WFXP sammeln", "Missionen abschließen und Fortschritt verdienen.", "W"],
  ["5", "Buddy stärken", "Pflegen, entwickeln und gemeinsam wachsen.", "♥"],
] as const;

export const experiences = [
  ["⌂", "Stadt-Abenteuer", "Historische Orte, Street Art und versteckte Ecken entdecken."],
  ["△", "Natur & Outdoor", "Wälder, Seen, Berge und aktive Entdeckungsrouten erleben."],
  ["●", "Familienmissionen", "Gemeinsame Aufgaben und Abenteuer für Groß und Klein."],
  ["⌁", "Fitness-Challenges", "Schrittziele, Workouts und sanfte Bewegungsimpulse."],
  ["✚", "Community-Aktionen", "Gemeinsame Ziele und saisonale Missionen mit anderen."],
  ["♛", "Bürgermeister-System", "Roadmap-Vorschau für lokale Aktionen und Checkpoints."],
] as const;

export const audiences = [
  ["01", "Einzelpersonen", "Sanft starten, motiviert bleiben und Fortschritt sichtbar machen."],
  ["02", "Familien", "Gemeinsame Bewegung in kleine, positive Erlebnisse verwandeln."],
  ["03", "Kinder & Eltern", "Geplante altersgerechte Inhalte mit kontrollierten Familienfunktionen."],
  ["04", "Freunde", "Challenges, gemeinsame Ziele und echte Erlebnisse miteinander teilen."],
  ["05", "Schulen & Vereine", "Bewegung, Lernen und Gemeinschaft sinnvoll verbinden."],
  ["06", "Unternehmen & Städte", "Aktive Teams und lokale Communities mit gemeinsamen Impulsen."],
] as const;

export const safetyCards = [
  ["◇", "Datenschutz & Kontrolle", "Datenminimierung, transparente Verarbeitung und klare Rechte."],
  ["▣", "Sichere Konten", "Geschützte Anmeldung und nachvollziehbare Berechtigungen."],
  ["◎", "Familienfunktionen geplant", "Freigabe erst nach technischer und inhaltlicher Prüfung."],
  ["✦", "Faire Community geplant", "Öffentliche Funktionen erst mit Moderation und Schutzkonzept."],
] as const;
