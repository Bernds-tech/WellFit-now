import Image from "next/image";
import { audiences, experiences, safetyCards, steps } from "./landingPublicData";
import { LandingSectionHeading, LandingToneIcon } from "./LandingPrimitivesV5";

const buddyProfiles = [
  ["🦊", "Fuchs", "Neugierig & clever", "Neue Wege entdecken"],
  ["🐯", "Tiger", "Mutig & fokussiert", "Herausforderungen meistern"],
  ["🐼", "Panda", "Ruhig & ausdauernd", "Gesunde Routinen aufbauen"],
  ["🐘", "Elefant", "Stark & verlässlich", "Gemeinsam dranbleiben"],
] as const;

const buddyLooks = [
  ["Basis", "Dein persönlicher Alltagsbegleiter"],
  ["Forscher", "Ausrüstung für Entdeckungen und Missionen"],
  ["Wächter", "Robuste Ausrüstung als öffentliche Design-Vorschau"],
] as const;

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

      <section id="buddy" className="relative overflow-hidden border-b border-cyan-300/10 bg-[#021218] px-5 py-20 lg:px-10">
        <div className="absolute left-[-10%] top-[12%] h-80 w-80 rounded-full bg-cyan-300/7 blur-[110px]" />
        <div className="absolute bottom-[-18%] right-[-4%] h-96 w-96 rounded-full bg-lime-300/6 blur-[130px]" />

        <div className="relative mx-auto max-w-[1420px]">
          <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_.92fr]">
            <div className="relative min-h-[470px] overflow-hidden rounded-[30px] border border-lime-300/20 bg-[radial-gradient(circle_at_70%_28%,rgba(163,230,53,.13),transparent_30%),linear-gradient(145deg,#07313a,#021218)] shadow-[0_28px_70px_rgba(0,0,0,.34)]">
              <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-[#020c10] via-[#020c10]/68 to-transparent" />
              <Image
                src="/landing/feature-buddy-care.svg"
                alt="Fuchs-Buddy neben einem Futternapf bei der Buddy-Pflege"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-contain object-bottom p-5 drop-shadow-[0_26px_45px_rgba(0,0,0,.42)] sm:p-8"
              />
              <div className="absolute left-5 top-5 rounded-full border border-[#ffd95d]/25 bg-[#081c21]/88 px-4 py-2 text-[10px] font-black uppercase tracking-[.2em] text-[#ffd95d] backdrop-blur-md">
                Öffentliche Buddy-Vorschau
              </div>
              <div className="absolute bottom-5 left-5 right-5 grid gap-2 sm:grid-cols-3">
                {buddyLooks.map(([title, text], index) => (
                  <div
                    key={title}
                    className={`rounded-xl border px-3 py-2.5 backdrop-blur-md ${
                      index === 1
                        ? "border-lime-300/30 bg-lime-300/10"
                        : "border-cyan-300/18 bg-[#03171d]/82"
                    }`}
                  >
                    <p className={index === 1 ? "text-xs font-black text-lime-200" : "text-xs font-black text-cyan-100"}>{title}</p>
                    <p className="mt-1 text-[9px] leading-4 text-white/55">{text}</p>
                  </div>
                ))}
              </div>
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

          <div className="mt-10">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.24em] text-cyan-300">Vier Charakterrichtungen</p>
                <h3 className="mt-2 text-2xl font-black tracking-[-.03em] text-white sm:text-3xl">Finde den Buddy, der zu dir passt.</h3>
              </div>
              <p className="max-w-xl text-xs leading-5 text-white/48">
                Fuchs, Tiger, Panda und Elefant zeigen die geplante visuelle Vielfalt. Auswahl, Rollen und Ausrüstungswechsel bleiben bis zur internen Produktfreigabe eine Design-Vorschau.
              </p>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {buddyProfiles.map(([icon, name, character, strength], index) => (
                <article
                  key={name}
                  className="group relative overflow-hidden rounded-2xl border border-cyan-300/16 bg-gradient-to-br from-[#07313a]/72 to-[#03161c] p-5 transition hover:-translate-y-1 hover:border-cyan-300/32"
                >
                  <div className="absolute right-[-18px] top-[-22px] h-28 w-28 rounded-full bg-cyan-300/6 blur-2xl transition group-hover:bg-cyan-300/11" />
                  <div className="relative flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-xl border border-cyan-300/22 bg-cyan-300/8 text-2xl">{icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-[.18em] text-white/30">0{index + 1}</span>
                  </div>
                  <h4 className="relative mt-4 text-lg font-black text-white">{name}</h4>
                  <p className="relative mt-1 text-xs font-semibold text-[#ffd95d]">{character}</p>
                  <p className="relative mt-3 text-xs leading-5 text-white/55">{strength}</p>
                </article>
              ))}
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
