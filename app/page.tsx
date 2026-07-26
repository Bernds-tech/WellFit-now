import Image from "next/image";
import Link from "next/link";

const navItems = [
  ["So funktioniert’s", "#so-funktionierts"],
  ["Erlebnisse", "#erlebnisse"],
  ["Dein Buddy", "#buddy"],
  ["Für wen", "#fuer-wen"],
  ["Sicherheit", "#sicherheit"],
  ["Über uns", "#ueber-uns"],
] as const;

const steps = [
  { number: "01", icon: "↗", title: "Bewegen", text: "Schritte, Wege und Aktivitäten werden zu deinem Fortschritt." },
  { number: "02", icon: "⌖", title: "Entdecken", text: "Finde Missionen, reale Orte und neue Herausforderungen." },
  { number: "03", icon: "W", title: "WFXP sammeln", text: "Erreiche Ziele, schließe Missionen ab und steige im Level." },
  { number: "04", icon: "♥", title: "Buddy pflegen", text: "Füttere, trainiere und entwickle deinen Begleiter wie ein Tamagotchi." },
  { number: "05", icon: "✦", title: "Belohnt werden", text: "Schalte Fähigkeiten, Sammelobjekte und Erlebnisse frei." },
];

const experiences = [
  { icon: "⌂", title: "Stadt-Abenteuer", text: "Entdecke historische Orte, Street Art und versteckte Ecken.", reward: "+200 WFXP", tone: "cyan" },
  { icon: "△", title: "Natur & Outdoor", text: "Wälder, Seen, Berge und aktive Entdeckungsrouten.", reward: "+300 WFXP", tone: "green" },
  { icon: "●", title: "Familienmissionen", text: "Gemeinsame Aufgaben für Groß und Klein.", reward: "+250 WFXP", tone: "gold" },
  { icon: "⌁", title: "Fitness-Challenges", text: "Schrittziele, Workouts und sanfte Bewegungsimpulse.", reward: "+400 WFXP", tone: "orange" },
  { icon: "✚", title: "Community-Aktionen", text: "Gemeinsame Ziele, Stadtaktionen und saisonale Events.", reward: "+350 WFXP", tone: "cyan" },
  { icon: "♛", title: "Bürgermeister-Missionen", text: "Besondere Aktionen und lokale Gemeinschaftsziele.", reward: "+500 WFXP", tone: "gold" },
];

const audiences = [
  ["Einzelpersonen", "Sanft starten und im Alltag dranbleiben."],
  ["Familien", "Gemeinsam aktiv sein und Erfolge teilen."],
  ["Kinder & Eltern", "Spielerische Bewegung mit sicheren Familienfunktionen."],
  ["Freunde", "Challenges, gemeinsame Ziele und echte Erlebnisse."],
  ["Schulen & Vereine", "Bewegung, Lernen und Gemeinschaft verbinden."],
  ["Unternehmen & Städte", "Gesunde Teams und aktive lokale Communities."],
];

