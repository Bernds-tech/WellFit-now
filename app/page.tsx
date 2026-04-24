"use client";

import Image from "next/image";
import { useState } from "react";
import { useLegalLanguage } from "@/app/components/useLegalLanguage";

import LoginForm from "./components/login/LoginForm";
import LoginHero from "./components/login/LoginHero";
import LoginFooter from "./components/login/LoginFooter";
import LoginLanguageMenu from "./components/login/LoginLanguageMenu";

export default function Home() {
  const { language, setLanguage } = useLegalLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const changeLanguage = (lang: "de" | "en") => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };

  return (
    <main className="relative min-h-screen w-full overflow-y-auto text-white xl:h-screen xl:overflow-hidden">
      <Image src="/login-bg.png" alt="WellFit Hintergrund" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#008f97]/75 via-[#00aeb8]/45 to-[#042f35]/70" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-black/18 to-transparent" />
      <div className="pointer-events-none absolute left-[26%] top-[22%] h-[520px] w-[520px] rounded-full bg-cyan-200/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[8%] bottom-[8%] h-[360px] w-[360px] rounded-full bg-emerald-200/10 blur-3xl" />

      <div className="relative min-h-screen w-full px-5 pb-8 pt-20 sm:px-8 xl:h-full xl:p-0">
        <div className="absolute left-5 top-5 z-20 h-24 w-32 sm:left-8 sm:top-8 sm:h-28 sm:w-36 lg:h-36 lg:w-44">
          <Image src="/logo.png" alt="WellFit Logo" fill sizes="176px" priority className="object-contain object-left-top" />
        </div>

        <LoginLanguageMenu language={language} showLanguageMenu={showLanguageMenu} onToggle={() => setShowLanguageMenu((prev) => !prev)} onChangeLanguage={changeLanguage} />
        <LoginHero language={language} />
        <LoginForm language={language} />
        <LoginFooter language={language} />
      </div>
    </main>
  );
}
