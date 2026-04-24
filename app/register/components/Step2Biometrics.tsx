"use client";

import RegisterPanel from "./RegisterPanel";
import PrimaryButton from "@/app/components/PrimaryButton";
import { Language } from "../registerTypes";
import { getRegisterContent } from "../registerContent";

type Props = {
  language: Language;
  biometrics: any;
  setBiometrics: (value: any) => void;
  onNext: () => void;
};

const inputClass = "h-11 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-sm text-white outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/20";
const rangeClass = "w-full accent-cyan-300";

export default function Step2Biometrics({ language, biometrics, setBiometrics, onNext }: Props) {
  const t = getRegisterContent(language);
  const height = biometrics.height ?? 180;
  const weight = biometrics.weight ?? 82;
  const bmi = weight / Math.pow(height / 100, 2);
  const bmiLabel = bmi < 18.5 ? "Leicht" : bmi < 25 ? "Balance" : bmi < 30 ? "Kraft" : "Power";
  const avatarScale = Math.min(1.18, Math.max(0.88, height / 180));
  const avatarWidth = biometrics.bodyType === "strong" ? "w-44" : biometrics.bodyType === "athletic" ? "w-36" : "w-32";
  const setupScore = Math.min(100, 35 + Math.round(((height - 140) / 80) * 20) + Math.round(((weight - 35) / 145) * 15) + ((biometrics.limitations ?? []).length > 0 ? 10 : 0) + ((biometrics.medication ?? "no") === "yes" ? 10 : 20));
  const fitnessText = biometrics.fitnessLevel === "pro" ? "Pro-Modus" : biometrics.fitnessLevel === "medium" ? "Aktiv-Modus" : "Einsteiger-Modus";

  return (
    <section className="absolute inset-x-8 top-24 bottom-8 overflow-hidden">
      <div className="mb-4 text-center">
        <div className="text-xs font-bold tracking-[0.22em] text-cyan-100/55">{t.biometricsPhase}</div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-white">{t.setupTitle}</h1>
      </div>

      <div className="grid h-[calc(100%-78px)] grid-cols-[0.95fr_1fr] gap-6">
        <div className="min-h-0 overflow-y-auto pr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mb-3 rounded-[28px] border border-white/15 bg-black/15 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm text-white/80">
              <span className="font-bold">Avatar-Synchronisation</span>
              <span className="font-black text-cyan-100">{setupScore}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 transition-all duration-500" style={{ width: `${setupScore}%` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <RegisterPanel title={t.birthdate}>
              <input type="date" value={biometrics.birthdate ?? ""} onChange={(e) => setBiometrics({ ...biometrics, birthdate: e.target.value })} className={inputClass} />
            </RegisterPanel>

            <RegisterPanel title={t.gender}>
              <select value={biometrics.gender ?? "male"} onChange={(e) => setBiometrics({ ...biometrics, gender: e.target.value })} className={inputClass}>
                <option value="male">{t.male}</option>
                <option value="female">{t.female}</option>
                <option value="diverse">{t.diverse}</option>
              </select>
            </RegisterPanel>

            <RegisterPanel title={t.size}>
              <input type="range" min={140} max={220} value={height} onChange={(e) => setBiometrics({ ...biometrics, height: Number(e.target.value) })} className={rangeClass} />
              <div className="mt-2 flex items-end justify-center gap-2"><span className="text-3xl font-black text-cyan-100">{height}</span><span className="pb-1 text-sm text-white/70">cm</span></div>
            </RegisterPanel>

            <RegisterPanel title={t.weight}>
              <input type="range" min={35} max={180} value={weight} onChange={(e) => setBiometrics({ ...biometrics, weight: Number(e.target.value) })} className={rangeClass} />
              <div className="mt-2 flex items-end justify-center gap-2"><span className="text-3xl font-black text-cyan-100">{weight}</span><span className="pb-1 text-sm text-white/70">kg</span></div>
            </RegisterPanel>

            <RegisterPanel title={t.bodyType}>
              <select value={biometrics.bodyType ?? "slim"} onChange={(e) => setBiometrics({ ...biometrics, bodyType: e.target.value })} className={inputClass}>
                <option value="slim">{t.slim}</option>
                <option value="athletic">{t.athletic}</option>
                <option value="strong">{t.strong}</option>
              </select>
            </RegisterPanel>

            <RegisterPanel title={t.fitnessLevel}>
              <select value={biometrics.fitnessLevel ?? "beginner"} onChange={(e) => setBiometrics({ ...biometrics, fitnessLevel: e.target.value })} className={inputClass}>
                <option value="beginner">{t.beginner}</option>
                <option value="medium">{t.medium}</option>
                <option value="pro">{t.pro}</option>
              </select>
            </RegisterPanel>

            <div className="col-span-2">
              <RegisterPanel title={t.limitations}>
                <div className="grid grid-cols-4 gap-2 text-sm">
                  {["Rücken", "Knie", "Herz", "Asthma"].map((item) => {
                    const selected = (biometrics.limitations ?? []).includes(item);
                    return (
                      <button key={item} type="button" onClick={() => {
                        const list = biometrics.limitations ?? [];
                        const next = selected ? list.filter((value: string) => value !== item) : [...list, item];
                        setBiometrics({ ...biometrics, limitations: next });
                      }} className={`rounded-xl px-3 py-2 font-semibold transition ${selected ? "bg-cyan-300 text-[#053841] shadow-[0_0_18px_rgba(103,232,249,0.35)]" : "bg-white/10 text-white hover:bg-white/15"}`}>
                        {item}
                      </button>
                    );
                  })}
                </div>
              </RegisterPanel>
            </div>
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-4">
          <div className="relative flex-1 overflow-hidden rounded-[32px] border border-white/15 bg-white/10 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl" />
            <div className="relative mb-2 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-100/70">Live Morphing</p>
                <p className="text-sm text-white/70">{fitnessText} | BMI {bmi.toFixed(1)} {bmiLabel}</p>
              </div>
              <button type="button" className="rounded-xl bg-black/20 px-4 py-2 text-xs font-bold text-cyan-100 transition hover:bg-black/30">{t.scan}</button>
            </div>
            <div className="relative flex h-[calc(100%-64px)] flex-col items-center justify-center text-center">
              <div className="mb-5 grid h-44 w-44 place-items-center rounded-full border border-white/20 bg-cyan-100/15 shadow-[0_0_50px_rgba(103,232,249,0.2)]">
                <div className={`${avatarWidth} grid aspect-square place-items-center rounded-full bg-gradient-to-br from-cyan-200/20 to-emerald-200/10 text-7xl transition-all duration-500`} style={{ transform: `scale(${avatarScale})` }}>🐉</div>
              </div>
              <div className="text-4xl font-black text-cyan-100 drop-shadow-[0_0_14px_rgba(103,232,249,0.25)]">FLAMMI</div>
              <div className="mt-2 text-base text-white/70">Drachen-Klasse | Feuer-Element</div>
              <div className="mt-4 grid w-full max-w-md grid-cols-3 gap-2 text-xs">
                <div className="rounded-2xl bg-black/20 px-3 py-2"><div className="text-white/55">Größe</div><div className="font-black text-cyan-100">{height} cm</div></div>
                <div className="rounded-2xl bg-black/20 px-3 py-2"><div className="text-white/55">Gewicht</div><div className="font-black text-cyan-100">{weight} kg</div></div>
                <div className="rounded-2xl bg-black/20 px-3 py-2"><div className="text-white/55">Status</div><div className="font-black text-cyan-100">{bmiLabel}</div></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_220px] gap-4">
            <RegisterPanel title={t.medication}>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setBiometrics({ ...biometrics, medication: "yes" })} className={`rounded-xl px-3 py-2 font-semibold transition ${(biometrics.medication ?? "no") === "yes" ? "bg-cyan-300 text-[#053841] shadow-[0_0_18px_rgba(103,232,249,0.35)]" : "bg-white/10 text-white hover:bg-white/15"}`}>{t.yes}</button>
                <button type="button" onClick={() => setBiometrics({ ...biometrics, medication: "no" })} className={`rounded-xl px-3 py-2 font-semibold transition ${(biometrics.medication ?? "no") === "no" ? "bg-cyan-300 text-[#053841] shadow-[0_0_18px_rgba(103,232,249,0.35)]" : "bg-white/10 text-white hover:bg-white/15"}`}>{t.no}</button>
              </div>
            </RegisterPanel>

            <div className="flex items-end">
              <PrimaryButton onClick={onNext}>{t.next}</PrimaryButton>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
