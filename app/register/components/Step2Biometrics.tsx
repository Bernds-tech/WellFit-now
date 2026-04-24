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

export default function Step2Biometrics({ language, biometrics, setBiometrics, onNext }: Props) {
  const t = getRegisterContent(language);

  return (
    <div className="absolute left-1/2 top-[13%] w-[78%] max-w-[1180px] -translate-x-1/2">
      <div className="mb-5 text-center">
        <div className="text-sm font-bold tracking-[0.22em] text-cyan-100/55">{t.biometricsPhase}</div>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white">{t.setupTitle}</h1>
        <p className="mt-2 text-sm text-white/65">
          {language === "de" ? "Diese Angaben helfen deinem Buddy, passende Aufgaben und sichere Empfehlungen zu wählen." : "This helps your buddy choose suitable tasks and safe recommendations."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <RegisterPanel title={t.birthdate}>
          <input type="date" value={biometrics.birthdate ?? ""} onChange={(e) => setBiometrics({ ...biometrics, birthdate: e.target.value })} className="h-12 w-full rounded-lg bg-white/10 px-3 text-white outline-none" />
        </RegisterPanel>

        <RegisterPanel title={t.gender}>
          <select value={biometrics.gender ?? "male"} onChange={(e) => setBiometrics({ ...biometrics, gender: e.target.value })} className="h-12 w-full rounded-lg bg-white/10 px-3 text-white outline-none">
            <option value="male">{t.male}</option>
            <option value="female">{t.female}</option>
            <option value="diverse">{t.diverse}</option>
          </select>
        </RegisterPanel>

        <RegisterPanel title={t.bodyType}>
          <select value={biometrics.bodyType ?? "slim"} onChange={(e) => setBiometrics({ ...biometrics, bodyType: e.target.value })} className="h-12 w-full rounded-lg bg-white/10 px-3 text-white outline-none">
            <option value="slim">{t.slim}</option>
            <option value="athletic">{t.athletic}</option>
            <option value="strong">{t.strong}</option>
          </select>
        </RegisterPanel>

        <RegisterPanel title={t.size}>
          <input type="range" min={140} max={220} value={biometrics.height ?? 180} onChange={(e) => setBiometrics({ ...biometrics, height: Number(e.target.value) })} className="w-full" />
          <div className="mt-3 text-center text-3xl font-extrabold text-cyan-100">{biometrics.height ?? 180} cm</div>
        </RegisterPanel>

        <RegisterPanel title={t.weight}>
          <input type="range" min={35} max={180} value={biometrics.weight ?? 82} onChange={(e) => setBiometrics({ ...biometrics, weight: Number(e.target.value) })} className="w-full" />
          <div className="mt-3 text-center text-3xl font-extrabold text-cyan-100">{biometrics.weight ?? 82} kg</div>
        </RegisterPanel>

        <RegisterPanel title={t.fitnessLevel}>
          <select value={biometrics.fitnessLevel ?? "beginner"} onChange={(e) => setBiometrics({ ...biometrics, fitnessLevel: e.target.value })} className="h-12 w-full rounded-lg bg-white/10 px-3 text-white outline-none">
            <option value="beginner">{t.beginner}</option>
            <option value="medium">{t.medium}</option>
            <option value="pro">{t.pro}</option>
          </select>
        </RegisterPanel>
      </div>

      <div className="mt-4 grid grid-cols-[1.4fr_1fr] gap-4">
        <RegisterPanel title={t.limitations}>
          <div className="grid grid-cols-4 gap-2 text-sm">
            {["Rücken", "Knie", "Herz", "Asthma"].map((item) => (
              <button key={item} type="button" onClick={() => {
                const list = biometrics.limitations ?? [];
                const next = list.includes(item) ? list.filter((value: string) => value !== item) : [...list, item];
                setBiometrics({ ...biometrics, limitations: next });
              }} className={`rounded-xl px-3 py-3 font-semibold transition ${(biometrics.limitations ?? []).includes(item) ? "bg-cyan-300 text-[#053841]" : "bg-white/10 text-white hover:bg-white/15"}`}>
                {item}
              </button>
            ))}
          </div>
        </RegisterPanel>

        <RegisterPanel title={t.medication}>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setBiometrics({ ...biometrics, medication: "yes" })} className={`rounded-xl px-3 py-3 font-semibold transition ${(biometrics.medication ?? "no") === "yes" ? "bg-cyan-300 text-[#053841]" : "bg-white/10 text-white hover:bg-white/15"}`}>{t.yes}</button>
            <button type="button" onClick={() => setBiometrics({ ...biometrics, medication: "no" })} className={`rounded-xl px-3 py-3 font-semibold transition ${(biometrics.medication ?? "no") === "no" ? "bg-cyan-300 text-[#053841]" : "bg-white/10 text-white hover:bg-white/15"}`}>{t.no}</button>
          </div>
        </RegisterPanel>
      </div>

      <div className="mx-auto mt-5 max-w-[360px]">
        <PrimaryButton onClick={onNext}>{t.next}</PrimaryButton>
      </div>
    </div>
  );
}
