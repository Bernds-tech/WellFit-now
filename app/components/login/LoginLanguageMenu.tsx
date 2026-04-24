"use client";

import Image from "next/image";
import { Language, loginContent } from "./loginContent";

type LoginLanguageMenuProps = {
  language: Language;
  showLanguageMenu: boolean;
  onToggle: () => void;
  onChangeLanguage: (language: Language) => void;
};

export default function LoginLanguageMenu({ language, showLanguageMenu, onToggle, onChangeLanguage }: LoginLanguageMenuProps) {
  const t = loginContent[language];

  return (
    <div className="absolute right-12 top-10 z-20">
      <button type="button" onClick={onToggle} className="flex items-center gap-3 text-2xl font-medium">
        <Image src={language === "de" ? "/deutsch.png" : "/england.png"} alt={language === "de" ? "Deutsch" : "English"} width={34} height={22} className="rounded-sm object-cover" />
        <span>{t.languageLabel}</span>
        <span className="text-lg">⌄</span>
      </button>

      {showLanguageMenu && (
        <div className="mt-3 w-52 rounded-2xl border border-white/20 bg-black/30 p-2 backdrop-blur-md">
          <button type="button" onClick={() => onChangeLanguage("de")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-white/10">
            <Image src="/deutsch.png" alt="Deutsch" width={28} height={18} style={{ width: 28, height: 18 }} className="rounded-sm object-cover" />
            <span>Deutsch</span>
          </button>
          <button type="button" onClick={() => onChangeLanguage("en")} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-white/10">
            <Image src="/england.png" alt="English" width={28} height={18} style={{ width: 28, height: 18 }} className="rounded-sm object-cover" />
            <span>English</span>
          </button>
        </div>
      )}
    </div>
  );
}
