import { Language } from "./loginContent";

const copy = {
  de: {
    headline: "Willkommen bei WellFit auf deinem Abenteuer für Körper & Geist.",
    intro: "Bewege dich im Alltag, sammle Punkte und entwickle deinen Buddy Schritt für Schritt weiter.",
    benefits: [
      ["Bewege dich im Alltag", "Deine Schritte, Workouts & Aktivitäten zählen."],
      ["Sammle Punkte", "Verdiene Punkte und Belohnungen für jede Bewegung."],
      ["Level deinen Buddy", "Spiele, wachse mit deinem Avatar und erreiche neue Level."],
    ],
  },
  en: {
    headline: "Welcome to WellFit on your adventure for body and mind.",
    intro: "Move every day, collect points and develop your buddy step by step.",
    benefits: [
      ["Move every day", "Your steps, workouts and activities count."],
      ["Collect points", "Earn points and rewards for every movement."],
      ["Level your buddy", "Play, grow with your avatar and reach new levels."],
    ],
  },
};

export default function LoginHero({ language }: { language: Language }) {
  const t = copy[language];

  return (
    <section className="mx-auto max-w-[1180px] pt-28 lg:absolute lg:left-1/2 lg:top-[33%] lg:z-20 lg:w-[1180px] lg:-translate-x-1/2 lg:pt-0">
      <div className="grid items-start gap-16 lg:grid-cols-[470px_450px] lg:justify-center">
        <div className="w-full max-w-[470px] text-left">
          <div className="mb-5 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-cyan-100 shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md">
            WellFit Earn Wellness
          </div>
          <h1 className="text-[2.35rem] font-black leading-[1.06] tracking-tight text-white drop-shadow-[0_10px_28px_rgba(0,0,0,0.24)] sm:text-[3rem] lg:text-[3.05rem]">
            {t.headline}
          </h1>
          <p className="mt-5 text-[1.18rem] font-semibold leading-snug text-white/90 drop-shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
            {t.intro}
          </p>
          <div className="mt-7 space-y-5">
            {t.benefits.map(([title, text]) => (
              <div key={title} className="rounded-[26px] border border-white/10 bg-white/[0.06] px-5 py-4 shadow-[0_14px_40px_rgba(0,0,0,0.08)] backdrop-blur-[2px]">
                <h2 className="text-[1.35rem] font-black leading-tight text-white">{title}</h2>
                <p className="mt-2 text-[1.05rem] leading-[1.28] text-white/88">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden lg:block" />
      </div>
    </section>
  );
}
