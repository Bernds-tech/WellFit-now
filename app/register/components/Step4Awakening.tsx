"use client";

import PrimaryButton from "@/app/components/PrimaryButton";
import { Language } from "../registerTypes";
import { getRegisterContent } from "../registerContent";

type Props = {
  language: Language;
  isCreating?: boolean;
  onFinish: () => void;
};

export default function Step4Awakening({ language, isCreating = false, onFinish }: Props) {
  const t = getRegisterContent(language);
  const missionTitle = language === "de" ? "Erste Mission: Flammi erwacht" : "First mission: Flammi awakens";
  const missionText = language === "de" ? "Sammle heute deine ersten Schritte, bestätige deine Energie und starte deine persönliche WellFit-Reise." : "Collect your first steps today, confirm your energy and begin your personal WellFit journey.";

  return (
    <section className="absolute inset-x-8 top-24 bottom-8 grid place-items-center overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/15 blur-3xl" />
      <div className="pointer-events-none absolute left-[18%] top-[24%] h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl" />
      <div className="pointer-events-none absolute right-[16%] bottom-[14%] h-64 w-64 rounded-full bg-sky-300/15 blur-3xl" />

      <div className="relative w-full max-w-[980px] overflow-hidden rounded-[40px] border border-white/20 bg-white/10 p-8 text-white shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-md">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" />

        <div className="relative grid grid-cols-[0.9fr_1.1fr] gap-8">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-cyan-100/70">Phase 04 | Awakening</div>
            <div className="relative grid h-72 w-72 place-items-center rounded-full border border-white/20 bg-cyan-100/10 shadow-[0_0_70px_rgba(103,232,249,0.25)]">
              <div className="absolute h-60 w-60 rounded-full border border-cyan-200/20" />
              <div className="absolute h-44 w-44 rounded-full border border-emerald-200/20" />
              <div className="text-8xl drop-shadow-[0_0_30px_rgba(103,232,249,0.55)]">🐉</div>
            </div>
            <h2 className="mt-5 text-5xl font-black text-cyan-100 drop-shadow-[0_0_18px_rgba(103,232,249,0.25)]">FLAMMI</h2>
            <p className="mt-2 text-sm text-white/65">{language === "de" ? "Dein KI-Buddy ist bereit." : "Your AI buddy is ready."}</p>
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-black leading-tight text-white">{t.awakenTitle}</h1>
            <p className="mt-4 text-base leading-relaxed text-white/80">{t.awakenText}</p>

            <div className="mt-6 grid gap-3 text-sm text-white/85">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">✓ {t.awakenSub1}</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">✓ {t.awakenSub2}</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">✓ {t.awakenSub3}</div>
            </div>

            <div className="mt-6 rounded-[28px] border border-cyan-200/20 bg-cyan-200/10 p-5 shadow-[0_0_28px_rgba(103,232,249,0.12)]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-xl font-black text-cyan-100">🎯 {missionTitle}</h3>
                <span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-[#053841]">+50 XP</span>
              </div>
              <p className="text-sm leading-relaxed text-white/75">{missionText}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-white/80">
                <div className="rounded-2xl bg-black/20 px-3 py-2"><div className="font-black text-cyan-100">01</div><div>{language === "de" ? "Schritte" : "Steps"}</div></div>
                <div className="rounded-2xl bg-black/20 px-3 py-2"><div className="font-black text-cyan-100">02</div><div>{language === "de" ? "Energie" : "Energy"}</div></div>
                <div className="rounded-2xl bg-black/20 px-3 py-2"><div className="font-black text-cyan-100">03</div><div>{language === "de" ? "Buddy" : "Buddy"}</div></div>
              </div>
            </div>

            <div className="mt-6">
              <PrimaryButton onClick={onFinish}>{isCreating ? t.awakenDone : t.createAvatar}</PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
