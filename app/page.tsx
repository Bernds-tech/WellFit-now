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
    text: "Jeder Schritt zählt. Verfolge deine Aktivität und bleib motiviert – jeden Tag.",
    icon: "↗",
    accent: "cyan",
    image: null,
  },
  {
    title: "Sammle Punkte",
    text: "Erledige Missionen, erreiche Ziele und sammle WFXP für dich und deinen Buddy.",
    icon: "WFXP",
    accent: "gold",
    image: "/coin.png",
  },
  {
    title: "Pflege deinen Buddy",
    text: "Füttern, trainieren und spielen – entwickle deinen Buddy und stärke eure Verbindung.",
    icon: "♥",
    accent: "green",
    image: "/buddy/luma.png",
  },
  {
    title: "Erlebe echte Missionen",
    text: "Spannende Abenteuer in deiner Umgebung warten auf dich. Entdecke Neues.",
    icon: "⚑",
    accent: "orange",
    image: null,
  },
] as const;

const steps = [
  ["01", "Bewegen", "Schritte, Wege und Aktivitäten werden zu sichtbarem Fortschritt."],
  ["02", "Entdecken", "Missionen machen deine Umgebung und deinen Alltag spielbar."],
  ["03", "WFXP sammeln", "Ziele und abgeschlossene Missionen bringen Punkte und Level."],
  ["04", "Buddy pflegen", "Füttern, pflegen und trainieren – wie bei einem Tamagotchi."],
  ["05", "Freischalten", "Neue Fähigkeiten, Sammelobjekte und Erlebnisse werden zugänglich."],
] as const;

