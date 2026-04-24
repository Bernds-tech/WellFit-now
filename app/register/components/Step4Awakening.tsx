"use client";

import RegisterPanel from "./RegisterPanel";
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

  return (
    <div className="absolute left-1/2 top-[22%] w-[520px] -translate-x-1/2 text-center">
      <RegisterPanel title={t.awakenTitle}>
        <p className="mb-6 text-base leading-relaxed text-white/80">{t.awakenText}</p>

        <div className="mb-6 space-y-3 text-left text-sm text-white/75">
          <div className="rounded-xl bg-white/10 px-4 py-3">✓ {t.awakenSub1}</div>
          <div className="rounded-xl bg-white/10 px-4 py-3">✓ {t.awakenSub2}</div>
          <div className="rounded-xl bg-white/10 px-4 py-3">✓ {t.awakenSub3}</div>
        </div>

        <PrimaryButton onClick={onFinish}>{isCreating ? t.awakenDone : t.createAvatar}</PrimaryButton>
      </RegisterPanel>
    </div>
  );
}
