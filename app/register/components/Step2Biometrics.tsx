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
    <div className="absolute left-8 top-28 w-[46%] scale-[0.88] origin-top-left space-y-2">
      <div className="grid grid-cols-2 gap-3">
        <RegisterPanel title={t.birthdate}>
          <input type="date" value={biometrics.birthdate ?? ""} onChange={(e) => setBiometrics({ ...biometrics, birthdate: e.target.value })} className="h-12 w-full rounded-lg bg-white/10 px-3 text-white outline-none" />
        </RegisterPanel>

        <RegisterPanel title={t.size}>
          <input type="range" min={140} max={220} value={biometrics.height ?? 180} onChange={(e) => setBiometrics({ ...biometrics, height: Number(e.target.value) })} className="w-full" />
          <div className="mt-2 text-center text-3xl font-bold">{biometrics.height ?? 180} cm</div>
        </RegisterPanel>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <RegisterPanel title={t.gender}>
          <select value={biometrics.gender ?? "male"} onChange={(e) => setBiometrics({ ...biometrics, gender: e.target.value })} className="h-12 w-full rounded-lg bg-white/10 px-3 text-white outline-none">
            <option value="male">{t.male}</option>
            <option value="female">{t.female}</option>
            <option value="diverse">{t.diverse}</option>
          </select>
        </RegisterPanel>

        <RegisterPanel title={t.weight}>
          <input type="range" min={35} max={180} value={biometrics.weight ?? 82} onChange={(e) => setBiometrics({ ...biometrics, weight: Number(e.target.value) })} className="w-full" />
          <div className="mt-2 text-center text-3xl font-bold">{biometrics.weight ?? 82} kg</div>
        </RegisterPanel>
      </div>

      <RegisterPanel title={t.fitnessLevel}>
        <select value={biometrics.fitnessLevel ?? "beginner"} onChange={(e) => setBiometrics({ ...biometrics, fitnessLevel: e.target.value })} className="mb-4 h-12 w-full rounded-lg bg-white/10 px-3 text-white outline-none">
          <option value="beginner">{t.beginner}</option>
          <option value="medium">{t.medium}</option>
          <option value="pro">{t.pro}</option>
        </select>
        <PrimaryButton onClick={onNext}>{t.next}</PrimaryButton>
      </RegisterPanel>
    </div>
  );
}
