"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLegalLanguage } from "@/app/components/useLegalLanguage";
import LoginForm from "./components/login/LoginForm";
import { loginContent } from "./components/login/loginContent";

export default function Home() {
  const { language, setLanguage } = useLegalLanguage();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const t = loginContent[language];

  return (
    <main className="relative h-screen w-screen overflow-hidden text-white">
      <Image
        src="/login-bg.png"
        alt="WellFit Hintergrund"
        fill
        priority
        className="object-cover"
      />

      <div className="absolute inset-0 bg-cyan-900/10" />

      <div className="relative h-full w-full">
        {/* Logo */}
        <div className="absolute left-8 top-8 h-28 w-36 lg:h-36 lg:w-44">
          <Image
            src="/logo.png"
            alt="WellFit Logo"
            fill
            sizes="112px"
            priority
            className="object-contain object-left-top"
          />
        </div>

        {/* Sprache */}
        <div className="absolute right-12 top-10 z-20">
          <button
            type="button"
            onClick={() => setShowLanguageMenu((prev) => !prev)}
            className="flex items-center gap-3 text-2xl font-medium"
          >
            <span>{t.languageLabel}</span>
          </button>
        </div>

        {/* Hauptüberschrift */}
        <div className="absolute left-1/2 top-[20%] w-[72%] -translate-x-1/2 text-center">
          <h1 className="text-5xl font-bold leading-[1.18] tracking-tight xl:text-6xl 2xl:text-[5.8rem]">
            {t.headline}
          </h1>
        </div>

        {/* Intro */}
        <div className="absolute bottom-40 left-20 max-w-[520px] text-left">
          <p className="text-[2.15rem] leading-[1.45] xl:text-[2.35rem]">
            {t.intro}
          </p>

          <p className="mt-6 text-lg text-white/55">{t.comingSoon}</p>
        </div>

        <LoginForm language={language} />

        {/* Footer */}
        <footer className="absolute bottom-6 left-8 right-8 flex items-center justify-between text-[17px] text-white/90">
          <div className="flex gap-8">
            <Link href="/datenschutz">{t.privacy}</Link>
            <Link href="/impressum">{t.imprint}</Link>
            <Link href="/agb">{t.terms}</Link>
            <Link href="/faq">{t.faq}</Link>
          </div>

          <div className="flex items-center gap-6 text-[26px] font-bold">
            <span>f</span>
            <span>in</span>
            <span>x</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
