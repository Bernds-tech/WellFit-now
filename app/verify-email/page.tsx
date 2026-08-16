"use client";

import Link from "next/link";
import { sendEmailVerification } from "firebase/auth";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { establishWebSession } from "@/lib/auth/webSessionClient";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Bitte bestätige deine E-Mail-Adresse über den Link in deinem Postfach.");
  const check = async () => {
    const user = auth.currentUser;
    if (!user) return window.location.assign("/login");
    await user.reload();
    const result = await establishWebSession(user);
    if (result.ok) window.location.assign(result.redirectTo || "/dashboard");
    else setMessage("Die Adresse ist noch nicht bestätigt. Öffne den Link in der E-Mail und versuche es erneut.");
  };
  const resend = async () => {
    if (!auth.currentUser) return window.location.assign("/login");
    await sendEmailVerification(auth.currentUser);
    setMessage("Eine neue Bestätigungs-E-Mail wurde versendet.");
  };
  return <main className="flex min-h-screen items-center justify-center bg-[#063f46] px-5 text-white"><section className="w-full max-w-lg rounded-3xl border border-white/15 bg-white/10 p-8 text-center"><h1 className="text-3xl font-black">E-Mail bestätigen</h1><p className="mt-4 text-white/80">{message}</p><div className="mt-7 grid gap-3"><button onClick={check} className="rounded-xl bg-cyan-300 px-5 py-3 font-black text-[#063f46]">Bestätigung prüfen</button><button onClick={resend} className="rounded-xl border border-white/25 px-5 py-3 font-bold">E-Mail erneut senden</button><Link href="/login" className="text-sm text-cyan-100 underline">Zurück zum Login</Link></div></section></main>;
}
