import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LandingSessionRedirect from "./components/landing/LandingSessionRedirect";

export const metadata: Metadata = {
  title: "WellFit – Bewegung wird zum Abenteuer",
  description:
    "WellFit verbindet Bewegung, reale Missionen, WFXP, einen persönlichen Buddy und gemeinschaftliche Erlebnisse.",
};

const navItems = [
  ["So funktioniert’s", "#so-funktionierts"],
  ["Erlebnisse", "#erlebnisse"],
  ["Dein Buddy", "#buddy"],
  ["Für wen", "#fuer-wen"],
  ["Sicherheit", "#sicherheit"],
  ["Über uns", "#ueber-uns"],
] as const;

const featureCards = [
  {
    title: "Bewege dich im Alltag",
    text: "Schritte, Wege und kleine Aktivitäten werden zu sichtbarem Fortschritt.",
    image: "/landing/feature-movement.svg",
    icon: "↗",
    href: "#so-funktionierts",
    accent: "text-cyan-200",
  },
  {
    title: "Sammle WFXP",
    text: "Missionen und erreichte Ziele belohnen dich und deinen Buddy.",
    image: "/landing/feature-wfxp.svg",
    icon: "W",
    href: "#so-funktionierts",
    accent: "text-amber-200",
  },
  {
    title: "Pflege deinen Buddy",
    text: "Füttern, pflegen und trainieren – wie bei einem Tamagotchi.",
    image: "/landing/feature-buddy-care.svg",
    icon: "♥",
    href: "#buddy",
    accent: "text-lime-200",
  },
  {
    title: "Erlebe echte Missionen",
    text: "Deine Umgebung wird zum Spielfeld für neue Abenteuer.",
    image: "/landing/feature-missions.svg",
    icon: "⌖",
    href: "#erlebnisse",
    accent: "text-orange-200",
  },
] as const;

const highlights = [
  {
    title: "Buddy wie ein Tamagotchi",
    text: "Ein emotionaler Begleiter, der auf Bewegung, Pflege und regelmäßige Aufmerksamkeit reagiert.",
    image: "/landing/feature-buddy-care.svg",
    icon: "♥",
    accent: "text-cyan-200",
  },
  {
    title: "Bürgermeister & Community",
    text: "Geplante Stadtaktionen, lokale Checkpoints und gemeinsame Ziele werden Teil der WellFit-Welt.",
    image: "/landing/feature-missions.svg",
    icon: "♛",
    accent: "text-amber-200",
  },
  {
    title: "Für viele Lebenslagen",
    text: "Allein, mit Freunden oder als Familie – mit verständlichen Zielen und passender Intensität.",
    image: "/landing/feature-movement.svg",
    icon: "◎",
    accent: "text-lime-200",
  },
  {
    title: "Sichere Daten",
    text: "Datenminimierung, transparente Einwilligungen und klare Kontrolle über persönliche Angaben.",
    image: "/landing/feature-wfxp.svg",
    icon: "◇",
    accent: "text-cyan-200",
  },
] as const;

const steps = [
  ["01", "Bewegen", "Alltagsbewegung und Aktivitäten werden zu Fortschritt.", "↗"],
  ["02", "Entdecken", "Missionen machen reale Orte und neue Wege spielbar.", "⌖"],
  ["03", "Sammeln", "Erfolge bringen WFXP und neue Fortschrittsstufen.", "W"],
  ["04", "Pflegen", "Dein Buddy braucht Aufmerksamkeit, Energie und Training.", "♥"],
  ["05", "Freischalten", "Neue Fähigkeiten, Outfits und Erlebnisse werden zugänglich.", "✦"],
] as const;

const experiences = [
  ["⌂", "Stadt-Abenteuer", "Historische Orte, Street Art und versteckte Ecken entdecken."],
  ["△", "Natur & Outdoor", "Wälder, Seen, Berge und aktive Entdeckungsrouten erleben."],
  ["●", "Familienmissionen", "Gemeinsame Aufgaben und Abenteuer für Groß und Klein."],
  ["⌁", "Fitness-Challenges", "Schrittziele, Workouts und sanfte Bewegungsimpulse."],
  ["✚", "Community-Aktionen", "Gemeinsame Ziele und saisonale Missionen mit anderen."],
  ["♛", "Bürgermeister-System", "Roadmap-Vorschau für lokale Aktionen, Hinweise und Checkpoints."],
] as const;

