"use client";

import RegisterPanel from "./RegisterPanel";
import PrimaryButton from "@/app/components/PrimaryButton";
import { Language } from "../registerTypes";
import { getRegisterContent } from "../registerContent";

type Props = {
  language: Language;
  form: any;
  setForm: (form: any) => void;
  onNext: () => void;
};

export default function Step1Account({ language, form, setForm, onNext }: Props) {
  const t = getRegisterContent(language);

  return (
    <RegisterPanel title={t.step1Title}>
      <div className="flex flex-col gap-4">
        <input
          placeholder={t.firstName}
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          className="input"
        />
        <input
          placeholder={t.lastName}
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          className="input"
        />
        <input
          placeholder={t.email}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input"
        />
        <input
          type="password"
          placeholder={t.password}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="input"
        />
        <PrimaryButton onClick={onNext}>
          Weiter
        </PrimaryButton>
      </div>
    </RegisterPanel>
  );
}
