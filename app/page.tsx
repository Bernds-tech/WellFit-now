import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import LandingSessionRedirect from "./components/landing/LandingSessionRedirect";

export const metadata: Metadata = {
  title: "WellFit – Deine Bewegung wird zum Abenteuer",
  description:
    "WellFit verbindet Bewegung, reale Missionen, einen persönlichen KI-Buddy und gemeinschaftliche Erlebnisse zu einem motivierenden Abenteuer.",
};

const navItems = [
  ["So funktioniert’s", "#so-funktionierts"],
  ["Erlebnisse", "#erlebnisse"],
  ["Dein Buddy", "#buddy"],
  ["Für wen", "#fuer-wen"],
  ["Sicherheit", "#sicherheit"],
  ["Über uns", "#ueber-uns"],
] as const;

const steps = [
  ["01", "↗", "Bewegen", "Schritte, Wege und Aktivitäten werden zu sichtbarem Fortschritt."],
  ["02", "⌖", "Entdecken", "Missionen machen deine Umgebung und deinen Alltag spielbar."],
  ["03", "W", "WFXP sammeln", "Ziele und abgeschlossene Missionen bringen Punkte und Level."],
  ["04", "♥", "Buddy pflegen", "Füttern, pflegen und trainieren – wie bei einem Tamagotchi."],
  ["05", "✦", "Freischalten", "Neue Fähigkeiten, Sammelobjekte und Erlebnisse werden zugänglich."],
] as const;

const experiences = [
  ["⌂", "Stadt-Abenteuer", "Historische Orte, Street Art und versteckte Ecken.", "+200 WFXP"],
  ["△", "Natur & Outdoor", "Wälder, Seen, Berge und aktive Entdeckungsrouten.", "+300 WFXP"],
  ["●", "Familienmissionen", "Gemeinsame Aufgaben und Abenteuer für Groß und Klein.", "+250 WFXP"],
  ["⌁", "Fitness-Challenges", "Schrittziele, Workouts und sanfte Bewegungsimpulse.", "+400 WFXP"],
  ["✚", "Community-Aktionen", "Gemeinsame Ziele und saisonale Gemeinschaftsmissionen.", "+350 WFXP"],
  ["♛", "Bürgermeister-System", "Geplante lokale Stadtaktionen und gemeinschaftliche Ziele.", "Vorschau"],
] as const;

const audiences = [
  ["Einzelpersonen", "Sanft starten und im Alltag dranbleiben."],
  ["Familien", "Gemeinsam aktiv sein und Erfolge teilen."],
  ["Kinder & Eltern", "Geplante altersgerechte Erlebnisse mit Familienkontrollen."],
  ["Freunde", "Challenges, gemeinsame Ziele und echte Erlebnisse."],
  ["Schulen & Vereine", "Bewegung, Lernen und Gemeinschaft verbinden."],
  ["Unternehmen & Städte", "Gesunde Teams und aktive lokale Communities."],
] as const;

