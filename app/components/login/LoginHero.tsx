import { Language, loginContent } from "./loginContent";

export default function LoginHero({ language }: { language: Language }) {
  const t = loginContent[language];

  return (
    <section className="mx-auto max-w-[920px] text-center lg:absolute lg:left-1/2 lg:top-16 lg:z-20 lg:w-[920px] lg:-translate-x-1/2">
      <div className="mx-auto mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md">
        WellFit Earn Wellness
      </div>
      <h1 className="text-[2.1rem] font-black leading-[1.02] tracking-tight text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.24)] sm:text-[2.7rem] lg:text-[3.05rem] lg:whitespace-nowrap">
        {t.headline.replace(/\n/g, " ")}
      </h1>
      <div className="mx-auto mt-3 flex max-w-[700px] items-center justify-center gap-4">
        <div className="hidden h-[2px] flex-1 rounded-full bg-gradient-to-r from-transparent via-white/35 to-cyan-200/40 sm:block" />
        <p className="max-w-[470px] text-center text-sm font-semibold leading-snug text-white/90 drop-shadow-[0_4px_14px_rgba(0,0,0,0.18)] sm:text-base">
          {t.intro.replace("mit WFT-Tokens belohnt.", "mit Punkten belohnt.")}
        </p>
        <div className="hidden h-[2px] flex-1 rounded-full bg-gradient-to-l from-transparent via-white/35 to-cyan-200/40 sm:block" />
      </div>
    </section>
  );
}
