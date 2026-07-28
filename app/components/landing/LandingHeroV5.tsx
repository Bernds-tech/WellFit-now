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
      data-hero-layout="bright-cinematic-stage"
      className="relative overflow-hidden border-b border-cyan-200/20 bg-[#03141a]"
    >
      <div className="absolute inset-x-0 top-0 z-0 h-[620px] overflow-hidden bg-[#06232c] sm:h-[600px] lg:h-[560px] xl:h-[590px]">
        <div
          className="absolute inset-y-0 right-[-32%] w-[154%] bg-cover bg-[position:62%_center] bg-no-repeat sm:right-[-16%] sm:w-[125%] sm:bg-[position:65%_center] lg:right-0 lg:w-[100%] lg:bg-cover lg:bg-center xl:right-0 xl:w-[100%]"
          style={{
            backgroundImage: "url('/landing/hero-composite-v12.webp')",
            filter: "brightness(1.28) saturate(1.24) contrast(1.02)",
          }}
          role="img"
          aria-label="WellFit Abenteuerlandschaft mit App und Fuchs-Buddy"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_76%_23%,rgba(255,202,84,.26),transparent_30%),radial-gradient(circle_at_45%_48%,rgba(50,205,220,.18),transparent_36%)]" />
      </div>

      <div className="absolute inset-x-0 top-0 z-10 h-[620px] bg-[linear-gradient(90deg,rgba(2,19,27,.91)_0%,rgba(3,28,37,.76)_27%,rgba(3,34,42,.38)_46%,rgba(2,27,34,.08)_69%,rgba(1,14,19,.04)_100%)] sm:h-[600px] lg:h-[560px] xl:h-[590px]" />
      <div className="absolute inset-x-0 top-[400px] z-10 h-[220px] bg-gradient-to-t from-[#03141a] via-[#03141a]/62 to-transparent sm:top-[380px] sm:h-[220px] lg:top-[350px] lg:h-[210px] xl:top-[370px] xl:h-[220px]" />
      <div className="absolute left-[-8%] top-[12%] z-10 h-[360px] w-[760px] rounded-full bg-cyan-400/[0.055] blur-3xl" />

      <div className="relative z-20 mx-auto max-w-[1520px] px-4 pb-5 pt-3 sm:px-6 lg:px-10 lg:pt-4">
        <div className="grid min-h-[430px] items-center gap-4 lg:grid-cols-[.80fr_1.20fr] xl:min-h-[450px]">
          <div className="max-w-[620px] py-4 lg:py-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/55 bg-[#07323b]/78 px-4 py-2 text-[10px] font-black uppercase tracking-[0.29em] text-cyan-50 shadow-[0_0_28px_rgba(75,234,246,.19)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#78ffe1] shadow-[0_0_14px_#78ffe1]" />
              Move · Learn · Earn
            </div>

            <h1 className="mt-4 text-[40px] font-black leading-[.97] tracking-[-0.052em] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,.36)] sm:text-[49px] lg:text-[54px] xl:text-[59px]">
              Willkommen bei WellFit.
              <br />
              Dein Abenteuer für{" "}
              <span className="bg-gradient-to-r from-[#fff06a] via-[#ffbd2e] to-[#ff8618] bg-clip-text text-transparent">
                Körper & Geist.
              </span>
            </h1>

            <p className="mt-4 max-w-[580px] text-sm font-medium leading-6 text-cyan-50/92 drop-shadow-[0_2px_10px_rgba(0,0,0,.45)] sm:text-base sm:leading-7">
              Bewege dich im Alltag, entdecke Missionen, sammle WFXP und entwickle deinen persönlichen Buddy – allein oder gemeinsam.
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl border border-[#ffe26a]/60 bg-gradient-to-r from-[#ff8a18] via-[#ffb326] to-[#ffe15a] px-7 py-3.5 text-center text-[15px] font-black text-[#172006] shadow-[0_15px_34px_rgba(255,157,31,.40)] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Jetzt kostenlos starten →
              </Link>
              <a
                href="#so-funktionierts"
                className="rounded-xl border border-cyan-200/70 bg-[#06313b]/76 px-7 py-3.5 text-center text-[15px] font-black text-cyan-50 shadow-[0_12px_28px_rgba(0,0,0,.24)] backdrop-blur-md transition hover:bg-cyan-200/16"
              >
                ▶ So funktioniert’s
              </a>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
              {trustSignals.map(([icon, title, text]) => (
                <div key={title} className="flex items-center gap-2.5 rounded-xl bg-[#05242c]/42 pr-2 backdrop-blur-[2px]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cyan-200/55 bg-cyan-300/14 text-xs font-black text-cyan-100 shadow-[0_0_18px_rgba(59,224,236,.12)]">
                    {icon}
                  </span>
                  <div>
                    <p className="text-[12px] font-black text-white">{title}</p>
                    <p className="text-[10px] text-white/72">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div aria-hidden="true" className="hidden min-h-[380px] lg:block" />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="group relative min-h-[180px] overflow-hidden rounded-[20px] border border-cyan-200/45 bg-[#07313a]/88 shadow-[0_18px_46px_rgba(0,0,0,.30),0_0_28px_rgba(34,211,238,.07)]"
            >
              <Image
                src={card.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-[1.035]"
                style={{ filter: "brightness(1.18) saturate(1.22) contrast(1.03)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#03171d]/90 via-[#06252d]/58 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#021319]/52 via-transparent to-white/[0.025]" />
              <div className="relative z-10 flex h-full max-w-[70%] flex-col p-4.5">
                <LandingToneIcon tone={card.tone}>{card.icon}</LandingToneIcon>
                <h2 className="mt-2.5 text-[18px] font-black leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,.55)]">{card.title}</h2>
                <p className="mt-1.5 text-[11px] font-medium leading-[1.55] text-white/84">{card.text}</p>
                <a href={card.href} className="mt-auto pt-3 text-[11px] font-black text-[#ffe25d] drop-shadow-[0_1px_5px_rgba(0,0,0,.5)]">
                  Mehr erfahren →
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 rounded-[26px] border border-cyan-200/18 bg-[linear-gradient(180deg,rgba(7,41,49,.68),rgba(2,18,24,.78))] px-3 pb-3 pt-2 shadow-[0_18px_42px_rgba(0,0,0,.24)] backdrop-blur-sm sm:px-4">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-200/55" />
            <h2 className="text-center text-xl font-black tracking-[-0.035em] text-white sm:text-[27px]">
              Was WellFit <span className="text-[#ffae2d]">besonders</span> macht
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ffe25d]/55" />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map(([icon, title, text, tone]) => (
              <article
                key={title}
                className="flex min-h-[82px] items-center gap-3 rounded-2xl border border-cyan-200/32 bg-[#06323a]/82 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,.05)] backdrop-blur-md"
              >
                <LandingToneIcon tone={tone}>{icon}</LandingToneIcon>
                <div>
                  <h3 className="text-[13px] font-black leading-tight text-white">{title}</h3>
                  <p className="mt-1 text-[10px] leading-4 text-white/76">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <a href="#so-funktionierts" className="mx-auto mt-4 flex w-fit items-center gap-3 text-[13px] font-black text-white/96">
          <span>So funktioniert’s</span>
          <span className="hidden text-cyan-200 sm:inline">– In 5 einfachen Schritten zu mehr Wohlbefinden</span>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-cyan-200/65 bg-cyan-300/10 text-cyan-100">⌄</span>
        </a>
      </div>
    </section>
  );
}
