import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LandingSessionRedirect from "./components/landing/LandingSessionRedirect";

export const metadata: Metadata = {
  title: "WellFit – Dein Abenteuer für Körper & Geist",
  description:
    "WellFit verbindet Bewegung, Missionen, WFXP, einen persönlichen KI-Buddy und gemeinschaftliche Erlebnisse.",
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
    text: "Jeder Schritt zählt. Kleine Aktivitäten werden zu sichtbarem Fortschritt.",
    icon: "↗",
    image: null,
    surface: "border-cyan-300/25 from-[#082f38]",
  },
  {
    title: "Sammle WFXP",
    text: "Missionen und erreichte Ziele belohnen dich und deinen Buddy.",
    icon: "W",
    image: "/coin.png",
    surface: "border-amber-300/25 from-[#30250c]",
  },
  {
    title: "Pflege deinen Buddy",
    text: "Füttern, trainieren und spielen – wie bei einem Tamagotchi.",
    icon: "♥",
    image: "/buddy/luma.png",
    surface: "border-lime-300/20 from-[#15301b]",
  },
  {
    title: "Erlebe echte Missionen",
    text: "Deine Umgebung wird zum Spielfeld für neue Abenteuer.",
    icon: "⌖",
    image: null,
    surface: "border-orange-300/25 from-[#34200f]",
  },
] as const;

const highlights = [
  ["/buddy/luma.png", "Buddy wie ein Tamagotchi", "Ein Begleiter, der auf Pflege, Aktivität und Fortschritt reagiert."],
  [null, "Bürgermeister & Community", "Roadmap-Vorschau für lokale Checkpoints, Stadtaktionen und gemeinsame Ziele."],
  [null, "Für viele Lebenslagen", "Allein, mit Freunden oder als Familie – mit passender Intensität."],
  [null, "Sichere Daten", "Datenminimierung, transparente Einwilligungen und klare Kontrolle."],
] as const;

const steps = [
  ["01", "Bewegen", "Schritte, Wege und Aktivitäten werden zu Fortschritt."],
  ["02", "Entdecken", "Missionen machen deine Umgebung spielbar."],
  ["03", "Sammeln", "Erfolge bringen WFXP und neue Level."],
  ["04", "Pflegen", "Dein Buddy braucht Aufmerksamkeit und Training."],
  ["05", "Freischalten", "Neue Fähigkeiten und Erlebnisse werden zugänglich."],
] as const;

const experiences = [
  ["⌂", "Stadt-Abenteuer", "Historische Orte, Street Art und versteckte Ecken."],
  ["△", "Natur & Outdoor", "Wälder, Seen, Berge und aktive Entdeckungsrouten."],
  ["●", "Familienmissionen", "Gemeinsame Aufgaben und Abenteuer für Groß und Klein."],
  ["⌁", "Fitness-Challenges", "Schrittziele, Workouts und sanfte Bewegungsimpulse."],
  ["✚", "Community-Aktionen", "Gemeinsame Ziele und saisonale Missionen."],
  ["♛", "Bürgermeister-System", "Roadmap-Vorschau für lokale Stadtaktionen und Checkpoints."],
] as const;

const audiences = [
  ["Einzelpersonen", "Sanft starten und im Alltag dranbleiben."],
  ["Familien", "Gemeinsam aktiv sein und Erfolge teilen."],
  ["Kinder & Eltern", "Geplante altersgerechte Erlebnisse mit Familienkontrollen."],
  ["Freunde", "Challenges, gemeinsame Ziele und echte Erlebnisse."],
  ["Schulen & Vereine", "Bewegung, Lernen und Gemeinschaft verbinden."],
  ["Unternehmen & Städte", "Gesunde Teams und aktive lokale Communities."],
] as const;

