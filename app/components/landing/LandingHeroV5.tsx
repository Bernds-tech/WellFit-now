import Image from "next/image";
import Link from "next/link";
import { featureCards, highlights } from "./landingPublicData";
import { LandingToneIcon } from "./LandingPrimitivesV5";

const trustSignals = [
  ["◇", "Sicher & transparent", "DSGVO-orientiert"],
  ["◎", "Für viele Lebenslagen", "Allein oder gemeinsam"],
  ["♥", "Motivierend", "Spielerisch zum Ziel"],
] as const;

const missionSigns = ["Missionen", "Community", "WFXP", "Abenteuer"] as const;

export default function LandingHeroV5() {
  return (
    <section
      data-landing-version="reference-v12-materialized-composite"
      data-hero-layout="layered-luma-v14"
      className="relative isolate overflow-hidden border-b border-cyan-100/25 bg-[#03141a]"
    >
      <div className="absolute inset-x-0 top-0 -z-30 h-[700px] overflow-hidden bg-[#0b3540] sm:h-[660px] lg:h-[620px] xl:h-[650px]">
        <div
          className="absolute inset-0 bg-cover bg-[position:58%_center] bg-no-repeat sm:bg-[position:61%_center] lg:bg-center"
          style={{
            backgroundImage: "url('/landing/hero-composite-v12.webp')",
            filter: "brightness(1.42) saturate(1.30) contrast(.94)",
            transform: "scale(1.035)",
          }}
          role="img"
          aria-label="Helle WellFit Abenteuerlandschaft mit Smartphone"
        />
        <div className="absolute inset-y-0 right-0 w-[42%] bg-[radial-gradient(circle_at_62%_38%,rgba(255,224,132,.72)_0%,rgba(58,126,86,.65)_34%,rgba(9,49,55,.75)_61%,rgba(4,25,31,.22)_82%,transparent_100%)] backdrop-blur-[1px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_31%,rgba(121,239,242,.18),transparent_32%),radial-gradient(circle_at_83%_19%,rgba(255,211,91,.32),transparent_28%)]" />
      </div>

      <div className="absolute inset-x-0 top-0 -z-20 h-[700px] bg-[linear-gradient(90deg,rgba(2,16,22,.86)_0%,rgba(2,25,32,.66)_24%,rgba(2,33,40,.31)_42%,rgba(2,28,34,.06)_60%,rgba(2,16,20,.02)_100%)] sm:h-[660px] lg:h-[620px] xl:h-[650px]" />
      <div className="absolute inset-x-0 top-[455px] -z-10 h-[250px] bg-gradient-to-t from-[#03141a] via-[#03141a]/64 to-transparent sm:top-[420px] lg:top-[390px] xl:top-[415px]" />

      <div className="relative mx-auto max-w-[1520px] px-4 pb-5 pt-3 sm:px-6 lg:px-10 lg:pt-4">
        <div className="grid min-h-[500px] items-center gap-4 lg:grid-cols-[.80fr_1.20fr] xl:min-h-[525px]">
          <div className="relative z-20 max-w-[640px] py-5 lg:py-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-100/65 bg-[#073943]/72 px-4 py-2 text-[10px] font-black uppercase tracking-[0.30em] text-cyan-50 shadow-[0_0_30px_rgba(88,240,242,.24)] backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-[#83ffe4] shadow-[0_0_14px_#83ffe4]" />
              Move · Learn · Earn
            </div>

            <h1 className="mt-4 text-[40px] font-black leading-[.96] tracking-[-0.052em] text-white drop-shadow-[0_4px_20px_rgba(0,0,0,.46)] sm:text-[50px] lg:text-[57px] xl:text-[63px]">
              Willkommen bei WellFit.
              <br />
              Dein Abenteuer für{" "}
              <span className="bg-gradient-to-r from-[#fff56d] via-[#ffc02e] to-[#ff8618] bg-clip-text text-transparent">
                Körper & Geist.
              </span>
            </h1>

            <p className="mt-5 max-w-[590px] text-sm font-medium leading-6 text-white/94 drop-shadow-[0_2px_12px_rgba(0,0,0,.58)] sm:text-base sm:leading-7">
              Bewege dich im Alltag, entdecke Missionen, sammle WFXP und entwickle deinen persönlichen Buddy – allein oder gemeinsam.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl border border-[#fff080]/70 bg-gradient-to-r from-[#ff8618] via-[#ffb725] to-[#ffe45b] px-7 py-3.5 text-center text-[15px] font-black text-[#172006] shadow-[0_16px_38px_rgba(255,156,29,.44)] transition hover:-translate-y-0.5 hover:brightness-105"
              >
                Jetzt kostenlos starten →
              </Link>
              <a
                href="#so-funktionierts"
                className="rounded-xl border border-cyan-100/80 bg-[#073640]/70 px-7 py-3.5 text-center text-[15px] font-black text-cyan-50 shadow-[0_12px_30px_rgba(0,0,0,.27)] backdrop-blur-md transition hover:bg-cyan-100/16"
              >
                ▶ So funktioniert’s
              </a>
            </div>

            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
              {trustSignals.map(([icon, title, text]) => (
                <div key={title} className="flex items-center gap-2.5 rounded-xl bg-[#06313a]/38 pr-2 backdrop-blur-[2px]">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cyan-100/70 bg-cyan-300/17 text-xs font-black text-cyan-50 shadow-[0_0_19px_rgba(59,224,236,.17)]">
                    {icon}
                  </span>
                  <div>
                    <p className="text-[12px] font-black text-white">{title}</p>
                    <p className="text-[10px] text-white/80">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden min-h-[470px] lg:block" aria-label="WellFit App und Buddy Vorschau">
            <div className="absolute bottom-[-2%] right-[2%] z-20 h-[455px] w-[390px] xl:right-[4%] xl:h-[490px] xl:w-[420px] 2xl:right-[6%]">
              <Image
                src="/buddy/luma.png"
                alt="WellFit Buddy Luma"
                fill
                priority
                sizes="420px"
                className="object-contain object-bottom drop-shadow-[0_30px_70px_rgba(0,0,0,.48)]"
              />
            </div>

            <div className="absolute bottom-[8%] left-[6%] z-20 h-16 w-16 rotate-[-12deg] opacity-95 xl:left-[9%]">
              <Image
                src="/coin.png"
                alt=""
                fill
                sizes="64px"
                className="object-contain drop-shadow-[0_0_18px_rgba(255,190,42,.75)]"
              />
            </div>

            <div className="absolute right-[-1%] top-[12%] z-30 hidden w-[148px] flex-col gap-2 xl:flex">
              {missionSigns.map((sign, index) => (
                <span
                  key={sign}
                  className="rounded-md border border-[#ffd15a]/48 bg-[linear-gradient(90deg,rgba(91,51,22,.95),rgba(139,83,29,.94))] px-4 py-2 text-center text-[12px] font-black text-[#ffe8a8] shadow-[0_8px_18px_rgba(0,0,0,.30)]"
                  style={{ transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)` }}
                >
                  {sign}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-20 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="group relative min-h-[194px] overflow-hidden rounded-[22px] border border-cyan-50/55 bg-[#0a3942]/90 shadow-[0_18px_50px_rgba(0,0,0,.30),0_0_32px_rgba(34,211,238,.09)]"
            >
              <Image
                src={card.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-[1.04]"
                style={{ filter: "brightness(1.34) saturate(1.32) contrast(.96)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#03171d]/82 via-[#062630]/38 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#021319]/28 via-transparent to-white/[0.06]" />
              <div className="relative z-10 flex h-full max-w-[68%] flex-col p-4.5">
                <LandingToneIcon tone={card.tone}>{card.icon}</LandingToneIcon>
                <h2 className="mt-2.5 text-[18px] font-black leading-tight text-white drop-shadow-[0_2px_9px_rgba(0,0,0,.62)]">{card.title}</h2>
                <p className="mt-1.5 text-[11px] font-medium leading-[1.55] text-white/92">{card.text}</p>
                <a href={card.href} className="mt-auto pt-3 text-[11px] font-black text-[#ffe45e] drop-shadow-[0_1px_5px_rgba(0,0,0,.60)]">
                  Mehr erfahren →
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="relative z-20 mt-4 rounded-[26px] border border-cyan-50/30 bg-[linear-gradient(180deg,rgba(9,53,62,.76),rgba(2,23,29,.84))] px-3 pb-3 pt-2 shadow-[0_18px_46px_rgba(0,0,0,.25)] backdrop-blur-md sm:px-4">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-50/70" />
            <h2 className="text-center text-xl font-black tracking-[-0.035em] text-white sm:text-[27px]">
              Was WellFit <span className="text-[#ffb22f]">besonders</span> macht
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ffe45e]/70" />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map(([icon, title, text, tone]) => (
              <article
                key={title}
                className="flex min-h-[88px] items-center gap-3 rounded-2xl border border-cyan-50/42 bg-[#083b44]/88 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,.08)] backdrop-blur-md"
              >
                <LandingToneIcon tone={tone}>{icon}</LandingToneIcon>
                <div>
                  <h3 className="text-[13px] font-black leading-tight text-white">{title}</h3>
                  <p className="mt-1 text-[10px] leading-4 text-white/82">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <a href="#so-funktionierts" className="relative z-20 mx-auto mt-4 flex w-fit items-center gap-3 text-[13px] font-black text-white/98">
          <span>So funktioniert’s</span>
          <span className="hidden text-cyan-100 sm:inline">– In 5 einfachen Schritten zu mehr Wohlbefinden</span>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-cyan-50/75 bg-cyan-300/12 text-cyan-50">⌄</span>
        </a>
      </div>
    </section>
  );
}