const audiences = [
  ["01", "Einzelpersonen", "Sanft starten, motiviert bleiben und Fortschritt sichtbar machen."],
  ["02", "Familien", "Gemeinsame Bewegung in kleine, positive Erlebnisse verwandeln."],
  ["03", "Kinder & Eltern", "Geplante altersgerechte Inhalte mit kontrollierten Familienfunktionen."],
  ["04", "Freunde", "Challenges, gemeinsame Ziele und echte Erlebnisse miteinander teilen."],
  ["05", "Schulen & Vereine", "Bewegung, Lernen und Gemeinschaft sinnvoll verbinden."],
  ["06", "Unternehmen & Städte", "Aktive Teams und lokale Communities mit gemeinsamen Impulsen."],
] as const;

const safetyCards = [
  ["◇", "Datenschutz & DSGVO", "Datenminimierung, transparente Verarbeitung und klare Rechte."],
  ["▣", "Sichere Konten", "Geschützte Anmeldung und nachvollziehbare Berechtigungen."],
  ["◎", "Familienfunktionen geplant", "Kinderprofile und Elternkontrollen werden erst nach Prüfung freigegeben."],
  ["✦", "Faire Community geplant", "Öffentliche soziale Funktionen bleiben bis zur Moderationsfreigabe deaktiviert."],
] as const;