function PhonePreview() {
  return (
    <div className="relative mx-auto w-[220px] rotate-[1.5deg] rounded-[34px] border-[6px] border-[#15252a] bg-[#010609] p-2 shadow-[0_28px_60px_rgba(0,0,0,.55)] sm:w-[250px]">
      <div className="absolute left-1/2 top-3 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
      <div className="overflow-hidden rounded-[25px] border border-cyan-300/10 bg-[linear-gradient(180deg,#07343b,#03171c)] px-4 pb-4 pt-9">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] text-cyan-100/60">Hallo, Alex!</p>
            <p className="mt-1 text-2xl font-extrabold text-[#ffd62f]">1.250 <span className="text-sm text-white">WFXP</span></p>
          </div>
          <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-1 text-[9px] text-cyan-100">LV 12</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-300 via-lime-300 to-[#ffd62f]" /></div>
        <div className="mt-4 rounded-xl border border-cyan-300/15 bg-black/25 p-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-cyan-300">Aktive Mission</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div><p className="text-xs font-bold">Waldpfad-Entdecker</p><p className="text-[9px] text-white/45">3 versteckte Orte</p></div>
            <strong className="text-[10px] text-[#ffd62f]">2/3</strong>
          </div>
          <div className="mt-2 h-1 rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-lime-300" /></div>
          <p className="mt-2 text-[9px] font-bold text-[#ffae2f]">+250 WFXP</p>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
          {[['7.842', 'Schritte'], ['487', 'kcal'], ['5,3', 'km']].map(([value, label]) => (
            <div key={label} className="rounded-lg bg-white/[0.045] py-2.5"><p className="text-xs font-bold">{value}</p><p className="text-[8px] text-white/40">{label}</p></div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-lime-300/15 bg-lime-300/[0.05] p-2.5">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-cyan-300/10"><Image src="/buddy/luma.png" alt="Luma" fill sizes="40px" className="object-contain" /></div>
          <div className="min-w-0 flex-1"><p className="text-[8px] text-white/40">Dein Buddy</p><p className="text-xs font-bold">Luma</p><div className="mt-1 h-1 rounded-full bg-white/10"><div className="h-full w-3/5 rounded-full bg-[#ffd62f]" /></div></div>
          <span className="text-sm text-[#ff9c28]">♥</span>
        </div>
        <div className="mt-3 flex justify-between border-t border-white/5 pt-2.5 text-[7px] text-white/32"><span>Entdecken</span><span>Missionen</span><span>Buddy</span><span>Fortschritt</span><span>Profil</span></div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mx-auto mb-9 max-w-2xl text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#ffd62f]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-[42px]">{title}</h2>
      <p className="mt-4 text-base leading-7 text-cyan-50/62">{text}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="h-screen overflow-y-auto scroll-smooth bg-[#020c10] text-white">
      <LandingSessionRedirect />

      <header className="sticky top-0 z-50 border-b border-white/7 bg-[#020d12]/94 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1360px] items-center justify-between gap-5 px-5 py-2.5 lg:px-8">
          <Link href="/" className="relative h-16 w-28 shrink-0 sm:h-[72px] sm:w-32">
            <Image src="/logo.png" alt="WellFit" fill priority sizes="128px" className="object-contain object-left" />
          </Link>
          <nav className="hidden items-center gap-7 xl:flex">
            {navItems.map(([label, href]) => <a key={href} href={href} className="text-[13px] font-medium text-white/70 transition hover:text-white">{label}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <span className="hidden rounded-lg border border-white/10 px-3 py-2 text-xs text-white/55 sm:block">DE</span>
            <Link href="/login" className="rounded-lg border border-cyan-300/35 px-4 py-2.5 text-sm font-semibold text-cyan-50 transition hover:bg-cyan-300/8">Anmelden</Link>
            <Link href="/register" className="hidden rounded-lg bg-gradient-to-r from-[#ff8c1d] to-[#ffd62f] px-5 py-2.5 text-sm font-bold text-[#1b2006] shadow-[0_10px_24px_rgba(255,153,30,.18)] transition hover:-translate-y-0.5 sm:block">Kostenlos starten</Link>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-white/7">
        <Image src="/login-bg.png" alt="Menschen in Bewegung" fill priority sizes="100vw" className="-z-30 object-cover object-center opacity-45" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_75%_38%,rgba(0,225,215,.18),transparent_30%),linear-gradient(90deg,#020d12_0%,rgba(2,24,29,.94)_43%,rgba(1,25,30,.48)_72%,#020d12_100%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-[#020c10]/75" />

        <div className="mx-auto grid min-h-[650px] max-w-[1360px] items-center gap-8 px-5 py-12 lg:grid-cols-[.96fr_1.04fr] lg:px-8 lg:py-14">
          <div className="relative z-10 max-w-[680px]">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-cyan-300/20 bg-[#06262d]/65 px-3.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-200 backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ffd62f]" /> Move · Learn · Earn
            </div>
            <h1 className="mt-6 text-[44px] font-extrabold leading-[1.03] tracking-[-0.04em] text-white sm:text-[58px] xl:text-[66px]">
              Willkommen bei WellFit.<br />Dein Abenteuer für <span className="bg-gradient-to-r from-[#f3e75a] via-[#ffb224] to-[#ff7d16] bg-clip-text text-transparent">Körper & Geist.</span>
            </h1>
            <div className="mt-5 h-1 w-44 rounded-full bg-gradient-to-r from-cyan-300 via-[#ffd62f] to-[#ff7d16]" />
            <p className="mt-6 max-w-xl text-[17px] leading-7 text-cyan-50/76">
              Bewege dich im Alltag, entdecke Missionen, sammle WFXP und entwickle deinen persönlichen Buddy.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="rounded-xl bg-gradient-to-r from-[#ff8418] to-[#ffd62f] px-6 py-3.5 text-center text-base font-bold text-[#1d2206] shadow-[0_14px_34px_rgba(255,139,24,.24)] transition hover:-translate-y-0.5">Jetzt kostenlos starten →</Link>
              <a href="#so-funktionierts" className="rounded-xl border border-cyan-300/40 bg-[#06252d]/58 px-6 py-3.5 text-center text-base font-semibold text-cyan-50 backdrop-blur transition hover:bg-cyan-300/10">▶ So funktioniert’s</a>
            </div>
            <div className="mt-7 flex flex-col gap-4 text-sm sm:flex-row sm:gap-7">
              <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-full border border-cyan-300/25 bg-cyan-300/8 text-cyan-200">◇</span><div><p className="font-semibold text-cyan-100">Sicher & transparent</p><p className="text-xs text-white/42">Klare Einwilligungen und Kontrolle.</p></div></div>
              <div className="flex items-center gap-2.5"><span className="grid h-9 w-9 place-items-center rounded-full border border-[#ffd62f]/25 bg-[#ffd62f]/8 text-[#ffd62f]">♧</span><div><p className="font-semibold text-[#ffe36c]">Für viele Lebenslagen</p><p className="text-xs text-white/42">Allein, mit Freunden oder Familie.</p></div></div>
            </div>
          </div>

          <div className="relative min-h-[500px]">
            <div className="absolute inset-x-10 bottom-8 top-14 rounded-[45%] bg-cyan-300/8 blur-3xl" />
            <div className="absolute bottom-4 left-[4%] z-20 w-[42%]"><PhonePreview /></div>
            <div className="absolute bottom-0 right-[1%] z-10 h-[470px] w-[58%] sm:h-[520px]">
              <Image src="/buddy/luma.png" alt="Luma, der WellFit Buddy" fill priority sizes="(max-width: 1024px) 42vw, 430px" className="object-contain object-bottom drop-shadow-[0_28px_44px_rgba(0,0,0,.45)]" />
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1360px] gap-3 px-5 pb-10 md:grid-cols-2 xl:grid-cols-4 lg:px-8">
          {featureCards.map((card, index) => (
            <article key={card.title} className={`group relative min-h-[210px] overflow-hidden rounded-[22px] border bg-gradient-to-br ${card.surface} to-[#031419]/96 p-5 transition hover:-translate-y-0.5 hover:border-white/20`}>
              {card.image ? <div className="absolute bottom-[-8%] right-[-2%] h-[66%] w-[46%] opacity-75 transition group-hover:scale-105"><Image src={card.image} alt="" fill sizes="190px" className="object-contain object-bottom" /></div> : null}
              {index === 0 ? <div className="absolute bottom-4 right-4 text-[72px] font-semibold text-cyan-300/10">↗</div> : null}
              {index === 3 ? <div className="absolute bottom-2 right-4 text-[76px] text-[#ffb32f]/10">⌖</div> : null}
              <div className="relative z-10 max-w-[76%]">
                <span className="grid h-11 w-11 place-items-center rounded-full border border-white/12 bg-black/16 text-sm font-bold text-[#ffd62f]">{card.icon}</span>
                <h2 className="mt-4 text-xl font-semibold text-white">{card.title}</h2>
                <p className="mt-2.5 text-sm leading-6 text-white/58">{card.text}</p>
                <a href={index === 2 ? "#buddy" : index === 3 ? "#erlebnisse" : "#so-funktionierts"} className="mt-4 inline-flex text-xs font-semibold text-[#ffd62f]">Mehr erfahren ›</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-white/7 bg-[#020f14] px-5 py-10 lg:px-8">
        <div className="mx-auto max-w-[1360px]">
          <h2 className="text-2xl font-extrabold tracking-[-0.025em] sm:text-3xl">Was WellFit <span className="text-[#ff9b25]">besonders</span> macht</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map(([image, title, text], index) => (
              <article key={title} className="rounded-[20px] border border-cyan-300/14 bg-[#06242b]/68 p-4.5">
                <div className="flex gap-3.5">
                  <div className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full border border-cyan-300/18 bg-cyan-300/8 text-xl text-cyan-200">
                    {image ? <Image src={image} alt="" fill sizes="56px" className="object-contain" /> : index === 1 ? "♛" : index === 2 ? "♧" : "▣"}
                  </div>
                  <div><h3 className={`text-base font-semibold ${index === 1 ? "text-[#ffae2e]" : index === 2 ? "text-lime-300" : "text-cyan-200"}`}>{title}</h3><p className="mt-1.5 text-sm leading-5.5 text-white/54">{text}</p></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="so-funktionierts" className="bg-[#03181f] px-5 py-16 lg:px-8">
        <SectionHeading eyebrow="Einfach starten" title="So wird Alltag zu Fortschritt" text="WellFit verbindet Bewegung, reale Missionen, Buddy-Pflege und Belohnungen in einem klaren Kreislauf." />
        <div className="mx-auto grid max-w-[1360px] gap-3 lg:grid-cols-5">
          {steps.map(([number, title, text]) => <article key={number} className="rounded-[20px] border border-cyan-300/12 bg-cyan-300/[0.035] p-5"><span className="text-[10px] font-semibold tracking-[.2em] text-cyan-300">{number}</span><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2.5 text-sm leading-6 text-white/52">{text}</p></article>)}
        </div>
      </section>

      <section id="erlebnisse" className="bg-[#041e26] px-5 py-16 lg:px-8">
        <SectionHeading eyebrow="Die Welt wird dein Spielfeld" title="Erlebnisse, die dich nach draußen bringen" text="Von der Stadtmission bis zum Familienabenteuer verwandelt WellFit echte Orte und alltägliche Bewegung in spielbare Erlebnisse." />
        <div className="mx-auto grid max-w-[1360px] gap-3 md:grid-cols-2 xl:grid-cols-3">
          {experiences.map(([icon, title, text]) => <article key={title} className="rounded-[20px] border border-cyan-300/12 bg-[radial-gradient(circle_at_85%_20%,rgba(0,220,211,.11),transparent_38%),linear-gradient(145deg,#07313a,#03161c)] p-5"><span className="grid h-10 w-10 place-items-center rounded-xl border border-[#ffd62f]/22 bg-[#ffd62f]/8 text-base font-semibold text-[#ffd62f]">{icon}</span><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-2.5 leading-6 text-white/54">{text}</p></article>)}
        </div>
      </section>

      <section id="buddy" className="bg-[#02151b] px-5 py-16 lg:px-8">
        <div className="mx-auto grid max-w-[1360px] items-center gap-10 lg:grid-cols-[.82fr_1.18fr]">
          <div className="relative mx-auto h-[360px] w-full max-w-[420px]"><div className="absolute inset-10 rounded-full bg-cyan-300/10 blur-3xl" /><Image src="/buddy/luma.png" alt="Luma, der WellFit Buddy" fill sizes="420px" className="object-contain drop-shadow-[0_24px_38px_rgba(0,0,0,.42)]" /></div>
          <div><p className="text-[11px] font-semibold uppercase tracking-[.24em] text-[#ffd62f]">Dein emotionaler Begleiter</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] sm:text-[44px]">Dein Buddy lebt mit deinem <span className="text-[#ff9a27]">Fortschritt.</span></h2><p className="mt-5 max-w-2xl text-base leading-7 text-white/62">Dein Buddy reagiert auf Aktivität, Stimmung und Pflege. Du siehst ihn im Buddy-Bereich, auf dem Dashboard, in Missionen und in deiner Fortschrittsansicht.</p><div className="mt-6 grid gap-2.5 sm:grid-cols-4">{["Füttern", "Pflegen", "Trainieren", "Nachsehen"].map((item) => <div key={item} className="rounded-xl border border-lime-300/16 bg-lime-300/[.045] p-3 text-center text-sm font-semibold text-lime-200">{item}</div>)}</div></div>
        </div>
      </section>

      <section id="fuer-wen" className="bg-[#031b22] px-5 py-16 lg:px-8">
        <SectionHeading eyebrow="Für viele Lebenssituationen" title="Für mehr Menschen, als du denkst" text="WellFit passt Motivation, Intensität und Erlebnis an den Menschen an – nicht umgekehrt." />
        <div className="mx-auto grid max-w-[1360px] gap-3 md:grid-cols-2 xl:grid-cols-3">{audiences.map(([title, text], index) => <article key={title} className="rounded-[20px] border border-cyan-300/12 bg-cyan-300/[.035] p-5"><div className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-300/8 text-sm font-semibold text-[#ffd62f]">{String(index + 1).padStart(2, "0")}</div><h3 className="mt-5 text-xl font-semibold">{title}</h3><p className="mt-2.5 leading-6 text-white/54">{text}</p></article>)}</div>
      </section>

      <section id="sicherheit" className="bg-[#02151b] px-5 py-16 lg:px-8">
        <SectionHeading eyebrow="Vertrauen als Grundlage" title="Sicherheit, die du kontrollierst" text="WellFit trennt bestehende Schutzmaßnahmen klar von geplanten Familien- und Community-Funktionen." />
        <div className="mx-auto grid max-w-[1360px] gap-3 md:grid-cols-2 xl:grid-cols-4">{[
          ["Datenschutz & DSGVO", "Datenminimierung, transparente Verarbeitung und klare Rechte."],
          ["Sichere Konten", "Geschützte Anmeldung und nachvollziehbare Berechtigungen."],
          ["Familienfunktionen geplant", "Elternkontrollen und Kinderprofile werden erst nach Prüfung freigegeben."],
          ["Faire Community geplant", "Öffentliche soziale Funktionen bleiben bis zur Moderationsfreigabe deaktiviert."],
        ].map(([title, text]) => <article key={title} className="rounded-[20px] border border-cyan-300/12 bg-cyan-300/[.035] p-5"><span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/18 bg-cyan-300/8 text-lg text-cyan-200">◇</span><h3 className="mt-5 text-lg font-semibold">{title}</h3><p className="mt-2.5 leading-6 text-white/54">{text}</p></article>)}</div>
      </section>

      <section id="ueber-uns" className="bg-[radial-gradient(circle_at_75%_35%,rgba(0,214,204,.11),transparent_30%),linear-gradient(145deg,#041f27,#020f14)] px-5 py-16 lg:px-8">
        <div className="mx-auto grid max-w-[1360px] items-center gap-10 lg:grid-cols-[1.15fr_.85fr]">
          <div><p className="text-[11px] font-semibold uppercase tracking-[.24em] text-[#ffd62f]">Warum es WellFit gibt</p><h2 className="mt-3 text-3xl font-extrabold tracking-[-.03em] sm:text-[44px]">Gemeinsam bewegen wir mehr.</h2><p className="mt-5 max-w-2xl text-base leading-7 text-white/62">WellFit verbindet Gesundheit, Spiel, Lernen und Gemeinschaft. Bewegung soll sich nicht wie Pflicht anfühlen, sondern wie der Beginn einer persönlichen Geschichte.</p></div>
          <div className="flex items-center justify-center"><div className="relative h-60 w-60"><Image src="/buddy/luma.png" alt="WellFit Buddy" fill sizes="240px" className="object-contain drop-shadow-[0_20px_34px_rgba(0,0,0,.4)]" /></div></div>
        </div>
      </section>

      <section className="bg-[#020d11] px-5 py-12 lg:px-8"><div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-6 rounded-[24px] border border-[#ffad2f]/22 bg-gradient-to-r from-[#092b32] via-[#07313a] to-[#19281f] p-7 text-center lg:flex-row lg:text-left"><div><p className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#ffd62f]">Dein erstes Abenteuer wartet</p><h2 className="mt-2.5 text-2xl font-extrabold tracking-[-.025em] sm:text-4xl">Bewegung, die sich nach Fortschritt anfühlt.</h2></div><Link href="/register" className="shrink-0 rounded-xl bg-gradient-to-r from-[#ff8c1d] to-[#ffd62f] px-7 py-3.5 text-base font-bold text-[#172006]">Jetzt WellFit starten →</Link></div></section>

      <footer className="border-t border-white/7 bg-[#01090c] px-5 py-8 lg:px-8"><div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-5 text-sm text-white/42 sm:flex-row"><p>© WellFit · Earn Wellness</p><div className="flex flex-wrap justify-center gap-5"><Link href="/datenschutz">Datenschutz</Link><Link href="/impressum">Impressum</Link><Link href="/agb">AGB</Link><Link href="/hilfe">Hilfe</Link></div></div></footer>
    </main>
  );
}
