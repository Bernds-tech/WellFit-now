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
  ["↗", "Bewege dich im Alltag", "Kleine Aktivitäten werden zu sichtbarem Fortschritt.", null, "border-cyan-300/20 from-[#082c34]"],
  ["W", "Sammle WFXP", "Missionen und Ziele belohnen dich und deinen Buddy.", "/coin.png", "border-amber-300/20 from-[#2b220d]"],
  ["♥", "Pflege deinen Buddy", "Füttern, trainieren und spielen – wie bei einem Tamagotchi.", "/buddy/luma.png", "border-lime-300/18 from-[#132a18]"],
  ["⌖", "Erlebe echte Missionen", "Deine Umgebung wird zum Spielfeld für neue Abenteuer.", null, "border-orange-300/20 from-[#30200f]"],
] as const;

const highlights = [
  ["/buddy/luma.png", "Buddy wie ein Tamagotchi", "Pflege, Aktivität und Fortschritt formen eure Verbindung."],
  [null, "Bürgermeister & Community", "Roadmap-Vorschau für lokale Checkpoints und gemeinsame Ziele."],
  [null, "Für viele Lebenslagen", "Allein, mit Freunden oder als Familie – mit passender Intensität."],
  [null, "Sichere Daten", "Datenminimierung, transparente Einwilligungen und Kontrolle."],
] as const;

const steps = [
  ["01", "Bewegen", "Alltagsaktivität wird Fortschritt."],
  ["02", "Entdecken", "Missionen machen deine Umgebung spielbar."],
  ["03", "Sammeln", "Erfolge bringen WFXP und Level."],
  ["04", "Pflegen", "Dein Buddy braucht Aufmerksamkeit."],
  ["05", "Freischalten", "Neue Fähigkeiten und Erlebnisse."],
] as const;

const experiences = [
  ["⌂", "Stadt-Abenteuer", "Historische Orte und versteckte Ecken."],
  ["△", "Natur & Outdoor", "Wälder, Seen und aktive Entdeckungsrouten."],
  ["●", "Familienmissionen", "Gemeinsame Aufgaben für Groß und Klein."],
  ["⌁", "Fitness-Challenges", "Schrittziele und sanfte Bewegungsimpulse."],
  ["✚", "Community-Aktionen", "Gemeinsame Ziele und saisonale Missionen."],
  ["♛", "Bürgermeister-System", "Roadmap-Vorschau für lokale Stadtaktionen."],
] as const;

const audiences = [
  ["Einzelpersonen", "Sanft starten und im Alltag dranbleiben."],
  ["Familien", "Gemeinsam aktiv sein und Erfolge teilen."],
  ["Kinder & Eltern", "Geplante altersgerechte Erlebnisse mit Kontrollen."],
  ["Freunde", "Challenges und gemeinsame Ziele."],
  ["Schulen & Vereine", "Bewegung, Lernen und Gemeinschaft verbinden."],
  ["Unternehmen & Städte", "Gesunde Teams und aktive Communities."],
] as const;