function BuddyIllustration({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative mx-auto ${compact ? "h-52 w-52" : "h-[360px] w-[320px] sm:h-[440px] sm:w-[390px]"}`}>
      <div className="absolute inset-[8%] rounded-full bg-cyan-300/20 blur-3xl" />
      <svg viewBox="0 0 360 420" className="relative h-full w-full drop-shadow-[0_30px_45px_rgba(0,220,220,0.28)]" role="img" aria-label="Auri, der WellFit Fantasy-Buddy">
        <defs>
          <linearGradient id="body" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#57e1da"/><stop offset="0.55" stopColor="#0a8993"/><stop offset="1" stopColor="#03424d"/></linearGradient>
          <linearGradient id="accent" x1="0" x2="1"><stop offset="0" stopColor="#f6dc31"/><stop offset="1" stopColor="#ff8a1f"/></linearGradient>
          <radialGradient id="eye" cx="50%" cy="35%" r="65%"><stop offset="0" stopColor="#ffd75a"/><stop offset="0.48" stopColor="#b86612"/><stop offset="1" stopColor="#271407"/></radialGradient>
        </defs>
        <path d="M88 126C44 82 58 24 128 86C145 35 177 12 186 83C223 28 272 36 245 101C311 66 318 121 259 144Z" fill="url(#body)" stroke="#3de5dd" strokeWidth="4" />
        <path d="M105 108C83 61 103 49 137 93M151 87C159 39 178 35 181 89M208 91C240 43 258 62 233 111" fill="none" stroke="url(#accent)" strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="177" cy="177" rx="108" ry="94" fill="url(#body)" stroke="#45e1dc" strokeWidth="4" />
        <ellipse cx="132" cy="177" rx="34" ry="42" fill="#f8feff"/><ellipse cx="222" cy="177" rx="34" ry="42" fill="#f8feff"/>
        <ellipse cx="135" cy="183" rx="22" ry="29" fill="url(#eye)"/><ellipse cx="219" cy="183" rx="22" ry="29" fill="url(#eye)"/>
        <circle cx="128" cy="172" r="7" fill="white"/><circle cx="212" cy="172" r="7" fill="white"/>
        <path d="M150 236Q177 260 204 236" fill="#ff9468" stroke="#052d35" strokeWidth="4" strokeLinecap="round"/>
        <path d="M177 110L187 128L177 146L167 128Z" fill="#7afff6" stroke="#e2fffb" strokeWidth="3"/>
        <ellipse cx="177" cy="324" rx="83" ry="91" fill="url(#body)" stroke="#38c9c8" strokeWidth="4"/>
        <ellipse cx="111" cy="345" rx="29" ry="70" fill="url(#body)" transform="rotate(12 111 345)"/><ellipse cx="245" cy="345" rx="29" ry="70" fill="url(#body)" transform="rotate(-12 245 345)"/>
        <path d="M251 318C326 277 340 352 282 370C315 343 298 325 263 348Z" fill="url(#body)" stroke="#43dcd6" strokeWidth="4"/>
        <path d="M103 287Q177 345 251 287" fill="none" stroke="#092f36" strokeWidth="18"/>
        <circle cx="177" cy="322" r="37" fill="#092e35" stroke="url(#accent)" strokeWidth="6"/>
        <path d="M158 322H169L176 306L184 339L191 322H201" fill="none" stroke="#ffe33b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-cyan-300/30 bg-[#032a32]/90 px-4 py-2 text-xs font-bold tracking-[0.24em] text-cyan-100">AURI · LEVEL 12</div>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="relative mx-auto w-[275px] rounded-[42px] border-[7px] border-[#102d35] bg-[#041e25] p-3 shadow-[0_35px_80px_rgba(0,0,0,0.55)] sm:w-[305px]">
      <div className="mx-auto mb-4 h-6 w-28 rounded-full bg-black/75" />
      <div className="rounded-[28px] bg-gradient-to-b from-[#073c47] to-[#031b22] p-5">
        <div className="flex items-start justify-between"><div><p className="text-xs text-cyan-100/75">Hallo, Alex!</p><p className="mt-1 text-3xl font-black text-[#ffd630]">1.250 <span className="text-lg text-white">WFXP</span></p></div><span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-200">LV 12</span></div>
        <div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 via-lime-300 to-[#ffd630]" /></div>
        <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-black/20 p-4"><p className="text-[10px] font-bold tracking-[0.2em] text-cyan-300">AKTIVE MISSION</p><div className="mt-2 flex items-center justify-between"><div><p className="font-bold">Waldpfad-Entdecker</p><p className="text-xs text-white/60">3 versteckte Orte</p></div><span className="text-sm font-black text-[#ffd630]">2/3</span></div><div className="mt-3 h-1.5 rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-lime-300" /></div><p className="mt-2 text-xs font-bold text-[#ffad2f]">+250 WFXP</p></div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">{[["7.842","Schritte"],["487","kcal"],["5,3","km"]].map(([value,label]) => <div key={label} className="rounded-xl bg-white/5 px-2 py-3"><p className="font-black">{value}</p><p className="text-[10px] text-white/55">{label}</p></div>)}</div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-lime-300/20 bg-lime-300/5 p-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-300/15 text-xl">✦</div><div className="min-w-0 flex-1"><p className="text-xs text-white/55">Dein Buddy</p><p className="font-bold">Auri</p><div className="mt-1 h-1 rounded-full bg-white/10"><div className="h-full w-3/5 rounded-full bg-[#ffd630]" /></div></div><span className="text-[#ff9a26]">♥</span></div>
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return <div className="mx-auto mb-10 max-w-3xl text-center"><p className="text-xs font-black uppercase tracking-[0.28em] text-[#ffd630]">{eyebrow}</p><h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-5xl">{title}</h2><p className="mt-4 text-base leading-7 text-cyan-50/70 sm:text-lg">{text}</p></div>;
}

export default function Home() {
  return (
    <main className="h-screen overflow-y-auto scroll-smooth bg-[#020f14] text-white">
      <LandingSessionRedirect />
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(0,220,211,0.20),transparent_34%),radial-gradient(circle_at_18%_66%,rgba(255,150,25,0.12),transparent_28%),linear-gradient(145deg,#02151b_0%,#04323b_45%,#03161d_100%)]" />
        <header className="relative z-40 border-b border-cyan-200/10 bg-[#02151b]/85 backdrop-blur-xl"><div className="mx-auto flex max-w-[1480px] items-center justify-between gap-5 px-5 py-4 lg:px-8"><Link href="/" className="relative h-16 w-28 shrink-0 sm:h-20 sm:w-36"><Image src="/logo.png" alt="WellFit" fill priority sizes="144px" className="object-contain object-left" /></Link><nav className="hidden items-center gap-7 xl:flex">{navItems.map(([label,href]) => <a key={href} href={href} className="text-sm font-semibold text-white/78 transition hover:text-cyan-300">{label}</a>)}</nav><div className="flex items-center gap-2 sm:gap-3"><span className="hidden rounded-xl border border-cyan-200/15 px-3 py-2 text-sm text-white/70 sm:block">Deutsch</span><Link href="/login" className="rounded-xl border border-cyan-300/45 px-4 py-2.5 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300/10">Anmelden</Link><Link href="/register" className="hidden rounded-xl bg-gradient-to-r from-[#ff921f] to-[#ffd630] px-5 py-3 text-sm font-black text-[#172006] sm:block">Kostenlos starten</Link></div></div></header>
        <section className="relative z-10 mx-auto grid min-h-[760px] max-w-[1480px] items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20"><div><div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/7 px-4 py-2 text-xs font-black uppercase tracking-[0.23em] text-cyan-200"><span className="h-2 w-2 rounded-full bg-[#ffd630]" />Move · Learn · Earn</div><h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.045em] sm:text-7xl xl:text-[88px]">Deine Bewegung wird zum <span className="bg-gradient-to-r from-[#6ce8e0] via-[#ffd630] to-[#ff8d22] bg-clip-text text-transparent">Abenteuer.</span></h1><p className="mt-7 max-w-2xl text-lg leading-8 text-cyan-50/75 sm:text-xl">Entdecke Missionen in deiner Umgebung, sammle WFXP und entwickle deinen persönlichen Buddy – allein, mit Freunden oder mit deiner Familie.</p><div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="rounded-2xl bg-gradient-to-r from-[#ff8c1d] to-[#ffd630] px-7 py-4 text-center font-black text-[#172006]">Abenteuer starten →</Link><a href="#so-funktionierts" className="rounded-2xl border border-cyan-300/45 bg-cyan-300/5 px-7 py-4 text-center font-bold text-cyan-50">▶ So funktioniert WellFit</a></div></div><div className="relative grid items-end gap-1 sm:grid-cols-[1fr_.78fr]"><PhonePreview /><div className="relative -ml-10"><BuddyIllustration /></div></div></section>
      </div>

      <section id="so-funktionierts" className="bg-[#03181f] px-5 py-20 lg:px-8"><SectionHeading eyebrow="Einfach starten" title="So wird Alltag zu Fortschritt" text="WellFit verbindet Bewegung, reale Missionen, Buddy-Pflege und Belohnungen in einem verständlichen Kreislauf." /><div className="mx-auto grid max-w-[1480px] gap-4 lg:grid-cols-5">{steps.map(([number,icon,title,text]) => <article key={number} className="rounded-3xl border border-cyan-300/15 bg-gradient-to-b from-cyan-300/[0.07] to-transparent p-6"><div className="flex items-center justify-between"><span className="text-xs font-black tracking-[0.2em] text-cyan-300">{number}</span><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ffd630]/30 bg-[#ffd630]/10 text-xl font-black text-[#ffd630]">{icon}</span></div><h3 className="mt-7 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-white/58">{text}</p></article>)}</div><div className="mx-auto mt-12 grid max-w-[1480px] gap-5 lg:grid-cols-2"><article className="rounded-[32px] border border-[#ffad2f]/25 bg-gradient-to-br from-[#1c2a24] to-[#071a20] p-8"><p className="text-xs font-black uppercase tracking-[0.24em] text-[#ffb13b]">Roadmap-Vorschau · WellFit City</p><h3 className="mt-3 text-3xl font-black">Der Bürgermeister</h3><p className="mt-4 leading-7 text-white/68">Das geplante Bürgermeister-System soll lokale Missionen vorstellen, gemeinsame Stadtziele koordinieren und saisonale Community-Aktionen eröffnen. Diese Mechanik ist noch nicht Teil der aktuellen öffentlichen Beta.</p></article><article className="rounded-[32px] border border-lime-300/20 bg-gradient-to-br from-lime-300/[0.08] to-transparent p-8"><p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">Emotionale Motivation</p><h3 className="mt-3 text-3xl font-black">Wie dein Buddy lebt</h3><p className="mt-4 leading-7 text-white/68">Auri braucht deine Aufmerksamkeit wie ein Tamagotchi. Du fütterst, pflegst und trainierst ihn. Bewegung gibt Energie; regelmäßige Interaktion verbessert Stimmung, Level und Fähigkeiten.</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["🌱","Füttern"],["💧","Pflegen"],["🏋","Trainieren"],["♥","Nachsehen"]].map(([icon,title]) => <div key={title} className="rounded-2xl border border-lime-300/15 bg-black/15 p-4 text-center"><div className="text-2xl">{icon}</div><p className="mt-2 text-sm font-black">{title}</p></div>)}</div><p className="mt-5 text-sm text-cyan-100/60"><strong className="text-cyan-200">Du siehst ihn:</strong> im Buddy-Bereich, auf dem Dashboard, während Missionen und in der Fortschrittsansicht.</p></article></div></section>

      <section id="erlebnisse" className="bg-[#041e26] px-5 py-20 lg:px-8"><SectionHeading eyebrow="Die Welt wird dein Spielfeld" title="Erlebnisse, die dich nach draußen bringen" text="Von der Stadtmission bis zum Familienabenteuer: WellFit verwandelt echte Orte und alltägliche Bewegung in spielbare Erlebnisse." /><div className="mx-auto grid max-w-[1480px] gap-4 md:grid-cols-2 xl:grid-cols-3">{experiences.map(([icon,title,text,reward]) => <article key={title} className="min-h-64 rounded-3xl border border-cyan-300/15 bg-[radial-gradient(circle_at_80%_20%,rgba(0,220,211,.15),transparent_38%),linear-gradient(145deg,#07313a,#03161c)] p-6"><div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ffd630]/30 bg-[#ffd630]/10 text-xl font-black text-[#ffd630]">{icon}</span><span className="rounded-full bg-black/25 px-3 py-1 text-xs font-black text-[#ffb533]">{reward}</span></div><h3 className="mt-8 text-2xl font-black">{title}</h3><p className="mt-3 leading-7 text-white/62">{text}</p></article>)}</div></section>

      <section id="buddy" className="bg-[#02151b] px-5 py-20 lg:px-8"><div className="mx-auto grid max-w-[1480px] items-center gap-12 lg:grid-cols-[.9fr_1.1fr]"><BuddyIllustration /><div><p className="text-xs font-black uppercase tracking-[0.28em] text-[#ffd630]">Dein emotionaler Begleiter</p><h2 className="mt-4 text-4xl font-black sm:text-6xl">Dein Buddy lebt mit deinem <span className="text-[#ff9a27]">Fortschritt.</span></h2><p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">Auri reagiert auf Aktivität, Pflege und Missionen. Er entwickelt Stimmung, Energie, Level und Fähigkeiten und begleitet dich durch deine WellFit-Reise.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{[["Energie","85 / 100"],["Stimmung","Glücklich"],["Hunger","Leicht hungrig"],["Level","12"]].map(([title,value]) => <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex items-center justify-between"><span className="text-sm text-white/55">{title}</span><strong>{value}</strong></div><div className="mt-3 h-1.5 rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-300 to-[#ffd630]" /></div></div>)}</div></div></div></section>

      <section id="fuer-wen" className="bg-[#031b22] px-5 py-20 lg:px-8"><SectionHeading eyebrow="Für jede Lebenssituation" title="Für mehr Menschen, als du denkst" text="WellFit passt Motivation, Intensität und Erlebnis an den Menschen an – nicht umgekehrt." /><div className="mx-auto grid max-w-[1480px] gap-4 md:grid-cols-2 xl:grid-cols-3">{audiences.map(([title,text],index) => <article key={title} className="rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.065] to-transparent p-6"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 font-black text-[#ffd630]">{String(index+1).padStart(2,"0")}</div><h3 className="mt-6 text-2xl font-black">{title}</h3><p className="mt-3 leading-7 text-white/60">{text}</p></article>)}</div></section>

      <section id="sicherheit" className="bg-[#02151b] px-5 py-20 lg:px-8"><SectionHeading eyebrow="Vertrauen als Grundlage" title="Sicherheit, die mit dem Produkt wächst" text="Datenschutz und sichere Konten sind bereits Grundanforderungen. Elternkontrollen, Kinderprofile und öffentliche Community-Funktionen werden erst nach abgeschlossener rechtlicher und technischer Prüfung freigeschaltet." /><div className="mx-auto grid max-w-[1480px] gap-4 md:grid-cols-2 xl:grid-cols-4">{[["⌾","Datenschutz & DSGVO","Datenminimierung, transparente Verarbeitung und klare Rechte."],["▣","Sichere Konten","Geschützte Anmeldung und nachvollziehbare Berechtigungen."],["◉","Familienfunktionen geplant","Altersgerechte Inhalte und Elternkontrollen folgen nach Prüfung."],["♥","Community kontrolliert ausbauen","Öffentliche soziale Funktionen bleiben bis zur Freigabe begrenzt."]].map(([icon,title,text]) => <article key={title} className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.045] p-6"><span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-2xl text-cyan-200">{icon}</span><h3 className="mt-6 text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-white/60">{text}</p></article>)}</div></section>

      <section id="ueber-uns" className="bg-[radial-gradient(circle_at_75%_35%,rgba(0,214,204,.15),transparent_30%),linear-gradient(145deg,#041f27,#020f14)] px-5 py-20 lg:px-8"><div className="mx-auto grid max-w-[1480px] gap-10 lg:grid-cols-[1.1fr_.9fr]"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-[#ffd630]">Warum es WellFit gibt</p><h2 className="mt-4 text-4xl font-black sm:text-6xl">Gemeinsam bewegen wir mehr.</h2><p className="mt-6 max-w-3xl text-lg leading-8 text-white/68">WellFit verbindet Gesundheit, Spiel, Lernen und Gemeinschaft. Bewegung soll sich nicht wie Pflicht anfühlen, sondern wie der Beginn einer persönlichen Geschichte.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{[["Unsere Vision","Bewegung soll Freude machen und für alle zugänglich sein."],["Unsere Mission","Technologie soll Menschen in echte Erlebnisse führen."],["Unsere Werte","Gesundheit, Motivation, Respekt und Verantwortung."],["Unsere Welt","Missionen, Buddy und Community wachsen schrittweise zusammen."]].map(([title,text]) => <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5"><h3 className="font-black text-[#ffd86b]">{title}</h3><p className="mt-2 text-sm leading-6 text-white/58">{text}</p></article>)}</div></div><div className="flex items-center justify-center"><BuddyIllustration compact /></div></div></section>

      <section className="bg-[#020d11] px-5 py-16 lg:px-8"><div className="mx-auto flex max-w-[1480px] flex-col items-center justify-between gap-8 rounded-[32px] border border-[#ffad2f]/30 bg-gradient-to-r from-[#0a3139] via-[#07313a] to-[#1d2b22] p-8 text-center lg:flex-row lg:text-left"><div><p className="text-sm font-black uppercase tracking-[0.24em] text-[#ffd630]">Dein erstes Abenteuer wartet</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">Bewegung, die sich nach Fortschritt anfühlt.</h2><p className="mt-3 text-white/60">Kostenlos starten, Buddy kennenlernen und die ersten Missionen entdecken.</p></div><Link href="/register" className="shrink-0 rounded-2xl bg-gradient-to-r from-[#ff8c1d] to-[#ffd630] px-8 py-4 text-lg font-black text-[#172006]">Jetzt WellFit starten →</Link></div></section>
      <footer className="border-t border-white/8 bg-[#01090c] px-5 py-9 lg:px-8"><div className="mx-auto flex max-w-[1480px] flex-col items-center justify-between gap-5 text-sm text-white/45 sm:flex-row"><p>© WellFit · Earn Wellness</p><div className="flex flex-wrap justify-center gap-5"><Link href="/datenschutz">Datenschutz</Link><Link href="/impressum">Impressum</Link><Link href="/agb">AGB</Link><Link href="/hilfe">Hilfe</Link></div></div></footer>
    </main>
  );
}
