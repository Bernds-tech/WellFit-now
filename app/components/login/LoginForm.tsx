"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginContent, Language } from "./loginContent";

export default function LoginForm({ language }: { language: Language }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const t = loginContent[language];

  const handleLogin = () => {
    router.push("/dashboard");
  };

  return (
    <div className="absolute right-24 top-[39%] w-[500px] rounded-[22px] bg-white/5 p-5">
      <p className="mb-4 text-[22px] leading-snug text-white">{t.loginTitle}</p>

      <input
        type="email"
        placeholder={t.emailPlaceholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-3 h-[56px] w-full rounded-xl bg-white px-5 text-[17px] text-gray-700 outline-none"
      />

      <div className="relative mb-3">
        <input
          type={showPassword ? "text" : "password"}
          placeholder={t.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="h-[56px] w-full rounded-xl bg-white px-5 pr-14 text-[17px] text-gray-700 outline-none"
        />

        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-gray-500"
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>

      <button
        onClick={handleLogin}
        className="h-[58px] w-full rounded-xl bg-[#156fd1] text-[20px] font-bold transition hover:bg-[#0f63bb]"
      >
        {t.loginButton}
      </button>
    </div>
  );
}