function PhonePreview() {
  return (
    <div className="relative mx-auto w-[210px] rotate-[1.5deg] rounded-[32px] border-[6px] border-[#17272c] bg-[#020608] p-2 shadow-[0_30px_90px_rgba(0,0,0,.58)] sm:w-[250px] xl:w-[270px]">
      <div className="absolute left-1/2 top-3 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
      <div className="overflow-hidden rounded-[24px] border border-cyan-300/15 bg-[linear-gradient(180deg,#07363d,#03181d)] px-4 pb-4 pt-9">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-cyan-100/60">Hallo, Alex!</p>
            <p className="mt-1 text-2xl font-extrabold text-[#ffd95d]">
              1.250 <span className="text-sm text-white">WFXP</span>
            </p>
          </div>
          <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-1 text-[9px] font-semibold text-cyan-100">
            LV 12
          </span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-white/10">
          <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-300 via-lime-300 to-[#ffd95d]" />
        </div>
        <div className="mt-4 rounded-xl border border-cyan-300/15 bg-black/25 p-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-cyan-300">Aktive Mission</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold">Waldpfad-Entdecker</p>
              <p className="text-[9px] text-white/45">3 versteckte Orte</p>
            </div>
            <strong className="text-[10px] text-[#ffd95d]">2/3</strong>
          </div>
          <div className="mt-2 h-1 rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-lime-300" />
          </div>
          <p className="mt-2 text-[9px] font-bold text-[#ffae2f]">+250 WFXP</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
          {[["7.842", "Schritte"], ["487", "kcal"], ["5,3", "km"]].map(([value, label]) => (
            <div key={label} className="rounded-lg bg-white/[0.045] py-2.5">
              <p className="text-xs font-bold">{value}</p>
              <p className="text-[8px] text-white/40">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-lime-300/15 bg-lime-300/[0.05] p-2.5">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-cyan-300/10">
            <Image src="/buddy/luma.png" alt="Luma" fill sizes="44px" className="object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[8px] text-white/40">Dein Buddy</p>
            <p className="text-xs font-bold">Luma</p>
            <div className="mt-1 h-1 rounded-full bg-white/10">
              <div className="h-full w-3/5 rounded-full bg-[#ffd95d]" />
            </div>
          </div>
          <span className="text-sm text-[#ff9c28]">♥</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-white/5 pt-2.5 text-[7px] text-white/32">
          <span>Entdecken</span><span>Missionen</span><span>Buddy</span><span>Fortschritt</span><span>Profil</span>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center lg:mb-14">
      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#ffd95d]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] text-white sm:text-4xl lg:text-[46px]">{title}</h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-cyan-50/65 sm:text-base">{text}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="landing-page h-screen overflow-y-auto scroll-smooth bg-[#020c10] text-white">
      <LandingSessionRedirect />

      <header className="sticky top-0 z-50 border-b border-white/8 bg-[#020d12]/90 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-5 px-5 py-2 lg:px-10">
          <Link href="/" aria-label="WellFit Startseite" className="relative h-16 w-28 shrink-0 sm:h-[72px] sm:w-32">
            <Image src="/logo.png" alt="WellFit" fill priority sizes="128px" className="object-contain object-left" />
          </Link>
          <nav aria-label="Hauptnavigation" className="hidden items-center gap-6 xl:flex">
            {navItems.map(([label, href]) => (
              <a key={href} href={href} className="text-[13px] font-medium text-white/68 transition hover:text-white">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-lg border border-white/10 px-3 py-2 text-xs text-white/55 sm:block">DE</span>
            <Link href="/login" className="rounded-lg border border-cyan-300/35 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/8">
              Anmelden
            </Link>
            <Link href="/register" className="hidden rounded-lg bg-gradient-to-r from-[#ff8c1d] to-[#ffd95d] px-5 py-2.5 text-sm font-bold text-[#1b2006] shadow-[0_12px_28px_rgba(255,153,30,.2)] transition hover:-translate-y-0.5 sm:block">
              Kostenlos starten
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-white/8">
        <Image src="/landing/hero-world.svg" alt="WellFit Abenteuerwelt" fill priority sizes="100vw" className="-z-30 object-cover object-center" />
        <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(2,13,18,.98)_0%,rgba(2,19,24,.88)_38%,rgba(2,20,25,.28)_70%,rgba(2,12,16,.45)_100%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-[#020c10]/90" />

        <div className="mx-auto grid min-h-[650px] max-w-[1440px] items-center gap-8 px-5 py-14 lg:grid-cols-[.92fr_1.08fr] lg:px-10 lg:py-16">
          <div className="relative z-20 max-w-[700px]">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-300/22 bg-[#06262d]/72 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-200 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ffd95d] shadow-[0_0_12px_#ffd95d]" /> Move · Learn · Earn
            </div>
            <h1 className="mt-6 text-[42px] font-extrabold leading-[1.03] tracking-[-0.045em] text-white sm:text-[54px] xl:text-[64px]">
              Willkommen bei WellFit.<br />Dein Abenteuer für <span className="bg-gradient-to-r from-[#f3e75a] via-[#ffb224] to-[#ff7d16] bg-clip-text text-transparent">Körper & Geist.</span>
            </h1>
            <div className="mt-5 h-1 w-44 rounded-full bg-gradient-to-r from-cyan-300 via-[#ffd95d] to-[#ff7d16]" />
            <p className="mt-6 max-w-xl text-base leading-7 text-cyan-50/78 sm:text-lg">
              Bewege dich im Alltag, entdecke Missionen, sammle WFXP und entwickle deinen persönlichen Buddy – allein oder gemeinsam.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="rounded-xl bg-gradient-to-r from-[#ff8418] to-[#ffd95d] px-6 py-3.5 text-center text-base font-bold text-[#1d2206] shadow-[0_16px_40px_rgba(255,139,24,.26)] transition hover:-translate-y-0.5">
                Jetzt kostenlos starten →
              </Link>
              <a href="#so-funktionierts" className="rounded-xl border border-cyan-300/42 bg-[#06252d]/64 px-6 py-3.5 text-center text-base font-semibold text-cyan-50 backdrop-blur transition hover:bg-cyan-300/10">
                ▶ So funktioniert’s
              </a>
            </div>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-cyan-300/14 bg-black/18 p-3 backdrop-blur-sm">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-cyan-300/24 bg-cyan-300/8 text-cyan-200">◇</span>
                <div><p className="text-sm font-semibold text-cyan-100">Sicher & transparent</p><p className="text-xs text-white/45">Klare Kontrolle und verständliche Grenzen.</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-[#ffd95d]/14 bg-black/18 p-3 backdrop-blur-sm">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-[#ffd95d]/24 bg-[#ffd95d]/8 text-[#ffd95d]">◎</span>
                <div><p className="text-sm font-semibold text-[#ffe36c]">Für viele Lebenslagen</p><p className="text-xs text-white/45">Allein, mit Freunden oder Familie.</p></div>
              </div>
            </div>
          </div>

          <div className="relative z-10 min-h-[500px] lg:min-h-[570px]">
            <div className="absolute inset-x-10 bottom-8 top-14 rounded-[45%] bg-cyan-300/10 blur-3xl" />
            <div className="absolute bottom-10 left-[2%] z-20 w-[42%] sm:left-[8%] lg:left-[3%] xl:left-[8%]">
              <PhonePreview />
            </div>
            <div className="absolute bottom-0 right-[-2%] z-10 h-[440px] w-[58%] sm:h-[500px] lg:h-[540px] xl:right-[1%]">
              <Image src="/buddy/luma.png" alt="Luma, der WellFit Buddy" fill priority sizes="(max-width: 1024px) 46vw, 500px" className="object-contain object-bottom drop-shadow-[0_32px_52px_rgba(0,0,0,.5)]" />
            </div>
            <div className="absolute right-[2%] top-[15%] z-30 hidden rounded-2xl border border-[#ffd95d]/20 bg-[#071d20]/76 px-4 py-3 backdrop-blur-md sm:block">
              <p className="text-[10px] uppercase tracking-[.18em] text-white/45">Buddy Status</p>
              <div className="mt-2 flex gap-4 text-xs"><span className="text-lime-200">Energie 78%</span><span className="text-[#ffd95d]">Stimmung gut</span></div>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1440px] gap-3 px-5 pb-12 md:grid-cols-2 xl:grid-cols-4 lg:px-10">
          {featureCards.map((card) => (
            <article key={card.title} className="group relative min-h-[225px] overflow-hidden rounded-2xl border border-white/12 bg-[#04161b] shadow-[0_18px_50px_rgba(0,0,0,.28)] transition hover:-translate-y-1 hover:border-white/24">
              <Image src={card.image} alt="" fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#020b0f] via-[#031318]/78 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                <span className={`grid h-10 w-10 place-items-center rounded-full border border-white/14 bg-black/28 text-sm font-bold backdrop-blur ${card.accent}`}>{card.icon}</span>
                <h2 className="mt-4 text-xl font-semibold text-white">{card.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/62">{card.text}</p>
                <a href={card.href} className="mt-4 inline-flex text-xs font-semibold text-[#ffd95d]">Mehr erfahren ›</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-white/8 bg-[#020f14] px-5 py-14 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div><p className="text-[11px] font-semibold uppercase tracking-[.24em] text-cyan-300">Mehr als eine Fitness-App</p><h2 className="mt-2 text-3xl font-extrabold tracking-[-.03em] sm:text-4xl">Was WellFit <span className="text-[#ff9b25]">besonders</span> macht</h2></div>
            <p className="max-w-xl text-sm leading-6 text-white/52">Bewegung, Spielwelt, Buddy und Community greifen zu einem Erlebnis zusammen, das langfristig motivieren soll.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map((item) => (
              <article key={item.title} className="group overflow-hidden rounded-2xl border border-cyan-300/12 bg-[#06242b]/62">
                <div className="relative h-36 overflow-hidden">
                  <Image src={item.image} alt="" fill sizes="(max-width: 768px) 100vw, 25vw" className="object-cover opacity-72 transition duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#06242b] to-transparent" />
                  <span className={`absolute bottom-3 left-4 grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-[#020d12]/76 text-sm font-bold backdrop-blur ${item.accent}`}>{item.icon}</span>
                </div>
                <div className="p-5"><h3 className={`text-lg font-semibold ${item.accent}`}>{item.title}</h3><p className="mt-2 text-sm leading-6 text-white/56">{item.text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="so-funktionierts" className="relative overflow-hidden bg-[#03181f] px-5 py-20 lg:px-10">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_15%_20%,#00d9d0_0,transparent_26%),radial-gradient(circle_at_84%_65%,#ff9b25_0,transparent_22%)]" />
        <div className="relative mx-auto max-w-[1440px]">
          <SectionHeading eyebrow="Einfach starten" title="So wird Alltag zu Fortschritt" text="WellFit verbindet Bewegung, reale Missionen, Buddy-Pflege und Belohnungen in einem verständlichen Kreislauf." />
          <div className="relative grid gap-4 lg:grid-cols-5">
            <div className="absolute left-[8%] right-[8%] top-11 hidden h-px bg-gradient-to-r from-transparent via-cyan-300/35 to-transparent lg:block" />
            {steps.map(([number, title, text, icon]) => (
              <article key={number} className="relative rounded-2xl border border-cyan-300/12 bg-[#041d24]/82 p-5 backdrop-blur">
                <div className="flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.22em] text-cyan-300">{number}</span><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#ffd95d]/20 bg-[#ffd95d]/8 text-sm font-semibold text-[#ffd95d]">{icon}</span></div>
                <h3 className="mt-6 text-lg font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/54">{text}</p>
              </article>
            ))}
          </div>
          <div className="mt-8 grid overflow-hidden rounded-3xl border border-[#ffd95d]/18 bg-[#061f25] lg:grid-cols-[1.05fr_.95fr]">
            <div className="relative min-h-[310px]">
              <Image src="/landing/feature-missions.svg" alt="Geplante Stadt- und Community-Missionen" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#061f25]/36" />
            </div>
            <div className="flex flex-col justify-center p-7 lg:p-10"><p className="text-[11px] font-semibold uppercase tracking-[.24em] text-[#ffd95d]">Roadmap-Vorschau</p><h3 className="mt-3 text-2xl font-bold sm:text-3xl">Der Bürgermeister verbindet Stadt und Community.</h3><p className="mt-4 text-sm leading-7 text-white/60">In der geplanten WellFit-Welt stellt der Bürgermeister besondere Stadtaktionen vor, macht gemeinsame Ziele sichtbar und eröffnet saisonale Erlebnisse. Diese Funktionen werden erst nach Produkt-, Sicherheits- und Moderationsprüfung freigegeben.</p></div>
          </div>
        </div>
      </section>

      <section id="erlebnisse" className="bg-[#041e26] px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <SectionHeading eyebrow="Die Welt wird dein Spielfeld" title="Erlebnisse, die dich nach draußen bringen" text="Von der Stadtmission bis zum Familienabenteuer verwandelt WellFit echte Orte und alltägliche Bewegung in spielbare Erlebnisse." />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {experiences.map(([icon, title, text], index) => (
              <article key={title} className="group relative overflow-hidden rounded-2xl border border-cyan-300/12 bg-[radial-gradient(circle_at_85%_20%,rgba(0,220,211,.12),transparent_38%),linear-gradient(145deg,#07313a,#03161c)] p-6 transition hover:-translate-y-1 hover:border-cyan-200/25">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-cyan-300/6 blur-2xl" />
                <span className={`grid h-11 w-11 place-items-center rounded-xl border text-base font-semibold ${index === 5 ? "border-[#ffd95d]/25 bg-[#ffd95d]/10 text-[#ffd95d]" : "border-cyan-300/18 bg-cyan-300/8 text-cyan-200"}`}>{icon}</span>
                <h3 className="mt-6 text-xl font-semibold">{title}</h3><p className="mt-3 leading-7 text-white/56">{text}</p>
                {index === 5 ? <span className="mt-5 inline-flex rounded-full border border-[#ffd95d]/18 bg-[#ffd95d]/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.16em] text-[#ffd95d]">Geplant</span> : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="buddy" className="relative overflow-hidden bg-[#02151b] px-5 py-20 lg:px-10">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-[radial-gradient(circle_at_60%_45%,rgba(0,220,211,.13),transparent_45%)]" />
        <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <div className="relative mx-auto min-h-[500px] w-full max-w-[520px]">
            <div className="absolute inset-12 rounded-full bg-cyan-300/12 blur-3xl" />
            <Image src="/buddy/luma.png" alt="Luma, der WellFit Buddy" fill sizes="520px" className="object-contain drop-shadow-[0_32px_48px_rgba(0,0,0,.48)]" />
            <div className="absolute bottom-4 left-1/2 grid w-[88%] -translate-x-1/2 grid-cols-3 gap-2 rounded-2xl border border-white/12 bg-[#031419]/80 p-3 backdrop-blur-xl">
              {[["Energie", "78%", "text-lime-200"], ["Stimmung", "Gut", "text-[#ffd95d]"], ["Level", "12", "text-cyan-200"]].map(([label, value, color]) => <div key={label} className="text-center"><p className="text-[10px] uppercase tracking-[.14em] text-white/38">{label}</p><p className={`mt-1 text-sm font-bold ${color}`}>{value}</p></div>)}
            </div>
          </div>
          <div><p className="text-[11px] font-semibold uppercase tracking-[.26em] text-[#ffd95d]">Dein emotionaler Begleiter</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.035em] sm:text-4xl lg:text-[48px]">Dein Buddy lebt mit deinem <span className="text-[#ff9a27]">Fortschritt.</span></h2><p className="mt-5 max-w-2xl text-base leading-8 text-white/62">Wie bei einem Tamagotchi braucht dein Buddy regelmäßig Aufmerksamkeit. Bewegung gibt Energie, Pflege stärkt eure Verbindung und abgeschlossene Missionen helfen ihm, sich weiterzuentwickeln.</p>
            <div className="mt-7 grid gap-3 sm:grid-cols-4">{[["Füttern", "Energie"], ["Pflegen", "Wohlbefinden"], ["Trainieren", "Fähigkeiten"], ["Nachsehen", "Bindung"]].map(([title, detail]) => <div key={title} className="rounded-xl border border-lime-300/16 bg-lime-300/[.045] p-4"><p className="text-sm font-semibold text-lime-200">{title}</p><p className="mt-1 text-xs text-white/42">{detail}</p></div>)}</div>
            <div className="mt-7 rounded-2xl border border-cyan-300/14 bg-[#06262d]/62 p-5"><h3 className="text-lg font-semibold text-cyan-100">Wo siehst du deinen Buddy?</h3><div className="mt-4 grid gap-3 sm:grid-cols-2">{["Im Buddy-Bereich der App", "Auf deinem Dashboard", "Während ausgewählter Missionen", "In deiner Fortschrittsansicht"].map((item) => <div key={item} className="flex items-center gap-3 text-sm text-white/62"><span className="h-1.5 w-1.5 rounded-full bg-[#ffd95d]" />{item}</div>)}</div></div>
          </div>
        </div>
      </section>

      <section id="fuer-wen" className="bg-[#031b22] px-5 py-20 lg:px-10">
        <div className="mx-auto max-w-[1440px]">
          <SectionHeading eyebrow="Für viele Lebenssituationen" title="Für mehr Menschen, als du denkst" text="WellFit passt Motivation, Intensität und Erlebnis an den Menschen an – nicht umgekehrt." />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {audiences.map(([number, title, text]) => <article key={title} className="rounded-2xl border border-cyan-300/12 bg-cyan-300/[.035] p-6"><div className="flex items-center justify-between"><span className="text-[10px] font-semibold tracking-[.2em] text-cyan-300">{number}</span><span className="h-2 w-2 rounded-full bg-[#ffd95d]" /></div><h3 className="mt-7 text-xl font-semibold">{title}</h3><p className="mt-3 leading-7 text-white/54">{text}</p></article>)}
          </div>
        </div>
      </section>

      <section id="sicherheit" className="relative overflow-hidden bg-[#02151b] px-5 py-20 lg:px-10">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-cyan-300/6 blur-3xl" />
        <div className="relative mx-auto max-w-[1440px]">
          <SectionHeading eyebrow="Vertrauen als Grundlage" title="Sicherheit, die du kontrollierst" text="WellFit trennt bestehende Schutzmaßnahmen klar von geplanten Familien- und Community-Funktionen." />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {safetyCards.map(([icon, title, text], index) => <article key={title} className="rounded-2xl border border-cyan-300/12 bg-cyan-300/[.035] p-6"><span className="grid h-12 w-12 place-items-center rounded-xl border border-cyan-300/18 bg-cyan-300/8 text-lg text-cyan-200">{icon}</span><h3 className="mt-6 text-lg font-semibold">{title}</h3><p className="mt-3 leading-7 text-white/54">{text}</p>{index > 1 ? <span className="mt-5 inline-flex rounded-full border border-[#ffd95d]/18 bg-[#ffd95d]/8 px-3 py-1 text-[10px] font-semibold uppercase tracking-[.16em] text-[#ffd95d]">Geplant</span> : null}</article>)}
          </div>
        </div>
      </section>

      <section id="ueber-uns" className="relative overflow-hidden bg-[radial-gradient(circle_at_78%_38%,rgba(0,214,204,.13),transparent_30%),linear-gradient(145deg,#041f27,#020f14)] px-5 py-20 lg:px-10">
        <div className="mx-auto grid max-w-[1440px] items-center gap-12 lg:grid-cols-[1.08fr_.92fr]">
          <div><p className="text-[11px] font-semibold uppercase tracking-[.26em] text-[#ffd95d]">Warum es WellFit gibt</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.035em] sm:text-4xl lg:text-[48px]">Gemeinsam bewegen wir mehr.</h2><p className="mt-5 max-w-2xl text-base leading-8 text-white/62">WellFit verbindet Gesundheit, Spiel, Lernen und Gemeinschaft. Digitale Technik soll Menschen nicht nur an Bildschirme binden, sondern sie motivieren, ihre Umgebung bewusst zu erleben.</p><div className="mt-7 grid gap-3 sm:grid-cols-3">{[["Vision", "Bewegung wird Erlebnis."], ["Mission", "Motivation wird persönlich."], ["Werte", "Sicher, fair und gemeinsam."]].map(([title, text]) => <div key={title} className="rounded-xl border border-cyan-300/12 bg-black/16 p-4"><p className="text-sm font-semibold text-cyan-200">{title}</p><p className="mt-2 text-xs leading-5 text-white/48">{text}</p></div>)}</div></div>
          <div className="relative mx-auto min-h-[360px] w-full max-w-[460px]"><div className="absolute inset-10 rounded-full bg-cyan-300/10 blur-3xl" /><Image src="/buddy/luma.png" alt="WellFit Buddy" fill sizes="460px" className="object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,.46)]" /></div>
        </div>
      </section>

      <section className="bg-[#020d11] px-5 py-14 lg:px-10"><div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-7 overflow-hidden rounded-3xl border border-[#ffad2f]/22 bg-[radial-gradient(circle_at_85%_20%,rgba(255,216,93,.18),transparent_22%),linear-gradient(110deg,#092b32,#07313a_55%,#19281f)] p-7 text-center lg:flex-row lg:p-10 lg:text-left"><div><p className="text-[11px] font-semibold uppercase tracking-[.23em] text-[#ffd95d]">Dein erstes Abenteuer wartet</p><h2 className="mt-3 text-2xl font-extrabold tracking-[-.025em] sm:text-4xl">Bewegung, die sich nach Fortschritt anfühlt.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">Entdecke WellFit, lerne deinen Buddy kennen und mache den ersten Schritt in deine persönliche Abenteuerwelt.</p></div><Link href="/register" className="shrink-0 rounded-xl bg-gradient-to-r from-[#ff8c1d] to-[#ffd95d] px-7 py-3.5 text-base font-bold text-[#172006] shadow-[0_16px_36px_rgba(255,153,30,.2)]">Jetzt WellFit starten →</Link></div></section>

      <footer className="border-t border-white/8 bg-[#01090c] px-5 py-8 lg:px-10"><div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-5 text-sm text-white/42 sm:flex-row"><p>© WellFit · Earn Wellness</p><div className="flex flex-wrap justify-center gap-5"><Link href="/datenschutz">Datenschutz</Link><Link href="/impressum">Impressum</Link><Link href="/agb">AGB</Link><Link href="/hilfe">Hilfe</Link></div></div></footer>
    </main>
  );
}