function BuddyIllustration({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative mx-auto ${compact ? "h-48 w-48" : "h-[340px] w-[300px] sm:h-[420px] sm:w-[370px]"}`} aria-label="WellFit Fantasy-Buddy Auri">
      <div className="absolute inset-[8%] rounded-full bg-cyan-300/20 blur-3xl" />
      <svg viewBox="0 0 360 420" className="relative h-full w-full drop-shadow-[0_30px_45px_rgba(0,220,220,0.28)]" role="img" aria-label="Auri, der WellFit Buddy">
        <defs>
          <linearGradient id="buddyBody" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#46d4d0" />
            <stop offset="0.55" stopColor="#087f89" />
            <stop offset="1" stopColor="#03424d" />
          </linearGradient>
          <linearGradient id="buddyAccent" x1="0" x2="1">
            <stop offset="0" stopColor="#f6dc31" />
            <stop offset="1" stopColor="#ff8a1f" />
          </linearGradient>
          <radialGradient id="eye" cx="50%" cy="35%" r="65%">
            <stop offset="0" stopColor="#ffd75a" />
            <stop offset="0.48" stopColor="#b86612" />
            <stop offset="1" stopColor="#271407" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M88 126C44 82 58 24 128 86C145 35 177 12 186 83C223 28 272 36 245 101C311 66 318 121 259 144Z" fill="url(#buddyBody)" stroke="#3de5dd" strokeWidth="4" />
        <path d="M105 108C83 61 103 49 137 93M151 87C159 39 178 35 181 89M208 91C240 43 258 62 233 111" fill="none" stroke="url(#buddyAccent)" strokeWidth="13" strokeLinecap="round" />
        <ellipse cx="177" cy="177" rx="108" ry="94" fill="url(#buddyBody)" stroke="#45e1dc" strokeWidth="4" />
        <path d="M83 166C46 139 42 188 80 199M274 165C317 137 322 188 280 202" fill="url(#buddyBody)" stroke="#45e1dc" strokeWidth="4" />
        <path d="M61 162L37 122L88 143ZM295 161L326 120L271 143Z" fill="url(#buddyAccent)" opacity="0.9" />
        <ellipse cx="132" cy="177" rx="34" ry="42" fill="#f8feff" />
        <ellipse cx="222" cy="177" rx="34" ry="42" fill="#f8feff" />
        <ellipse cx="135" cy="183" rx="22" ry="29" fill="url(#eye)" />
        <ellipse cx="219" cy="183" rx="22" ry="29" fill="url(#eye)" />
        <circle cx="128" cy="172" r="7" fill="white" /><circle cx="212" cy="172" r="7" fill="white" />
        <path d="M165 216Q177 228 189 216" fill="#073840" stroke="#052d35" strokeWidth="4" strokeLinecap="round" />
        <path d="M150 236Q177 260 204 236" fill="#ff9468" stroke="#052d35" strokeWidth="4" strokeLinecap="round" />
        <circle cx="177" cy="128" r="17" fill="#17dddf" opacity="0.35" filter="url(#glow)" />
        <path d="M177 110L187 128L177 146L167 128Z" fill="#7afff6" stroke="#e2fffb" strokeWidth="3" filter="url(#glow)" />
        <ellipse cx="177" cy="324" rx="83" ry="91" fill="url(#buddyBody)" stroke="#38c9c8" strokeWidth="4" />
        <ellipse cx="111" cy="345" rx="29" ry="70" fill="url(#buddyBody)" transform="rotate(12 111 345)" />
        <ellipse cx="245" cy="345" rx="29" ry="70" fill="url(#buddyBody)" transform="rotate(-12 245 345)" />
        <ellipse cx="135" cy="404" rx="46" ry="15" fill="#063945" />
        <ellipse cx="225" cy="404" rx="46" ry="15" fill="#063945" />
        <path d="M251 318C326 277 340 352 282 370C315 343 298 325 263 348Z" fill="url(#buddyBody)" stroke="#43dcd6" strokeWidth="4" />
        <path d="M103 287Q177 345 251 287" fill="none" stroke="#092f36" strokeWidth="18" />
        <circle cx="177" cy="322" r="37" fill="#092e35" stroke="url(#buddyAccent)" strokeWidth="6" />
        <circle cx="177" cy="322" r="25" fill="#05a3a8" stroke="#65fff2" strokeWidth="3" filter="url(#glow)" />
        <path d="M158 322H169L176 306L184 339L191 322H201" fill="none" stroke="#ffe33b" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-cyan-300/30 bg-[#032a32]/85 px-4 py-2 text-xs font-bold tracking-[0.24em] text-cyan-100 shadow-xl backdrop-blur">AURI · LEVEL 12</div>
    </div>
  );
}

function PhonePreview() {
  return (
    <div className="relative mx-auto w-[270px] rounded-[42px] border-[7px] border-[#102d35] bg-[#041e25] p-3 shadow-[0_35px_80px_rgba(0,0,0,0.55)] sm:w-[300px]">
      <div className="mx-auto mb-4 h-6 w-28 rounded-full bg-black/75" />
      <div className="rounded-[28px] bg-gradient-to-b from-[#073c47] to-[#031b22] p-5">
        <div className="flex items-start justify-between">
          <div><p className="text-xs text-cyan-100/75">Hallo, Alex!</p><p className="mt-1 text-3xl font-black text-[#ffd630]">1.250 <span className="text-lg text-white">WFXP</span></p></div>
          <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-2 py-1 text-xs text-cyan-200">LV 12</div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-white/10"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-cyan-400 via-lime-300 to-[#ffd630]" /></div>
        <div className="mt-5 rounded-2xl border border-cyan-300/20 bg-black/20 p-4">
          <p className="text-[10px] font-bold tracking-[0.2em] text-cyan-300">AKTIVE MISSION</p>
          <div className="mt-2 flex items-center justify-between"><div><p className="font-bold">Waldpfad-Entdecker</p><p className="text-xs text-white/60">3 versteckte Orte</p></div><span className="text-sm font-black text-[#ffd630]">2/3</span></div>
          <div className="mt-3 h-1.5 rounded-full bg-white/10"><div className="h-full w-2/3 rounded-full bg-lime-300" /></div>
          <p className="mt-2 text-xs font-bold text-[#ffad2f]">+250 WFXP</p>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          {[['7.842','Schritte'],['487','kcal'],['5,3','km']].map(([value,label]) => <div key={label} className="rounded-xl bg-white/5 px-2 py-3"><p className="font-black">{value}</p><p className="text-[10px] text-white/55">{label}</p></div>)}
        </div>
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-lime-300/20 bg-lime-300/5 p-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-300/15 text-xl">✦</div>
          <div className="min-w-0 flex-1"><p className="text-xs text-white/55">Dein Buddy</p><p className="font-bold">Auri</p><div className="mt-1 h-1 rounded-full bg-white/10"><div className="h-full w-3/5 rounded-full bg-[#ffd630]" /></div></div>
          <span className="text-[#ff9a26]">♥</span>
        </div>
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
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(0,220,211,0.20),transparent_34%),radial-gradient(circle_at_18%_66%,rgba(255,150,25,0.12),transparent_28%),linear-gradient(145deg,#02151b_0%,#04323b_45%,#03161d_100%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(90,255,246,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(90,255,246,.08)_1px,transparent_1px)] [background-size:64px_64px]" />

        <header className="relative z-40 border-b border-cyan-200/10 bg-[#02151b]/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-5 px-5 py-4 lg:px-8">
            <Link href="/" className="relative h-16 w-28 shrink-0 sm:h-20 sm:w-36"><Image src="/logo.png" alt="WellFit" fill priority sizes="144px" className="object-contain object-left" /></Link>
            <nav className="hidden items-center gap-7 xl:flex">{navItems.map(([label, href]) => <a key={href} href={href} className="text-sm font-semibold text-white/78 transition hover:text-cyan-300">{label}</a>)}</nav>
            <div className="flex items-center gap-2 sm:gap-3"><span className="hidden rounded-xl border border-cyan-200/15 px-3 py-2 text-sm text-white/70 sm:block">DE⌄</span><Link href="/login" className="rounded-xl border border-cyan-300/45 px-4 py-2.5 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300/10">Anmelden</Link><Link href="/register" className="hidden rounded-xl bg-gradient-to-r from-[#ff921f] to-[#ffd630] px-5 py-3 text-sm font-black text-[#172006] shadow-[0_12px_35px_rgba(255,153,30,.25)] transition hover:-translate-y-0.5 sm:block">Kostenlos starten</Link></div>
          </div>
        </header>

        <section className="relative z-10 mx-auto grid min-h-[760px] max-w-[1480px] items-center gap-12 px-5 py-16 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/20 bg-cyan-300/7 px-4 py-2 text-xs font-black uppercase tracking-[0.23em] text-cyan-200"><span className="h-2 w-2 rounded-full bg-[#ffd630] shadow-[0_0_18px_#ffd630]" /> Move · Learn · Earn</div>
            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.045em] sm:text-7xl xl:text-[88px]">Deine Bewegung wird zum <span className="bg-gradient-to-r from-[#6ce8e0] via-[#ffd630] to-[#ff8d22] bg-clip-text text-transparent">Abenteuer.</span></h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-cyan-50/75 sm:text-xl">Entdecke Missionen in deiner Umgebung, sammle WFXP und entwickle deinen persönlichen Buddy – allein, mit Freunden oder mit deiner Familie.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/register" className="rounded-2xl bg-gradient-to-r from-[#ff8c1d] to-[#ffd630] px-7 py-4 text-center font-black text-[#172006] shadow-[0_18px_50px_rgba(255,147,31,.28)] transition hover:-translate-y-1">Abenteuer starten →</Link><a href="#so-funktionierts" className="rounded-2xl border border-cyan-300/45 bg-cyan-300/5 px-7 py-4 text-center font-bold text-cyan-50 transition hover:bg-cyan-300/12">▶ So funktioniert WellFit</a></div>
            <div className="mt-9 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">{[["↗","Bewegt dich","im Alltag"],["W","Belohnt dich","mit WFXP"],["♥","Wächst mit dir","dein Buddy"]].map(([icon,title,sub]) => <div key={title} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-3"><span className="flex h-10 w-10 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-300/10 font-black text-[#ffd630]">{icon}</span><div><p className="text-sm font-bold">{title}</p><p className="text-xs text-white/50">{sub}</p></div></div>)}</div>
          </div>
          <div className="relative grid items-end gap-1 sm:grid-cols-[1fr_.78fr]"><div className="relative z-10"><PhonePreview /></div><div className="relative -ml-10"><BuddyIllustration /></div><div className="absolute -bottom-5 left-[18%] right-0 h-24 rounded-[100%] bg-cyan-300/16 blur-3xl" /></div>
        </section>
      </div>

      <section id="so-funktionierts" className="bg-[#03181f] px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="Einfach starten" title="So wird Alltag zu Fortschritt" text="WellFit verbindet Bewegung, reale Missionen, Buddy-Pflege und Belohnungen in einem verständlichen Kreislauf." />
        <div className="mx-auto grid max-w-[1480px] gap-4 lg:grid-cols-5">{steps.map((step) => <article key={step.number} className="group rounded-3xl border border-cyan-300/15 bg-gradient-to-b from-cyan-300/[0.07] to-transparent p-6 transition hover:-translate-y-1 hover:border-[#ffd630]/35"><div className="flex items-center justify-between"><span className="text-xs font-black tracking-[0.2em] text-cyan-300">{step.number}</span><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ffd630]/30 bg-[#ffd630]/10 text-xl font-black text-[#ffd630]">{step.icon}</span></div><h3 className="mt-7 text-xl font-black">{step.title}</h3><p className="mt-3 text-sm leading-6 text-white/58">{step.text}</p></article>)}</div>

        <div className="mx-auto mt-12 grid max-w-[1480px] gap-5 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-[32px] border border-[#ffad2f]/25 bg-gradient-to-br from-[#1c2a24] to-[#071a20] p-7 sm:p-9"><div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#ff9b25]/12 blur-3xl" /><p className="text-xs font-black uppercase tracking-[0.24em] text-[#ffb13b]">WellFit City</p><h3 className="mt-3 text-3xl font-black">Der Bürgermeister</h3><p className="mt-4 max-w-xl leading-7 text-white/68">Der Bürgermeister ist dein Wegweiser in WellFit City. Er stellt lokale Missionen vor, erklärt besondere Ereignisse, motiviert die Community und eröffnet Stadt- oder Saisonaktionen.</p><div className="mt-6 grid gap-3 sm:grid-cols-3">{["Neue Stadtmissionen","Gemeinsame Ziele","Saisonale Belohnungen"].map((item) => <div key={item} className="rounded-2xl border border-[#ffd630]/15 bg-[#ffd630]/5 p-4 text-sm font-bold text-[#ffe777]">✦ {item}</div>)}</div></article>
          <article className="rounded-[32px] border border-lime-300/20 bg-gradient-to-br from-lime-300/[0.08] to-transparent p-7 sm:p-9"><p className="text-xs font-black uppercase tracking-[0.24em] text-lime-300">Emotionale Motivation</p><h3 className="mt-3 text-3xl font-black">Wie dein Buddy lebt</h3><p className="mt-4 leading-7 text-white/68">Auri braucht deine Aufmerksamkeit wie ein Tamagotchi. Du fütterst, pflegst und trainierst ihn. Bewegung gibt Energie; regelmäßige Interaktion verbessert Stimmung, Level und Fähigkeiten.</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["🌱","Füttern"],["💧","Pflegen"],["🏋","Trainieren"],["♥","Nachsehen"]].map(([icon,title]) => <div key={title} className="rounded-2xl border border-lime-300/15 bg-black/15 p-4 text-center"><div className="text-2xl">{icon}</div><p className="mt-2 text-sm font-black">{title}</p></div>)}</div><p className="mt-5 text-sm text-cyan-100/60"><strong className="text-cyan-200">Du siehst ihn:</strong> im Buddy-Bereich, auf dem Dashboard, während Missionen und in deiner Fortschrittsansicht.</p></article>
        </div>
      </section>

      <section id="erlebnisse" className="bg-[#041e26] px-5 py-20 lg:px-8">
        <SectionHeading eyebrow="Die Welt wird dein Spielfeld" title="Erlebnisse, die dich nach draußen bringen" text="Von der Stadtmission bis zum Familienabenteuer: WellFit verwandelt echte Orte und alltägliche Bewegung in spielbare Erlebnisse." />
        <div className="mx-auto grid max-w-[1480px] gap-4 md:grid-cols-2 xl:grid-cols-3">{experiences.map((item) => <article key={item.title} className="relative min-h-64 overflow-hidden rounded-3xl border border-cyan-300/15 bg-[radial-gradient(circle_at_80%_20%,rgba(0,220,211,.15),transparent_38%),linear-gradient(145deg,#07313a,#03161c)] p-6"><div className="flex items-center justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#ffd630]/30 bg-[#ffd630]/10 text-xl font-black text-[#ffd630]">{item.icon}</span><span className="rounded-full bg-black/25 px-3 py-1 text-xs font-black text-[#ffb533]">{item.reward}</span></div><h3 className="mt-8 text-2xl font-black">{item.title}</h3><p className="mt-3 max-w-sm leading-7 text-white/62">{item.text}</p><div className="absolute bottom-0 right-0 h-28 w-36 rounded-tl-[100%] bg-gradient-to-tl from-cyan-300/15 to-transparent" /></article>)}</div>
      </section>

      <section id="buddy" className="bg-[#02151b] px-5 py-20 lg:px-8"><div className="mx-auto grid max-w-[1480px] items-center gap-12 lg:grid-cols-[.9fr_1.1fr]"><div><BuddyIllustration /></div><div><p className="text-xs font-black uppercase tracking-[0.28em] text-[#ffd630]">Dein emotionaler Begleiter</p><h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">Dein Buddy lebt mit deinem <span className="text-[#ff9a27]">Fortschritt.</span></h2><p className="mt-6 max-w-2xl text-lg leading-8 text-white/68">Auri ist kein dekorativer Avatar. Er reagiert auf deine Aktivität, entwickelt eine Stimmung, lernt Fähigkeiten und begleitet dich durch Missionen. Deine Pflege und deine reale Bewegung schreiben seine Geschichte.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{[["Energie","85 / 100","bg-lime-300"],["Stimmung","Glücklich","bg-cyan-300"],["Hunger","Leicht hungrig","bg-[#ffad2f]"],["Level","12","bg-[#ffd630]"]].map(([title,value,color]) => <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5"><div className="flex items-center justify-between"><span className="text-sm text-white/55">{title}</span><strong>{value}</strong></div><div className="mt-3 h-1.5 rounded-full bg-white/10"><div className={`h-full w-3/4 rounded-full ${color}`} /></div></div>)}</div><div className="mt-6 grid gap-3 sm:grid-cols-3">{["Outfits & individuelle Looks","Neue Fähigkeiten","Sammelobjekte & Erinnerungen"].map((item) => <div key={item} className="rounded-2xl border border-[#ffad2f]/20 bg-[#ffad2f]/5 p-4 text-sm font-bold text-[#ffd87b]">✦ {item}</div>)}</div></div></div></section>

      <section id="fuer-wen" className="bg-[#031b22] px-5 py-20 lg:px-8"><SectionHeading eyebrow="Für jede Lebenssituation" title="Für mehr Menschen, als du denkst" text="WellFit passt Motivation, Intensität und Erlebnis an den Menschen an – nicht umgekehrt." /><div className="mx-auto grid max-w-[1480px] gap-4 md:grid-cols-2 xl:grid-cols-3">{audiences.map(([title,text],index) => <article key={title} className="rounded-3xl border border-cyan-300/15 bg-gradient-to-br from-cyan-300/[0.065] to-transparent p-6"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300/20 to-lime-300/10 text-xl font-black text-[#ffd630]">{String(index+1).padStart(2,'0')}</div><h3 className="mt-6 text-2xl font-black">{title}</h3><p className="mt-3 leading-7 text-white/60">{text}</p></article>)}</div></section>

      <section id="sicherheit" className="bg-[#02151b] px-5 py-20 lg:px-8"><SectionHeading eyebrow="Vertrauen als Grundlage" title="Sicherheit, die du kontrollierst" text="Datenschutz, klare Einwilligungen, familienfreundliche Funktionen und verantwortungsvolle Motivation sind Teil des Produkts – nicht nur ein Footer-Link." /><div className="mx-auto grid max-w-[1480px] gap-4 md:grid-cols-2 xl:grid-cols-4">{[["⌾","Datenschutz & DSGVO","Datenminimierung, transparente Verarbeitung und klare Rechte."],["▣","Sichere Konten","Geschützte Anmeldung und nachvollziehbare Berechtigungen."],["◉","Familienfreundlich","Altersgerechte Inhalte und Kontrollmöglichkeiten für Eltern."],["♥","Faire Community","Respekt, Moderation und keine manipulativen Druckmechaniken."]].map(([icon,title,text]) => <article key={title} className="rounded-3xl border border-cyan-300/15 bg-cyan-300/[0.045] p-6"><span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/25 bg-cyan-300/10 text-2xl text-cyan-200">{icon}</span><h3 className="mt-6 text-xl font-black">{title}</h3><p className="mt-3 leading-7 text-white/60">{text}</p></article>)}</div></section>

      <section id="ueber-uns" className="bg-[radial-gradient(circle_at_75%_35%,rgba(0,214,204,.15),transparent_30%),linear-gradient(145deg,#041f27,#020f14)] px-5 py-20 lg:px-8"><div className="mx-auto grid max-w-[1480px] gap-10 lg:grid-cols-[1.1fr_.9fr]"><div><p className="text-xs font-black uppercase tracking-[0.28em] text-[#ffd630]">Warum es WellFit gibt</p><h2 className="mt-4 text-4xl font-black sm:text-6xl">Gemeinsam bewegen wir mehr.</h2><p className="mt-6 max-w-3xl text-lg leading-8 text-white/68">WellFit verbindet Gesundheit, Spiel, Lernen und Gemeinschaft. Die Plattform soll Bewegung nicht wie Pflicht wirken lassen, sondern wie der Beginn einer persönlichen Geschichte – mit realen Erlebnissen, einem Buddy, der mitwächst, und einer Community, die gemeinsam Ziele erreicht.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{[["Unsere Vision","Eine Welt, in der Bewegung Freude macht und für alle zugänglich ist."],["Unsere Mission","Technologie so einsetzen, dass sie Menschen aus dem Bildschirm in echte Erlebnisse führt."],["Unsere Werte","Gesundheit, Motivation, Respekt, Transparenz und Verantwortung."],["Unsere Welt","WellFit City verbindet Missionen, Bürgermeister-Aktionen und Community-Ziele."]].map(([title,text]) => <article key={title} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5"><h3 className="font-black text-[#ffd86b]">{title}</h3><p className="mt-2 text-sm leading-6 text-white/58">{text}</p></article>)}</div></div><div className="flex items-center justify-center"><BuddyIllustration compact /></div></div></section>

      <section className="bg-[#020d11] px-5 py-16 lg:px-8"><div className="mx-auto flex max-w-[1480px] flex-col items-center justify-between gap-8 rounded-[32px] border border-[#ffad2f]/30 bg-gradient-to-r from-[#0a3139] via-[#07313a] to-[#1d2b22] p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,.3)] lg:flex-row lg:text-left"><div><p className="text-sm font-black uppercase tracking-[0.24em] text-[#ffd630]">Dein erstes Abenteuer wartet</p><h2 className="mt-3 text-3xl font-black sm:text-5xl">Bewegung, die sich nach Fortschritt anfühlt.</h2><p className="mt-3 text-white/60">Kostenlos starten, Buddy kennenlernen und die ersten Missionen entdecken.</p></div><Link href="/register" className="shrink-0 rounded-2xl bg-gradient-to-r from-[#ff8c1d] to-[#ffd630] px-8 py-4 text-lg font-black text-[#172006] shadow-[0_18px_50px_rgba(255,147,31,.28)]">Jetzt WellFit starten →</Link></div></section>

      <footer className="border-t border-white/8 bg-[#01090c] px-5 py-9 lg:px-8"><div className="mx-auto flex max-w-[1480px] flex-col items-center justify-between gap-5 text-sm text-white/45 sm:flex-row"><p>© WellFit · Earn Wellness</p><div className="flex flex-wrap justify-center gap-5"><Link href="/datenschutz">Datenschutz</Link><Link href="/impressum">Impressum</Link><Link href="/agb">AGB</Link><Link href="/hilfe">Hilfe</Link></div></div></footer>
    </main>
  );
}
