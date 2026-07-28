import Image from "next/image";
import Link from "next/link";
import { featureCards, highlights } from "./landingPublicData";
import { LandingToneIcon } from "./LandingPrimitivesV5";

export default function LandingHeroV5() {
  return (
    <section className="relative isolate overflow-hidden border-b border-cyan-300/10">
      <Image
        src="/landing/reference-hero.svg"
        alt="WellFit Abenteuerwelt mit Buddy und App"
        fill
        priority
        sizes="100vw"
        className="-z-30 object-cover object-center"
      />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(1,12,17,.98)_0%,rgba(2,16,21,.93)_32%,rgba(2,18,22,.44)_54%,rgba(2,11,15,.08)_78%,rgba(2,11,15,.28)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-64 bg-gradient-to-t from-[#020b0f] via-[#020b0f]/82 to-transparent" />

      <div className="mx-auto max-w-[1500px] px-5 pb-6 pt-8 lg:px-10 lg:pt-10">
        <div className="grid min-h-[430px] items-center lg:grid-cols-[.83fr_1.17fr]">
          <div className="relative z-10 max-w-[650px] py-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/35 bg-[#06242b]/78 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,.12)]">
              <span className="h-2 w-2 rounded-full bg-[#ffd95d] shadow-[0_0_12px_#ffd95d]" /> Move · Learn · Earn
            </div>
            <h1 className="mt-5 text-[42px] font-black leading-[.98] tracking-[-0.052em] text-white sm:text-[54px] lg:text-[62px] xl:text-[68px]">
              Willkommen bei WellFit.<br />
              Dein Abenteuer für{" "}
              <span className="bg-gradient-to-r from-[#ffe45d] via-[#ffb324] to-[#ff8518] bg-clip-text text-transparent">
                Körper & Geist.
              </span>
            </h1>
            <p className="mt-5 max-w-[620px] text-base leading-7 text-cyan-50/82 lg:text-[18px]">
              Bewege dich im Alltag, entdecke Missionen, sammle WFXP und entwickle deinen persönlichen Buddy – allein oder gemeinsam.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-[#ff8618] to-[#ffd95d] px-7 py-4 text-center text-base font-black text-[#172006] shadow-[0_16px_34px_rgba(255,139,24,.28)] transition hover:-translate-y-0.5"
              >
                Jetzt kostenlos starten →
              </Link>
              <a
                href="#so-funktionierts"
                className="rounded-xl border border-cyan-300/50 bg-[#041d24]/76 px-7 py-4 text-center text-base font-black text-cyan-50 shadow-[0_12px_28px_rgba(0,0,0,.22)] transition hover:bg-cyan-300/10"
              >
                ▶ So funktioniert’s
              </a>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["◇", "Sicher & transparent", "Klare Kontrolle."],
                ["◎", "Für viele Lebenslagen", "Allein oder gemeinsam."],
                ["♥", "Motivierend", "Spielerisch zum Ziel."],
              ].map(([icon, title, text]) => (
                <div
                  key={title}
                  className="flex items-center gap-3 rounded-xl border border-cyan-300/16 bg-[#03161c]/74 px-3.5 py-3 backdrop-blur-md"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-cyan-300/35 bg-cyan-300/10 text-xs font-black text-cyan-200">
                    {icon}
                  </span>
                  <div>
                    <p className="text-[12px] font-black text-white">{title}</p>
                    <p className="mt-0.5 text-[10px] text-white/52">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div aria-hidden="true" className="min-h-[380px]" />
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((card) => (
            <article
              key={card.title}
              className="group relative min-h-[190px] overflow-hidden rounded-2xl border border-cyan-300/20 bg-[#041b21]/88 shadow-[0_18px_42px_rgba(0,0,0,.28)]"
            >
              <Image
                src={card.image}
                alt=""
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover transition duration-500 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#03161c]/96 via-[#03161c]/75 to-[#03161c]/12" />
              <div className="relative z-10 flex h-full max-w-[72%] flex-col p-5">
                <LandingToneIcon tone={card.tone}>{card.icon}</LandingToneIcon>
                <h2 className="mt-3 text-lg font-black leading-tight text-white">{card.title}</h2>
                <p className="mt-2 text-xs leading-5 text-white/70">{card.text}</p>
                <a href={card.href} className="mt-auto pt-4 text-xs font-black text-[#ffd95d]">
                  Mehr erfahren →
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-cyan-300/35" />
            <h2 className="text-center text-2xl font-black tracking-[-0.03em] sm:text-3xl">
              Was WellFit <span className="text-[#ff9b25]">besonders</span> macht
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#ffd95d]/35" />
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {highlights.map(([icon, title, text, tone]) => (
              <article
                key={title}
                className="flex items-center gap-4 rounded-2xl border border-cyan-300/18 bg-[#041b21]/80 p-4 backdrop-blur-md"
              >
                <LandingToneIcon tone={tone}>{icon}</LandingToneIcon>
                <div>
                  <h3 className="text-sm font-black text-white">{title}</h3>
                  <p className="mt-1 text-[11px] leading-4 text-white/62">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <a href="#so-funktionierts" className="mx-auto mt-5 flex w-fit items-center gap-3 text-sm font-black text-white/92">
          <span>So funktioniert’s</span>
          <span className="hidden text-cyan-300 sm:inline">– In 5 einfachen Schritten zu mehr Wohlbefinden</span>
          <span className="grid h-8 w-8 place-items-center rounded-full border border-cyan-300/45 text-cyan-200">⌄</span>
        </a>
      </div>
    </section>
  );
}
