import Image from "next/image";
import { audiences, experiences, safetyCards, steps } from "./landingPublicData";
import { LandingSectionHeading, LandingToneIcon } from "./LandingPrimitivesV5";

export default function LandingSectionsV5() {
  return (
    <>
      <section id="so-funktionierts" className="border-b border-cyan-300/10 bg-[#03151b] px-5 py-20 lg:px-10">
        <LandingSectionHeading
          eyebrow="Einfach starten"
          title="So wird Alltag zu Fortschritt"
          text="Bewegung, Missionen, WFXP und Buddy-Pflege greifen in einem verständlichen Ablauf ineinander."
        />
        <div className="mx-auto grid max-w-[1420px] gap-4 lg:grid-cols-5">
          {steps.map(([number, title, text, icon], index) => (
            <article
              key={number}
              className="relative rounded-2xl border border-cyan-300/16 bg-gradient-to-br from-[#07313a]/80 to-[#03161c] p-5 shadow-[0_16px_36px_rgba(0,0,0,.18)]"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-full border border-cyan-300/45 bg-cyan-300/10 text-sm font-black text-cyan-100">
                  {number}
                </span>
                <span className="text-xl text-[#ffd95d]">{icon}</span>
              </div>
              <h3 className="mt-5 text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/62">{text}</p>
              {index < steps.length - 1 ? (
                <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-2xl text-cyan-300 lg:block">→</span>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section id="erlebnisse" className="border-b border-cyan-300/10 bg-[#041b22] px-5 py-20 lg:px-10">
        <LandingSectionHeading
          eyebrow="Die Welt wird dein Spielfeld"
          title="Erlebnisse, die dich nach draußen bringen"
          text="WellFit verbindet reale Orte, Bewegung und spielerische Aufgaben zu persönlichen Abenteuern."
        />
        <div className="mx-auto grid max-w-[1420px] gap-4 md:grid-cols-2 xl:grid-cols-3">
          {experiences.map(([icon, title, text], index) => (
            <article
              key={title}
              className="group relative min-h-[220px] overflow-hidden rounded-2xl border border-cyan-300/16 bg-[#03161c]"
            >
              <Image
                src={index % 3 === 1 ? "/landing/feature-movement.svg" : "/landing/feature-missions.svg"}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover opacity-60 transition duration-500 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#03161c]/96 via-[#03161c]/78 to-transparent" />
              <div className="relative z-10 max-w-[72%] p-6">
                <LandingToneIcon tone={index === 5 ? "amber" : "cyan"}>{icon}</LandingToneIcon>
                <h3 className="mt-4 text-xl font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/68">{text}</p>
                {index === 5 ? (
                  <p className="mt-3 text-[10px] font-black uppercase tracking-[.18em] text-[#ffd95d]">Roadmap-Vorschau</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="buddy" className="border-b border-cyan-300/10 bg-[#021218] px-5 py-20 lg:px-10">
        <div className="mx-auto grid max-w-[1420px] items-center gap-10 lg:grid-cols-[1.08fr_.92fr]">
          <div className="relative min-h-[440px] overflow-hidden rounded-[28px] border border-lime-300/18 shadow-[0_24px_60px_rgba(0,0,0,.3)]">
            <Image
              src="/landing/feature-buddy-care.svg"
              alt="WellFit Buddy bei der Pflege"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#021218]/35" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.28em] text-[#ffd95d]">Dein emotionaler Begleiter</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">
              Dein Buddy lebt mit deinem <span className="text-[#ff9a27]">Fortschritt.</span>
            </h2>
            <p className="mt-5 text-base leading-8 text-white/68">
              Wie bei einem Tamagotchi braucht dein Buddy Aufmerksamkeit. Bewegung und Missionen geben Fortschritt; Pflege stärkt Energie, Stimmung und eure Verbindung.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                ["Füttern", "Energie auffüllen"],
                ["Pflegen", "Stimmung verbessern"],
                ["Trainieren", "Entwicklung fördern"],
                ["Nachsehen", "Status und Bedürfnisse erkennen"],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl border border-lime-300/18 bg-lime-300/[.045] p-4">
                  <p className="font-black text-lime-200">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/58">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-cyan-300/18 bg-cyan-300/[.045] p-5">
              <p className="text-sm font-black text-cyan-100">Wo du deinen Buddy siehst</p>
              <p className="mt-2 text-sm leading-6 text-white/62">
                Im Buddy-Bereich, auf dem Dashboard, während Missionen und in deiner Fortschrittsansicht.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="fuer-wen" className="border-b border-cyan-300/10 bg-[#031820] px-5 py-20 lg:px-10">
        <LandingSectionHeading
          eyebrow="Für viele Lebenssituationen"
          title="Für mehr Menschen, als du denkst"
          text="WellFit soll Motivation und Intensität an unterschiedliche Menschen und Alltagssituationen anpassen."
        />
        <div className="mx-auto grid max-w-[1420px] gap-4 md:grid-cols-2 xl:grid-cols-3">
          {audiences.map(([number, title, text]) => (
            <article
              key={title}
              className="rounded-2xl border border-cyan-300/16 bg-gradient-to-br from-[#07313a]/65 to-[#03161c] p-6"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/35 bg-cyan-300/10 text-xs font-black text-[#ffd95d]">
                {number}
              </span>
              <h3 className="mt-5 text-xl font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/62">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="sicherheit" className="border-b border-cyan-300/10 bg-[#021218] px-5 py-20 lg:px-10">
        <div className="mx-auto grid max-w-[1420px] items-center gap-10 lg:grid-cols-[.88fr_1.12fr]">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.28em] text-[#ffd95d]">Vertrauen als Grundlage</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Sicherheit, die du kontrollierst.</h2>
            <p className="mt-5 text-base leading-8 text-white/68">
              Bestehende Schutzmaßnahmen und geplante Funktionen bleiben klar getrennt. WellFit soll verständlich erklären, was aktiv ist und was erst nach Prüfung kommt.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {safetyCards.map(([icon, title, text]) => (
                <article key={title} className="rounded-2xl border border-cyan-300/16 bg-cyan-300/[.04] p-5">
                  <LandingToneIcon tone="cyan">{icon}</LandingToneIcon>
                  <h3 className="mt-4 font-black">{title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/60">{text}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="relative min-h-[470px] overflow-hidden rounded-[28px] border border-cyan-300/18 shadow-[0_24px_60px_rgba(0,0,0,.3)]">
            <Image
              src="/landing/feature-wfxp.svg"
              alt="WellFit Sicherheit und Datenschutz"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section id="ueber-uns" className="bg-[#03151b] px-5 py-20 lg:px-10">
        <div className="mx-auto grid max-w-[1420px] items-center gap-10 lg:grid-cols-[1.08fr_.92fr]">
          <div className="relative min-h-[430px] overflow-hidden rounded-[28px] border border-amber-300/16 shadow-[0_24px_60px_rgba(0,0,0,.3)]">
            <Image
              src="/landing/feature-missions.svg"
              alt="Gemeinsame WellFit Community"
              fill
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[.28em] text-[#ffd95d]">Warum es WellFit gibt</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-.04em] sm:text-5xl">Gemeinsam bewegen wir mehr.</h2>
            <p className="mt-5 text-base leading-8 text-white/68">
              WellFit verbindet Bewegung, Spiel, Lernen und Gemeinschaft. Aktivität soll sich nicht wie eine Pflicht anfühlen, sondern wie der Beginn einer persönlichen Geschichte.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                ["Bewegung", "Alltag wird zu Fortschritt"],
                ["Erlebnis", "Reale Orte werden spielbar"],
                ["Verbindung", "Buddy und Menschen motivieren"],
                ["Entwicklung", "Kleine Erfolge werden sichtbar"],
              ].map(([title, text]) => (
                <div key={title} className="rounded-xl border border-amber-300/16 bg-amber-300/[.04] p-4">
                  <p className="font-black text-[#ffd95d]">{title}</p>
                  <p className="mt-1 text-xs text-white/58">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