const experiences = [
  ["⌂", "Stadt-Abenteuer", "Historische Orte, Street Art und versteckte Ecken."],
  ["△", "Natur & Outdoor", "Wälder, Seen, Berge und aktive Entdeckungsrouten."],
  ["●", "Familienmissionen", "Gemeinsame Aufgaben und Abenteuer für Groß und Klein."],
  ["⌁", "Fitness-Challenges", "Schrittziele, Workouts und sanfte Bewegungsimpulse."],
  ["✚", "Community-Aktionen", "Gemeinsame Ziele und saisonale Gemeinschaftsmissionen."],
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
    <div className="relative mx-auto w-[248px] rotate-[2deg] rounded-[42px] border-[7px] border-[#17262b] bg-[#020a0d] p-2 shadow-[0_40px_80px_rgba(0,0,0,.65)] sm:w-[282px]">
      <div className="absolute left-1/2 top-3 z-10 h-6 w-24 -translate-x-1/2 rounded-full bg-black" />
      <div className="overflow-hidden rounded-[31px] border border-cyan-300/10 bg-[linear-gradient(180deg,#073b42,#031a20)] px-4 pb-4 pt-11">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] text-cyan-100/65">Hallo, Alex!</p>
            <p className="mt-1 text-3xl font-black text-[#ffd62f]">1.250 <span className="text-base text-white">WFXP</span></p>
          </div>
          <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-[10px] text-cyan-100">LV 12</span>
        </div>
        <div className="mt-3 h-1.5 rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-300 via-lime-300 to-[#ffd62f]" /></div>
        <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-[#031318]/75 p-4 shadow-inner">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-300">Aktive Mission</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div><p className="text-sm font-black">Waldpfad-Entdecker</p><p className="text-[10px] text-white/50">3 versteckte Orte</p></div>
            <strong className="text-xs text-[#ffd62f]">2/3</strong>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-lime-300" /></div>
          <p className="mt-2 text-[10px] font-black text-[#ffae2f]">+250 WFXP</p>
        </div>
        <p className="mt-4 text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Heute</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center">
          {[["7.842", "Schritte"], ["487", "kcal"], ["5,3", "km"]].map(([value, label]) => (
            <div key={label} className="rounded-xl border border-white/5 bg-white/[0.045] py-3">
              <p className="text-sm font-black">{value}</p><p className="text-[9px] text-white/45">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-lime-300/20 bg-lime-300/[0.06] p-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-cyan-300/10"><Image src="/buddy/luma.png" alt="Luma" fill sizes="48px" className="object-contain" /></div>
          <div className="min-w-0 flex-1"><p className="text-[9px] text-white/45">Dein Buddy</p><p className="text-sm font-black">Luma</p><div className="mt-1 h-1 rounded-full bg-white/10"><div className="h-full w-3/5 rounded-full bg-[#ffd62f]" /></div></div>
          <span className="text-[#ff9c28]">♥</span>
        </div>
        <div className="mt-4 flex justify-between border-t border-white/5 pt-3 text-[8px] text-white/38"><span>Entdecken</span><span>Missionen</span><span>Buddy</span><span>Fortschritt</span><span>Profil</span></div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      <p className="text-xs font-black uppercase tracking-[0.28em] text-[#ffd62f]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-cyan-50/68 sm:text-lg">{text}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="h-screen overflow-y-auto scroll-smooth bg-[#020c10] text-white">
      <LandingSessionRedirect />

      <header className="sticky top-0 z-50 border-b border-cyan-200/10 bg-[#020d12]/94 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1530px] items-center justify-between gap-5 px-5 py-3 lg:px-8">
          <Link href="/" className="relative h-20 w-32 shrink-0 sm:h-24 sm:w-40">
            <Image src="/logo.png" alt="WellFit" fill priority sizes="160px" className="object-contain object-left" />
          </Link>
          <nav className="hidden items-center gap-8 xl:flex">
            {navItems.map(([label, href]) => <a key={href} href={href} className="text-sm font-bold text-white/75 transition hover:text-cyan-300">{label}</a>)}
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden rounded-xl border border-cyan-200/15 px-3 py-2 text-sm text-white/65 sm:block">DE</span>
            <Link href="/login" className="rounded-xl border border-cyan-300/45 px-4 py-2.5 text-sm font-black text-cyan-50 transition hover:bg-cyan-300/10">Anmelden</Link>
            <Link href="/register" className="hidden rounded-xl bg-gradient-to-r from-[#ff8c1d] to-[#ffd62f] px-5 py-3 text-sm font-black text-[#1c2105] shadow-[0_12px_35px_rgba(255,153,30,.28)] transition hover:-translate-y-0.5 sm:block">Kostenlos starten</Link>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-cyan-300/10">
        <Image src="/login-bg.png" alt="Menschen in Bewegung" fill priority sizes="100vw" className="-z-30 object-cover object-center opacity-38" />
        <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_75%_38%,rgba(0,225,215,.23),transparent_31%),radial-gradient(circle_at_32%_70%,rgba(255,153,26,.15),transparent_30%),linear-gradient(90deg,#020d12_0%,rgba(2,28,34,.96)_38%,rgba(1,30,35,.62)_68%,#020d12_100%)]" />
        <div className="absolute inset-0 -z-10 opacity-25 [background-image:linear-gradient(rgba(99,255,244,.06)_1px,transparent_1px),linear-gradient(90deg,rgba(99,255,244,.06)_1px,transparent_1px)] [background-size:72px_72px]" />

        <div className="mx-auto grid min-h-[760px] max-w-[1530px] items-center gap-8 px-5 py-14 lg:grid-cols-[1.08fr_.92fr] lg:px-8 lg:py-16">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/25 bg-[#06262d]/80 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] text-cyan-200 shadow-lg backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#ffd62f] shadow-[0_0_18px_#ffd62f]" /> Move · Learn · Earn
            </div>
            <h1 className="mt-7 max-w-[790px] text-5xl font-black leading-[.98] tracking-[-.045em] text-white drop-shadow-[0_8px_28px_rgba(0,0,0,.7)] sm:text-7xl xl:text-[78px]">
              Willkommen bei WellFit.<br />Dein Abenteuer für <span className="bg-gradient-to-r from-[#f3e75a] via-[#ffb224] to-[#ff7d16] bg-clip-text text-transparent">Körper & Geist.</span>
            </h1>
            <div className="mt-5 h-1.5 w-64 rounded-full bg-gradient-to-r from-cyan-300 via-[#ffd62f] to-[#ff7d16] shadow-[0_0_25px_rgba(255,174,34,.35)]" />
            <p className="mt-7 max-w-2xl text-lg leading-8 text-cyan-50/82 sm:text-xl">
              Bewege dich im Alltag, entdecke spannende Missionen, sammle WFXP und entwickle deinen Buddy. So wird jede Bewegung zu einem Abenteuer.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="rounded-2xl bg-gradient-to-r from-[#ff8418] to-[#ffd62f] px-7 py-4 text-center text-lg font-black text-[#1d2206] shadow-[0_18px_50px_rgba(255,139,24,.34)] transition hover:-translate-y-1">Jetzt kostenlos starten →</Link>
              <a href="#so-funktionierts" className="rounded-2xl border border-cyan-300/55 bg-[#06252d]/75 px-7 py-4 text-center text-lg font-black text-cyan-50 backdrop-blur transition hover:bg-cyan-300/12">▶ So funktioniert’s</a>
            </div>
            <div className="mt-7 flex flex-col gap-4 text-sm sm:flex-row sm:gap-8">
              <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full border border-cyan-300/35 bg-cyan-300/10 text-2xl text-cyan-200">◇</span><div><p className="font-black text-cyan-200">Sicher & transparent</p><p className="text-white/50">Klare Einwilligungen und Kontrolle.</p></div></div>
              <div className="flex items-center gap-3"><span className="grid h-12 w-12 place-items-center rounded-full border border-[#ffd62f]/35 bg-[#ffd62f]/10 text-2xl text-[#ffd62f]">♧</span><div><p className="font-black text-[#ffe36c]">Für viele Lebenslagen</p><p className="text-white/50">Allein, mit Freunden oder Familie.</p></div></div>
            </div>
          </div>

          <div className="relative min-h-[590px]">
            <div className="absolute inset-x-0 bottom-8 top-6 rounded-[45%] bg-cyan-300/10 blur-3xl" />
            <div className="absolute bottom-3 left-0 z-20 w-[48%] sm:left-[2%]"><PhonePreview /></div>
            <div className="absolute bottom-0 right-[-3%] z-10 h-[520px] w-[62%] sm:h-[590px]">
              <Image src="/buddy/luma.png" alt="Luma, der WellFit Buddy" fill priority sizes="(max-width: 1024px) 45vw, 520px" className="object-contain object-bottom drop-shadow-[0_40px_60px_rgba(0,0,0,.55)]" />
            </div>
            <div className="absolute bottom-0 left-[22%] right-0 h-24 rounded-[100%] bg-cyan-300/20 blur-3xl" />
          </div>
        </div>

        <div className="mx-auto grid max-w-[1530px] gap-4 px-5 pb-12 md:grid-cols-2 xl:grid-cols-4 lg:px-8">
          {featureCards.map((card, index) => {
            const accent = card.accent === "gold" ? "border-[#d99b14]/55 from-[#392a08]/85" : card.accent === "green" ? "border-lime-400/35 from-[#173415]/80" : card.accent === "orange" ? "border-[#ff9b27]/45 from-[#3b210b]/85" : "border-cyan-300/35 from-[#073541]/85";
            return (
              <article key={card.title} className={`group relative min-h-64 overflow-hidden rounded-[28px] border bg-gradient-to-br ${accent} to-[#031419]/95 p-6 shadow-[0_22px_45px_rgba(0,0,0,.35)] transition hover:-translate-y-1`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_75%,rgba(37,230,218,.18),transparent_38%)]" />
                {card.image ? <div className="absolute bottom-[-12%] right-[-4%] h-[70%] w-[52%] opacity-85 transition group-hover:scale-105"><Image src={card.image} alt="" fill sizes="240px" className="object-contain object-bottom" /></div> : null}
                {index === 0 ? <div className="absolute bottom-5 right-4 text-[92px] font-black text-cyan-300/15">↗</div> : null}
                {index === 3 ? <div className="absolute bottom-2 right-4 text-[100px] text-[#ffb32f]/18">⌖</div> : null}
                <div className="relative z-10 max-w-[72%]">
                  <span className="grid h-14 w-14 place-items-center rounded-full border border-white/15 bg-black/20 text-lg font-black text-[#ffd62f]">{card.icon}</span>
                  <h2 className="mt-5 text-2xl font-black text-white">{card.title}</h2>
                  <p className="mt-3 text-sm leading-6 text-white/68">{card.text}</p>
                  <a href={index === 2 ? "#buddy" : index === 3 ? "#erlebnisse" : "#so-funktionierts"} className="mt-5 inline-flex text-sm font-black text-[#ffd62f]">Mehr erfahren ›</a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-b border-cyan-300/10 bg-[#020f14] px-5 py-12 lg:px-8">
        <div className="mx-auto max-w-[1530px]">
          <h2 className="text-3xl font-black">Was WellFit <span className="text-[#ff9b25]">besonders</span> macht</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["/buddy/luma.png", "Buddy wie ein Tamagotchi", "Dein Buddy wächst mit dir. Pflege ihn, spiele mit ihm und erschaffe eine einzigartige Verbindung."],
              [null, "Bürgermeister & Community", "Roadmap-Vorschau für lokale Checkpoints, Stadtaktionen und gemeinsame Community-Ziele."],
              [null, "Familienfreundliche Vision", "Gemeinsame Motivation für Erwachsene und Familien; Kinderfunktionen folgen erst nach gesonderter Freigabe."],
              [null, "Sichere Daten", "Datenminimierung, transparente Einwilligungen und klare Kontrolle über persönliche Angaben."],
            ].map(([image, title, text], index) => (
              <article key={title} className="relative overflow-hidden rounded-[24px] border border-cyan-300/22 bg-gradient-to-br from-[#07313a] to-[#031419] p-5">
                <div className="flex gap-4">
                  <div className="relative grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-cyan-300/25 bg-cyan-300/10 text-3xl text-cyan-200">
                    {image ? <Image src={image} alt="" fill sizes="80px" className="object-contain" /> : index === 1 ? "♛" : index === 2 ? "♧" : "▣"}
                  </div>
                  <div><h3 className={`text-lg font-black ${index === 1 ? "text-[#ffae2e]" : index === 2 ? "text-lime-300" : "text-cyan-200"}`}>{title}</h3><p className="mt-2 text-sm leading-6 text-white/62">{text}</p></div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="so-funktionierts" className="bg-[#03181f] px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="Einfach starten" title="So wird Alltag zu Fortschritt" text="WellFit verbindet Bewegung, reale Missionen, Buddy-Pflege und Belohnungen in einem klaren Kreislauf." />
        <div className="mx-auto grid max-w-[1530px] gap-4 lg:grid-cols-5">
          {steps.map(([number, title, text]) => <article key={number} className="rounded-3xl border border-cyan-300/15 bg-gradient-to-b from-cyan-300/[0.07] to-transparent p-6"><span className="text-xs font-black tracking-[.2em] text-cyan-300">{number}</span><h3 className="mt-7 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-white/58">{text}</p></article>)}
        </div>
      </section>

      <section id="erlebnisse" className="bg-[#041e26] px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="Die Welt wird dein Spielfeld" title="Erlebnisse, die dich nach draußen bringen" text="Von der Stadtmission bis zum Familienabenteuer verwandelt WellFit echte Orte und alltägliche Bewegung in spielbare Erlebnisse." />
        <div className="mx-auto grid max-w-[1530px] gap-4 md:grid-cols-2 xl:grid-cols-3">
          {experiences.map(([icon, title, text]) => <article key={title} className="rounded-3xl border border-cyan-300/15 bg-[radial-gradient(circle_at_85%_20%,rgba(0,220,211,.15),transparent_36%),linear-gradient(145deg,#07313a,#03161c)] p-6"><span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#ffd62f]/30 bg-[#ffd62f]/10 text-xl font-black text-[#ffd62f]">{icon}</span><h3 className="mt-7 text-2xl font-black">{title}</h3><p className="mt-3 leading-7 text-white/62">{text}</p></article>)}
        </div>
      </section>

      <section id="buddy" className="bg-[#02151b] px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-[1530px] items-center gap-12 lg:grid-cols-[.85fr_1.15fr]">
          <div className="relative mx-auto h-[420px] w-full max-w-[480px]"><div className="absolute inset-8 rounded-full bg-cyan-300/14 blur-3xl" /><Image src="/buddy/luma.png" alt="Luma, der WellFit Buddy" fill sizes="480px" className="object-contain drop-shadow-[0_35px_55px_rgba(0,0,0,.5)]" /></div>
          <div><p className="text-xs font-black uppercase tracking-[.28em] text-[#ffd62f]">Dein emotionaler Begleiter</p><h2 className="mt-4 text-4xl font-black sm:text-6xl">Dein Buddy lebt mit deinem <span className="text-[#ff9a27]">Fortschritt.</span></h2><p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">Dein Buddy reagiert auf Aktivität, Stimmung und Pflege. Du siehst ihn im Buddy-Bereich, auf dem Dashboard, in Missionen und in deiner Fortschrittsansicht.</p><div className="mt-8 grid gap-3 sm:grid-cols-4">{["Füttern", "Pflegen", "Trainieren", "Nachsehen"].map((item) => <div key={item} className="rounded-2xl border border-lime-300/20 bg-lime-300/[.06] p-4 text-center font-black text-lime-200">{item}</div>)}</div></div>
        </div>
      </section>

      <section id="fuer-wen" className="bg-[#031b22] px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="Für viele Lebenssituationen" title="Für mehr Menschen, als du denkst" text="WellFit passt Motivation, Intensität und Erlebnis an den Menschen an – nicht umgekehrt." />
        <div className="mx-auto grid max-w-[1530px] gap-4 md:grid-cols-2 xl:grid-cols-3">{audiences.map(([title, text], index) => <article key={title} className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[.045] p-6"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-300/10 font-black text-[#ffd62f]">{String(index + 1).padStart(2, "0")}</div><h3 className="mt-6 text-2xl font-black">{title}</h3><p className="mt-3 leading-7 text-white/60">{text}</p></article>)}</div>
      </section>

      <section id="sicherheit" className="bg-[#02151b] px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="Vertrauen als Grundlage" title="Sicherheit, die du kontrollierst" text="WellFit trennt bestehende Schutzmaßnahmen klar von geplanten Familien- und Community-Funktionen." />
        <div className="mx-auto grid max-w-[1530px] gap-4 md:grid-cols-2 xl:grid-cols-4">{[
          ["Datenschutz & DSGVO", "Datenminimierung, transparente Verarbeitung und klare Rechte."],
          ["Sichere Konten", "Geschützte Anmeldung und nachvollziehbare Berechtigungen."],
          ["Familienfunktionen geplant", "Elternkontrollen und Kinderprofile werden erst nach Prüfung freigegeben."],
          ["Faire Community geplant", "Öffentliche soziale Funktionen bleiben bis zur Moderationsfreigabe deaktiviert."],
        ].map(([title, text]) => <article key={title} className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[.045] p-6"><span className="grid h-14 w-14 place-items-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-2xl text-cyan-200">◇</span><h3 className="mt-6 text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-white/60">{text}</p></article>)}</div>
      </section>

      <section id="ueber-uns" className="bg-[radial-gradient(circle_at_75%_35%,rgba(0,214,204,.15),transparent_30%),linear-gradient(145deg,#041f27,#020f14)] px-5 py-20 lg:px-8">
        <div className="mx-auto grid max-w-[1530px] gap-12 lg:grid-cols-[1.1fr_.9fr]">
          <div><p className="text-xs font-black uppercase tracking-[.28em] text-[#ffd62f]">Warum es WellFit gibt</p><h2 className="mt-4 text-4xl font-black sm:text-6xl">Gemeinsam bewegen wir mehr.</h2><p className="mt-6 max-w-3xl text-lg leading-8 text-white/68">WellFit verbindet Gesundheit, Spiel, Lernen und Gemeinschaft. Bewegung soll sich nicht wie Pflicht anfühlen, sondern wie der Beginn einer persönlichen Geschichte.</p></div>
          <div className="flex items-center justify-center"><div className="relative h-72 w-72"><Image src="/buddy/luma.png" alt="WellFit Buddy" fill sizes="288px" className="object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,.5)]" /></div></div>
        </div>
      </section>

      <section className="bg-[#020d11] px-5 py-16 lg:px-8"><div className="mx-auto flex max-w-[1530px] flex-col items-center justify-between gap-8 rounded-[32px] border border-[#ffad2f]/30 bg-gradient-to-r from-[#0a3139] via-[#07313a] to-[#1d2b22] p-8 text-center lg:flex-row lg:text-left"><div><p className="text-sm font-black uppercase tracking-[.24em] text-[#ffd62f]">Dein erstes Abenteuer wartet</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">Bewegung, die sich nach Fortschritt anfühlt.</h2></div><Link href="/register" className="shrink-0 rounded-2xl bg-gradient-to-r from-[#ff8c1d] to-[#ffd62f] px-8 py-4 text-lg font-black text-[#172006]">Jetzt WellFit starten →</Link></div></section>

      <footer className="border-t border-white/8 bg-[#01090c] px-5 py-9 lg:px-8"><div className="mx-auto flex max-w-[1530px] flex-col items-center justify-between gap-5 text-sm text-white/45 sm:flex-row"><p>© WellFit · Earn Wellness</p><div className="flex flex-wrap justify-center gap-5"><Link href="/datenschutz">Datenschutz</Link><Link href="/impressum">Impressum</Link><Link href="/agb">AGB</Link><Link href="/hilfe">Hilfe</Link></div></div></footer>
    </main>
  );
}
