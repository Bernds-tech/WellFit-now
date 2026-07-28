import Image from "next/image";
import Link from "next/link";
import { featureCards, highlights } from "./landingPublicData";
import { LandingToneIcon } from "./LandingPrimitivesV5";

const trustSignals = [
  ["◇", "Sicher & transparent", "DSGVO-orientiert"],
  ["◎", "Für viele Lebenslagen", "Allein oder gemeinsam"],
  ["♥", "Motivierend", "Spielerisch zum Ziel"],
] as const;

export default function LandingHeroV5() {
  return (
    <section
      data-landing-version="reference-v12-materialized-composite"
      data-hero-layout="scaled-right-stage"
      className="relative overflow-hidden border-b border-cyan-300/10 bg-[#020b0f]"
    >
      <div className="absolute inset-x-0 top-0 z-0 h-[760px] overflow-hidden bg-[#020b0f] sm:h-[720px] lg:h-[650px] xl:h-[700px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_38%,rgba(24,112,125,.20),transparent_49%)]" />
        <div
          className="absolute inset-y-0 right-[-38%] w-[160%] bg-cover bg-[position:62%_center] bg-no-repeat sm:right-[-20%] sm:w-[130%] sm:bg-[position:66%_center] lg:right-[2%] lg:w-[84%] lg:bg-[length:auto_88%] lg:bg-right xl:right-[3%] xl:w-[80%] xl:bg-[length:auto_86%]"
          style={{ backgroundImage: "url('/landing/hero-composite-v12.webp')" }}
          role="img"
          aria-label="WellFit Abenteuerlandschaft mit App und Fuchs-Buddy"
        />
      </div>
      <div className="absolute inset-x-0 top-0 z-10 h-[760px] bg-[linear-gradient(90deg,rgba(1,10,15,.96)_0%,rgba(2,15,20,.82)_30%,rgba(2,17,22,.34)_50%,rgba(2,13,17,.05)_73%,rgba(2,10,14,.12)_100%)] sm:h-[720px] lg:h-[650px] xl:h-[700px]" />
      <div className="absolute inset-x-0 top-[470px] z-10 h-[290px] bg-gradient-to-t from-[#020b0f] via-[#020b0f]/78 to-transparent sm:top-[430px] sm:h-[290px] lg:top-[390px] lg:h-[260px] xl:top-[430px] xl:h-[270px]" />

      <div className="relative z-20 mx-auto max-w-[1520px] px-4 pb-5 pt-4 sm:px-6 lg:px-10 lg:pt-5">
        <div className="grid min-h-[500px] items-center gap-4 lg:grid-cols-[.80fr_1.20fr] xl:min-h-[530px]">
          <div className="max-w-[620px] py-6 lg:py-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/45 bg-[#05242b]/82 px-4 py-2 text-[10px] font-black uppercase tracking-[0.29em] text-cyan-100 shadow-[0_0_26px_rgba(34,211,238,.13)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#73ffd9] shadow-[0_0_13px_#73ffd9]" />
              Move · Learn · Earn
            </div>

            <h1 className="mt-4 text-[40px] font-black leading-[.99] tracking-[-0.052em] text-white sm:text-[50px] lg:text-[56px] xl:text-[61px]">
              Willkommen bei WellFit.
              <br />
              Dein Abenteuer für{" "}
              <span className="bg-gradient-to-r from-[#ffe45d] via-[#ffb324] to-[#ff8217] bg-clip-text text-transparent">
                Körper & Geist.
              </span>
            </h1>

            <p className="mt-4 max-w-[580px] text-sm leading-6 text-cyan-50/86 sm:text-base sm:leading-7">
              Bewege dich im Alltag, entdecke Missionen, sammle WFXP und entwickle deinen persönlichen Buddy – allein oder gemeinsam.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-[#ff8618] to-[#ffd95d] px-7 py-3.5 text-center text-[15px] font-black text-[#172006] shadow-[0_15px_32px_rgba(255,139,24,.30)] transition hover:-translate-y-0.5"
              >
                Jetzt kostenlos starten →
              </Link>
              <a
                href="#so-funktionierts"
                className="rounded-xl border border-cyan-300/55 bg-[#031c23]/82 px-7 py-3.5 text-center text-[15px] font-black text-cyan-50 shadow-[0_12px_26px_rgba(0,0,0,.24)] transition hover:bg-cyan-300/10"
              >
                ▶ So funktioniert’s
              </a>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
              {trustSignals.map(([icon, title, text]) => (
                <div key={title} className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cyan-300/45 bg-[#03262d]/76 text-xs font-black text-cyan-200">
                    {icon}
                  </span>
                  <div>
                    <p className="text-[12px] font-black text-white">{title}</p>
                    <p className="text-[10px] text-white/58">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div aria-hidden="true" className="hidden min-h-[430px] lg:block" />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="group relative min-h-[172px] overflow-hidden rounded-2xl border border-cyan-300/24 bg-[#041b21]/90 shadow-[0_18px_42px_rgba(0,0,0,.30)]"
            >
              <Image
                src={card.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#021319]/98 via-[#03171d]/76 to-[#03171d]/5" />
              <div className="relative z-10 flex h-full max-w-[69%] flex-col p-4.5">
                <LandingToneIcon tone={card.tone}>{card.icon}</LandingToneIcon>
                <h2 className="mt-2.5 text-[17px] font-black leading-tight text-white">{card.title}</h2>
                <p className="mt-1.5 text-[11px] leading-[1.55] text-white/72">{card.text}</p>
                <a href={card.href} className="mt-auto pt-3 text-[11px] font-black text-[#ffd95d]">
                  Mehr erfahren →
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-300/38" />
            <h2 className="text-center text-xl font-black tracking-[-0.035em] sm:text-[27px]">
              Was WellFit <span className="text-[#ff9b25]">besonders</span> macht
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ffd95d]/42" />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map(([icon, title, text, tone]) => (
              <article
                key={title}
                className="flex min-h-[82px] items-center gap-3 rounded-2xl border border-cyan-300/20 bg-[#031a20]/86 px-4 py-3 backdrop-blur-md"
              >
                <LandingToneIcon tone={tone}>{icon}</LandingToneIcon>
                <div>
                  <h3 className="text-[13px] font-black leading-tight text-white">{title}</h3>
                  <p className="mt-1 text-[10px] leading-4 text-white/64">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <a href="#so-funktionierts" className="mx-auto mt-4 flex w-fit items-center gap-3 text-[13px] font-black text-white/94">
          <span>So funktioniert’s</span>
          <span className="hidden text-cyan-300 sm:inline">– In 5 einfachen Schritten zu mehr Wohlbefinden</span>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-cyan-300/50 text-cyan-200">⌄</span>
        </a>
      </div>
    </section>
  );
}