function PhonePreview() {
  return (
    <div className="relative mx-auto w-[122px] rotate-[1deg] rounded-[19px] border-[3px] border-[#15252a] bg-[#010609] p-1 shadow-[0_16px_34px_rgba(0,0,0,.52)] sm:w-[142px]">
      <div className="absolute left-1/2 top-1.5 z-10 h-3 w-11 -translate-x-1/2 rounded-full bg-black" />
      <div className="overflow-hidden rounded-[14px] border border-cyan-300/10 bg-[linear-gradient(180deg,#07343b,#03171c)] px-2 pb-2 pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[5px] text-cyan-100/60">Hallo, Alex!</p>
            <p className="mt-0.5 text-[13px] font-bold text-[#ffd62f]">1.250 <span className="text-[7px] text-white">WFXP</span></p>
          </div>
          <span className="rounded-full border border-cyan-300/20 bg-cyan-300/8 px-1 py-0.5 text-[5px] text-cyan-100">LV 12</span>
        </div>
        <div className="mt-1.5 h-[3px] rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-300 via-lime-300 to-[#ffd62f]" /></div>
        <div className="mt-2 rounded-md border border-cyan-300/12 bg-black/25 p-1.5">
          <p className="text-[4px] font-bold uppercase tracking-[0.16em] text-cyan-300">Aktive Mission</p>
          <div className="mt-1 flex items-center justify-between gap-1">
            <div><p className="text-[6px] font-semibold">Waldpfad</p><p className="text-[4px] text-white/42">3 Orte</p></div>
            <strong className="text-[5px] text-[#ffd62f]">2/3</strong>
          </div>
          <div className="mt-1 h-[2px] rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-lime-300" /></div>
          <p className="mt-1 text-[5px] font-semibold text-[#ffae2f]">+250 WFXP</p>
        </div>
        <div className="mt-1.5 grid grid-cols-3 gap-1 text-center">
          {[["7.842", "Schritte"], ["487", "kcal"], ["5,3", "km"]].map(([value, label]) => (
            <div key={label} className="rounded bg-white/[0.04] py-1"><p className="text-[6px] font-semibold">{value}</p><p className="text-[4px] text-white/35">{label}</p></div>
          ))}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 rounded-md border border-lime-300/12 bg-lime-300/[0.04] p-1.5">
          <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-cyan-300/8"><Image src="/buddy/luma.png" alt="Luma" fill sizes="20px" className="object-contain" /></div>
          <div className="min-w-0 flex-1"><p className="text-[4px] text-white/35">Dein Buddy</p><p className="text-[6px] font-semibold">Luma</p><div className="mt-0.5 h-[2px] rounded-full bg-white/10"><div className="h-full w-3/5 rounded-full bg-[#ffd62f]" /></div></div>
          <span className="text-[7px] text-[#ff9c28]">♥</span>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mx-auto mb-5 max-w-xl text-center">
      <p className="text-[7px] font-semibold uppercase tracking-[0.22em] text-[#ffd62f]">{eyebrow}</p>
      <h2 className="mt-1.5 text-xl font-bold tracking-[-0.025em] text-white sm:text-[25px]">{title}</h2>
      <p className="mt-2 text-xs leading-5 text-cyan-50/58">{text}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="h-screen overflow-y-auto scroll-smooth bg-[#020c10] text-white">
      <LandingSessionRedirect />

      <header className="sticky top-0 z-50 border-b border-white/7 bg-[#020d12]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-1.5 lg:px-6">
          <Link href="/" className="relative h-10 w-20 shrink-0 sm:h-11 sm:w-24">
            <Image src="/logo.png" alt="WellFit" fill priority sizes="96px" className="object-contain object-left" />
          </Link>
          <nav className="hidden items-center gap-5 xl:flex">
            {navItems.map(([label, href]) => <a key={href} href={href} className="text-[9px] font-medium text-white/66 transition hover:text-white">{label}</a>)}
          </nav>
          <div className="flex items-center gap-1.5">
            <span className="hidden rounded-md border border-white/10 px-2 py-1 text-[8px] text-white/50 sm:block">DE</span>
            <Link href="/login" className="rounded-md border border-cyan-300/30 px-2.5 py-1.5 text-[9px] font-semibold text-cyan-50 transition hover:bg-cyan-300/8">Anmelden</Link>
            <Link href="/register" className="hidden rounded-md bg-gradient-to-r from-[#ff8c1d] to-[#ffd62f] px-3 py-1.5 text-[9px] font-bold text-[#1b2006] shadow-[0_6px_14px_rgba(255,153,30,.16)] sm:block">Kostenlos starten</Link>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-white/7">
        <Image src="/login-bg.png" alt="Menschen in Bewegung" fill priority sizes="100vw" className="-z-30 object-cover object-center opacity-46" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_76%_38%,rgba(0,225,215,.16),transparent_28%),linear-gradient(90deg,#020d12_0%,rgba(2,24,29,.94)_43%,rgba(1,25,30,.44)_72%,#020d12_100%)]" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-[#020c10]/80" />

        <div className="mx-auto grid min-h-[350px] max-w-[1180px] items-center gap-5 px-4 py-6 lg:grid-cols-[.98fr_1.02fr] lg:px-6 lg:py-7">
          <div className="relative z-10 max-w-[500px]">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/18 bg-[#06262d]/60 px-2 py-1 text-[6px] font-semibold uppercase tracking-[0.22em] text-cyan-200">
              <span className="h-1 w-1 rounded-full bg-[#ffd62f]" /> Move · Learn · Earn
            </div>
            <h1 className="mt-3 text-[25px] font-bold leading-[1.04] tracking-[-0.035em] text-white sm:text-[33px] xl:text-[37px]">
              Willkommen bei WellFit.<br />Dein Abenteuer für <span className="bg-gradient-to-r from-[#f3e75a] via-[#ffb224] to-[#ff7d16] bg-clip-text text-transparent">Körper & Geist.</span>
            </h1>
            <div className="mt-2.5 h-[2px] w-24 rounded-full bg-gradient-to-r from-cyan-300 via-[#ffd62f] to-[#ff7d16]" />
            <p className="mt-3 max-w-md text-[10px] leading-4 text-cyan-50/72 sm:text-xs">
              Bewege dich im Alltag, entdecke Missionen, sammle WFXP und entwickle deinen persönlichen Buddy.
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link href="/register" className="rounded-lg bg-gradient-to-r from-[#ff8418] to-[#ffd62f] px-3.5 py-2 text-center text-[10px] font-bold text-[#1d2206] shadow-[0_8px_18px_rgba(255,139,24,.2)]">Jetzt kostenlos starten →</Link>
              <a href="#so-funktionierts" className="rounded-lg border border-cyan-300/34 bg-[#06252d]/54 px-3.5 py-2 text-center text-[10px] font-semibold text-cyan-50">▶ So funktioniert’s</a>
            </div>
            <div className="mt-4 flex flex-col gap-2 text-[8px] sm:flex-row sm:gap-5">
              <div className="flex items-center gap-1.5"><span className="grid h-5 w-5 place-items-center rounded-full border border-cyan-300/22 bg-cyan-300/7 text-[8px] text-cyan-200">◇</span><div><p className="font-semibold text-cyan-100">Sicher & transparent</p><p className="text-[7px] text-white/38">Klare Kontrolle.</p></div></div>
              <div className="flex items-center gap-1.5"><span className="grid h-5 w-5 place-items-center rounded-full border border-[#ffd62f]/22 bg-[#ffd62f]/7 text-[8px] text-[#ffd62f]">♧</span><div><p className="font-semibold text-[#ffe36c]">Für viele Lebenslagen</p><p className="text-[7px] text-white/38">Allein oder gemeinsam.</p></div></div>
            </div>
          </div>

          <div className="relative min-h-[270px]">
            <div className="absolute inset-x-16 bottom-5 top-8 rounded-[45%] bg-cyan-300/7 blur-3xl" />
            <div className="absolute bottom-3 left-[12%] z-20 w-[30%]"><PhonePreview /></div>
            <div className="absolute bottom-0 right-[10%] z-10 h-[255px] w-[43%] sm:h-[285px]">
              <Image src="/buddy/luma.png" alt="Luma, der WellFit Buddy" fill priority sizes="280px" className="object-contain object-bottom drop-shadow-[0_16px_26px_rgba(0,0,0,.4)]" />
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1180px] gap-2 px-4 pb-5 md:grid-cols-2 xl:grid-cols-4 lg:px-6">
          {featureCards.map(([icon, title, text, image, surface], index) => (
            <article key={title} className={`group relative min-h-[112px] overflow-hidden rounded-xl border bg-gradient-to-br ${surface} to-[#031419]/96 p-3`}>
              {image ? <div className="absolute bottom-[-8%] right-0 h-[62%] w-[38%] opacity-68"><Image src={image} alt="" fill sizes="90px" className="object-contain object-bottom" /></div> : null}
              <div className="relative z-10 max-w-[76%]">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-black/14 text-[7px] font-bold text-[#ffd62f]">{icon}</span>
                <h2 className="mt-2 text-[11px] font-semibold text-white">{title}</h2>
                <p className="mt-1 text-[8px] leading-3.5 text-white/54">{text}</p>
                <a href={index === 2 ? "#buddy" : index === 3 ? "#erlebnisse" : "#so-funktionierts"} className="mt-2 inline-flex text-[7px] font-semibold text-[#ffd62f]">Mehr erfahren ›</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-white/7 bg-[#020f14] px-4 py-5 lg:px-6">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="text-base font-bold tracking-[-0.02em] sm:text-lg">Was WellFit <span className="text-[#ff9b25]">besonders</span> macht</h2>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map(([image, title, text], index) => (
              <article key={title} className="rounded-xl border border-cyan-300/12 bg-[#06242b]/60 p-2.5">
                <div className="flex gap-2">
                  <div className="relative grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-cyan-300/14 bg-cyan-300/7 text-[10px] text-cyan-200">
                    {image ? <Image src={image} alt="" fill sizes="32px" className="object-contain" /> : index === 1 ? "♛" : index === 2 ? "♧" : "▣"}
                  </div>
                  <div><h3 className={`text-[9px] font-semibold ${index === 1 ? "text-[#ffae2e]" : index === 2 ? "text-lime-300" : "text-cyan-200"}`}>{title}</h3><p className="mt-1 text-[7px] leading-3 text-white/50">{text}</p></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="so-funktionierts" className="bg-[#03181f] px-4 py-8 lg:px-6">
        <SectionHeading eyebrow="Einfach starten" title="So wird Alltag zu Fortschritt" text="Bewegung, Missionen, Buddy-Pflege und Belohnungen greifen ineinander." />
        <div className="mx-auto grid max-w-[1180px] gap-2 lg:grid-cols-5">
          {steps.map(([number, title, text]) => <article key={number} className="rounded-xl border border-cyan-300/10 bg-cyan-300/[0.03] p-3"><span className="text-[6px] font-semibold tracking-[.18em] text-cyan-300">{number}</span><h3 className="mt-2.5 text-[10px] font-semibold">{title}</h3><p className="mt-1 text-[8px] leading-3.5 text-white/48">{text}</p></article>)}
        </div>
      </section>

      <section id="erlebnisse" className="bg-[#041e26] px-4 py-8 lg:px-6">
        <SectionHeading eyebrow="Die Welt wird dein Spielfeld" title="Erlebnisse, die dich nach draußen bringen" text="WellFit verwandelt echte Orte und alltägliche Bewegung in spielbare Erlebnisse." />
        <div className="mx-auto grid max-w-[1180px] gap-2 md:grid-cols-2 xl:grid-cols-3">
          {experiences.map(([icon, title, text]) => <article key={title} className="rounded-xl border border-cyan-300/10 bg-[radial-gradient(circle_at_85%_20%,rgba(0,220,211,.09),transparent_38%),linear-gradient(145deg,#07313a,#03161c)] p-3"><span className="grid h-6 w-6 place-items-center rounded-md border border-[#ffd62f]/18 bg-[#ffd62f]/7 text-[8px] font-semibold text-[#ffd62f]">{icon}</span><h3 className="mt-2.5 text-xs font-semibold">{title}</h3><p className="mt-1 text-[8px] leading-3.5 text-white/50">{text}</p></article>)}
        </div>
      </section>

      <section id="buddy" className="bg-[#02151b] px-4 py-8 lg:px-6">
        <div className="mx-auto grid max-w-[1180px] items-center gap-5 lg:grid-cols-[.82fr_1.18fr]">
          <div className="relative mx-auto h-[190px] w-full max-w-[230px]"><div className="absolute inset-6 rounded-full bg-cyan-300/8 blur-3xl" /><Image src="/buddy/luma.png" alt="Luma, der WellFit Buddy" fill sizes="230px" className="object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,.38)]" /></div>
          <div><p className="text-[7px] font-semibold uppercase tracking-[.22em] text-[#ffd62f]">Dein emotionaler Begleiter</p><h2 className="mt-1.5 text-xl font-bold tracking-[-.025em] sm:text-[25px]">Dein Buddy lebt mit deinem <span className="text-[#ff9a27]">Fortschritt.</span></h2><p className="mt-2.5 max-w-xl text-xs leading-5 text-white/56">Dein Buddy reagiert auf Aktivität, Stimmung und Pflege. Du siehst ihn im Buddy-Bereich, auf dem Dashboard, in Missionen und im Fortschritt.</p><div className="mt-3 grid gap-1.5 sm:grid-cols-4">{["Füttern", "Pflegen", "Trainieren", "Nachsehen"].map((item) => <div key={item} className="rounded-md border border-lime-300/14 bg-lime-300/[.04] p-1.5 text-center text-[8px] font-semibold text-lime-200">{item}</div>)}</div></div>
        </div>
      </section>

      <section id="fuer-wen" className="bg-[#031b22] px-4 py-8 lg:px-6">
        <SectionHeading eyebrow="Für viele Lebenssituationen" title="Für mehr Menschen, als du denkst" text="WellFit passt Motivation und Intensität an den Menschen an." />
        <div className="mx-auto grid max-w-[1180px] gap-2 md:grid-cols-2 xl:grid-cols-3">{audiences.map(([title, text], index) => <article key={title} className="rounded-xl border border-cyan-300/10 bg-cyan-300/[.03] p-3"><div className="grid h-6 w-6 place-items-center rounded-md bg-cyan-300/7 text-[7px] font-semibold text-[#ffd62f]">{String(index + 1).padStart(2, "0")}</div><h3 className="mt-2.5 text-xs font-semibold">{title}</h3><p className="mt-1 text-[8px] leading-3.5 text-white/50">{text}</p></article>)}</div>
      </section>

      <section id="sicherheit" className="bg-[#02151b] px-4 py-8 lg:px-6">
        <SectionHeading eyebrow="Vertrauen als Grundlage" title="Sicherheit, die du kontrollierst" text="Bestehende Schutzmaßnahmen und geplante Funktionen bleiben klar getrennt." />
        <div className="mx-auto grid max-w-[1180px] gap-2 md:grid-cols-2 xl:grid-cols-4">{[
          ["Datenschutz & DSGVO", "Datenminimierung und klare Rechte."],
          ["Sichere Konten", "Geschützte Anmeldung und Berechtigungen."],
          ["Familienfunktionen geplant", "Freigabe erst nach Prüfung."],
          ["Faire Community geplant", "Soziale Funktionen bleiben bis zur Moderationsfreigabe deaktiviert."],
        ].map(([title, text]) => <article key={title} className="rounded-xl border border-cyan-300/10 bg-cyan-300/[.03] p-3"><span className="grid h-6 w-6 place-items-center rounded-md border border-cyan-300/14 bg-cyan-300/7 text-[9px] text-cyan-200">◇</span><h3 className="mt-2.5 text-[10px] font-semibold">{title}</h3><p className="mt-1 text-[8px] leading-3.5 text-white/50">{text}</p></article>)}</div>
      </section>

      <section id="ueber-uns" className="bg-[radial-gradient(circle_at_75%_35%,rgba(0,214,204,.08),transparent_30%),linear-gradient(145deg,#041f27,#020f14)] px-4 py-8 lg:px-6">
        <div className="mx-auto grid max-w-[1180px] items-center gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <div><p className="text-[7px] font-semibold uppercase tracking-[.22em] text-[#ffd62f]">Warum es WellFit gibt</p><h2 className="mt-1.5 text-xl font-bold tracking-[-.025em] sm:text-[25px]">Gemeinsam bewegen wir mehr.</h2><p className="mt-2.5 max-w-xl text-xs leading-5 text-white/56">WellFit verbindet Gesundheit, Spiel, Lernen und Gemeinschaft. Bewegung soll sich wie der Beginn einer persönlichen Geschichte anfühlen.</p></div>
          <div className="flex items-center justify-center"><div className="relative h-32 w-32"><Image src="/buddy/luma.png" alt="WellFit Buddy" fill sizes="128px" className="object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,.35)]" /></div></div>
        </div>
      </section>

      <section className="bg-[#020d11] px-4 py-6 lg:px-6"><div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-3 rounded-xl border border-[#ffad2f]/18 bg-gradient-to-r from-[#092b32] via-[#07313a] to-[#19281f] p-4 text-center lg:flex-row lg:text-left"><div><p className="text-[7px] font-semibold uppercase tracking-[.2em] text-[#ffd62f]">Dein erstes Abenteuer wartet</p><h2 className="mt-1 text-base font-bold tracking-[-.02em] sm:text-xl">Bewegung, die sich nach Fortschritt anfühlt.</h2></div><Link href="/register" className="shrink-0 rounded-lg bg-gradient-to-r from-[#ff8c1d] to-[#ffd62f] px-4 py-2 text-[10px] font-bold text-[#172006]">Jetzt WellFit starten →</Link></div></section>

      <footer className="border-t border-white/7 bg-[#01090c] px-4 py-4 lg:px-6"><div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-3 text-[8px] text-white/38 sm:flex-row"><p>© WellFit · Earn Wellness</p><div className="flex flex-wrap justify-center gap-3"><Link href="/datenschutz">Datenschutz</Link><Link href="/impressum">Impressum</Link><Link href="/agb">AGB</Link><Link href="/hilfe">Hilfe</Link></div></div></footer>
    </main>
  );
}
