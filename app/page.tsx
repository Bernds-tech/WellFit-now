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
    <main className="relative h-screen w-screen overflow-hidden text-white">
      <Image src="/login-bg.png" alt="WellFit Hintergrund" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-cyan-900/10" />

      <div className="relative h-full w-full">
        <div className="absolute left-8 top-8 h-28 w-36 lg:h-36 lg:w-44">
          <Image src="/logo.png" alt="WellFit Logo" fill sizes="112px" priority className="object-contain object-left-top" />
        </div>

        <LoginLanguageMenu language={language} showLanguageMenu={showLanguageMenu} onToggle={() => setShowLanguageMenu((prev) => !prev)} onChangeLanguage={changeLanguage} />
        <LoginHero language={language} />
        <LoginForm language={language} />
        <LoginFooter language={language} />
      </div>
    </main>
  );
}
