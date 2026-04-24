"use client";

import RegisterPanel from "./RegisterPanel";
import PrimaryButton from "@/app/components/PrimaryButton";
import { Language } from "../registerTypes";
import { getRegisterContent } from "../registerContent";

type Props = { language: Language; biometrics: any; setBiometrics: (value: any) => void; onNext: () => void; };

const inputClass = "h-9 w-full rounded-xl border border-white/10 bg-white/10 px-3 text-xs text-white outline-none transition focus:border-cyan-300 focus:ring-4 focus:ring-cyan-300/20";
const rangeClass = "w-full accent-cyan-300";
const chipClass = (active: boolean) => `rounded-xl px-2 py-1.5 text-xs font-semibold transition ${active ? "bg-cyan-300 text-[#053841] shadow-[0_0_18px_rgba(103,232,249,0.35)]" : "bg-white/10 text-white hover:bg-white/15"}`;

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
    <section className="absolute inset-x-8 top-16 bottom-5 overflow-hidden">
      <div className="mb-3 text-center">
        <div className="text-[10px] font-bold tracking-[0.22em] text-cyan-100/55">{t.biometricsPhase}</div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white">{t.setupTitle}</h1>
      </div>

      <div className="grid h-[calc(100%-60px)] grid-cols-[0.95fr_1fr] gap-5">
        <div className="min-h-0 overflow-hidden pr-1">
          <div className="mb-2 rounded-[20px] border border-white/15 bg-black/15 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <div className="flex items-center justify-between text-xs text-white/80"><span className="font-bold">Avatar-Synchronisation</span><span className="font-black text-cyan-100">{setupScore}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-sky-400 transition-all duration-500" style={{ width: `${setupScore}%` }} /></div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <RegisterPanel title={t.birthdate}><input type="date" value={biometrics.birthdate ?? ""} onChange={(e) => setBiometrics({ ...biometrics, birthdate: e.target.value })} className={inputClass} /></RegisterPanel>

            <RegisterPanel title={t.gender}><div className="grid grid-cols-3 gap-1.5"><button type="button" onClick={() => setBiometrics({ ...biometrics, gender: "male" })} className={chipClass((biometrics.gender ?? "male") === "male")}>{t.male}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, gender: "female" })} className={chipClass((biometrics.gender ?? "male") === "female")}>{t.female}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, gender: "diverse" })} className={chipClass((biometrics.gender ?? "male") === "diverse")}>{t.diverse}</button></div></RegisterPanel>

            <RegisterPanel title={t.size}><input type="range" min={140} max={220} value={height} onChange={(e) => setBiometrics({ ...biometrics, height: Number(e.target.value) })} className={rangeClass} /><div className="mt-1 flex items-end justify-center gap-2"><span className="text-2xl font-black text-cyan-100">{height}</span><span className="pb-1 text-xs text-white/70">cm</span></div></RegisterPanel>

            <RegisterPanel title={t.weight}><input type="range" min={35} max={180} value={weight} onChange={(e) => setBiometrics({ ...biometrics, weight: Number(e.target.value) })} className={rangeClass} /><div className="mt-1 flex items-end justify-center gap-2"><span className="text-2xl font-black text-cyan-100">{weight}</span><span className="pb-1 text-xs text-white/70">kg</span></div></RegisterPanel>

            <RegisterPanel title={t.bodyType}><div className="grid grid-cols-3 gap-1.5"><button type="button" onClick={() => setBiometrics({ ...biometrics, bodyType: "slim" })} className={chipClass((biometrics.bodyType ?? "slim") === "slim")}>{t.slim}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, bodyType: "athletic" })} className={chipClass((biometrics.bodyType ?? "slim") === "athletic")}>{t.athletic}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, bodyType: "strong" })} className={chipClass((biometrics.bodyType ?? "slim") === "strong")}>{t.strong}</button></div></RegisterPanel>

            <RegisterPanel title={t.fitnessLevel}><div className="grid grid-cols-3 gap-1.5"><button type="button" onClick={() => setBiometrics({ ...biometrics, fitnessLevel: "beginner" })} className={chipClass((biometrics.fitnessLevel ?? "beginner") === "beginner")}>{t.beginner}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, fitnessLevel: "medium" })} className={chipClass((biometrics.fitnessLevel ?? "beginner") === "medium")}>{t.medium}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, fitnessLevel: "pro" })} className={chipClass((biometrics.fitnessLevel ?? "beginner") === "pro")}>{t.pro}</button></div></RegisterPanel>

            <div className="col-span-2"><RegisterPanel title={t.limitations}><div className="grid grid-cols-4 gap-1.5 text-xs">{["Rücken", "Knie", "Herz", "Asthma"].map((item) => { const selected = (biometrics.limitations ?? []).includes(item); return <button key={item} type="button" onClick={() => { const list = biometrics.limitations ?? []; const next = selected ? list.filter((value: string) => value !== item) : [...list, item]; setBiometrics({ ...biometrics, limitations: next }); }} className={chipClass(selected)}>{item}</button>; })}</div></RegisterPanel></div>
          </div>
        </div>

        <aside className="flex min-h-0 flex-col gap-3">
          <div className="relative flex-1 overflow-hidden rounded-[28px] border border-white/15 bg-white/10 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" /><div className="pointer-events-none absolute -bottom-20 left-1/4 h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl" />
            <div className="relative mb-1.5 flex items-center justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-100/70">Live Morphing</p><p className="text-xs text-white/70">{fitnessText} | BMI {bmi.toFixed(1)} {bmiLabel}</p></div><button type="button" className="rounded-xl bg-black/20 px-4 py-2 text-xs font-bold text-cyan-100 transition hover:bg-black/30">{t.scan}</button></div>
            <div className="relative flex h-[calc(100%-50px)] flex-col items-center justify-center text-center"><div className="mb-4 grid h-44 w-44 place-items-center rounded-full border border-white/20 bg-cyan-100/15 shadow-[0_0_50px_rgba(103,232,249,0.2)]"><div className={`${avatarWidth} grid aspect-square place-items-center rounded-full bg-gradient-to-br from-cyan-200/20 to-emerald-200/10 text-7xl transition-all duration-500`} style={{ transform: `scale(${avatarScale})` }}>🐉</div></div><div className="text-4xl font-black text-cyan-100 drop-shadow-[0_0_14px_rgba(103,232,249,0.25)]">FLAMMI</div><div className="mt-1.5 text-sm text-white/70">Drachen-Klasse | Feuer-Element</div><div className="mt-3 grid w-full max-w-md grid-cols-3 gap-2 text-[11px]"><div className="rounded-2xl bg-black/20 px-3 py-1.5"><div className="text-white/55">Größe</div><div className="font-black text-cyan-100">{height} cm</div></div><div className="rounded-2xl bg-black/20 px-3 py-1.5"><div className="text-white/55">Gewicht</div><div className="font-black text-cyan-100">{weight} kg</div></div><div className="rounded-2xl bg-black/20 px-3 py-1.5"><div className="text-white/55">Status</div><div className="font-black text-cyan-100">{bmiLabel}</div></div></div></div>
          </div>

          <div className="grid grid-cols-[1fr_220px] gap-3"><RegisterPanel title={t.medication}><div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => setBiometrics({ ...biometrics, medication: "yes" })} className={chipClass((biometrics.medication ?? "no") === "yes")}>{t.yes}</button><button type="button" onClick={() => setBiometrics({ ...biometrics, medication: "no" })} className={chipClass((biometrics.medication ?? "no") === "no")}>{t.no}</button></div></RegisterPanel><div className="flex items-end"><PrimaryButton onClick={onNext}>{t.next}</PrimaryButton></div></div>
        </aside>
      </div>
    </section>
  );
}
