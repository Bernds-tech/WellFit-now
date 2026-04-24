import { Language, loginContent } from "./loginContent";

export default function LoginHero({ language }: { language: Language }) {
  const t = loginContent[language];

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col justify-center gap-16 px-6 pt-28 lg:flex-row lg:items-center lg:gap-20">
      <div className="max-w-[520px] text-left">
        <h1 className="text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
          {t.headline}
        </h1>

        <p className="mt-6 text-xl leading-relaxed text-white/90">
          {t.intro}
        </p>

        <div className="mt-8 space-y-4">
          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-lg font-semibold">Bewege dich im Alltag</p>
            <p className="text-white/70">Deine Schritte, Workouts & Aktivitäten zählen.</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-lg font-semibold">Sammle Punkte</p>
            <p className="text-white/70">Verdiene Belohnungen für jede Bewegung.</p>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <p className="text-lg font-semibold">Level dein Tamagotchi</p>
            <p className="text-white/70">Wachse mit deinem Avatar und erreiche neue Level.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
