"use client";

/* eslint-disable @next/next/no-img-element */

import PrimaryButton from "@/app/components/PrimaryButton";
import { Language, RegistrationCompletion } from "../registerTypes";
import { getRegisterContent } from "../registerContent";

type Props = {
  language: Language;
  buddyName: string;
  buddyFile: string;
  isCreating?: boolean;
  completion: RegistrationCompletion;
  onFinish: () => void;
  onContinue: () => void;
};

export default function Step4Awakening({
  language,
  buddyName,
  buddyFile,
  isCreating = false,
  completion,
  onFinish,
  onContinue,
}: Props) {
  const t = getRegisterContent(language);
  const title = completion.completed
    ? language === "de" ? "Dein WellFit-Konto ist sicher eingerichtet" : "Your WellFit account is securely initialized"
    : t.awakenTitle;
  const text = completion.completed
    ? completion.serverMessage
    : language === "de"
      ? "Dein Konto, deine lokale Zeitzone, deine Einwilligungen und dein Buddy werden jetzt serverseitig angelegt. Dabei werden keine Punkte, Token oder Echtgeldwerte erzeugt."
      : "Your account, local time zone, consent decisions and buddy will now be initialized by the server. No points, tokens or real-money value are created.";

  return (
    <section className="absolute inset-x-5 bottom-5 top-20 grid place-items-center overflow-y-auto px-2 sm:inset-x-8 sm:bottom-8 sm:top-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/15 blur-3xl" />
      <div className="pointer-events-none absolute left-[18%] top-[24%] h-56 w-56 rounded-full bg-emerald-300/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[14%] right-[16%] h-64 w-64 rounded-full bg-sky-300/15 blur-3xl" />

      <div className="relative w-full max-w-[980px] overflow-hidden rounded-[34px] border border-white/20 bg-white/10 p-5 text-white shadow-[0_24px_70px_rgba(0,0,0,0.28)] backdrop-blur-md sm:rounded-[40px] sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" />

        <div className="relative grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-cyan-100/70">Phase 04 | Server Setup</div>
            <div className="relative grid h-64 w-64 place-items-center rounded-full border border-white/20 bg-cyan-100/10 shadow-[0_0_70px_rgba(103,232,249,0.25)] sm:h-72 sm:w-72">
              <div className="absolute h-56 w-56 rounded-full border border-cyan-200/20 sm:h-60 sm:w-60" />
              <div className="absolute h-40 w-40 rounded-full border border-emerald-200/20 sm:h-44 sm:w-44" />
              <img src={`/buddy/${buddyFile}`} alt={buddyName} className="relative max-h-[235px] max-w-[235px] object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.32)] sm:max-h-[265px] sm:max-w-[265px]" />
            </div>
            <h2 className="mt-5 text-4xl font-black text-cyan-100 drop-shadow-[0_0_18px_rgba(103,232,249,0.25)] sm:text-5xl">{buddyName.toUpperCase()}</h2>
            <p className="mt-2 text-sm text-white/65">
              {completion.completed
                ? language === "de" ? "Serverseitig angelegt und bereit." : "Initialized by the server and ready."
                : language === "de" ? "Bereit für die sichere Einrichtung." : "Ready for secure initialization."}
            </p>
          </div>

          <div className="flex flex-col justify-center">
            <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl">{title}</h1>
            <p className="mt-4 text-base leading-relaxed text-white/80">{text}</p>

            <div className="mt-6 grid gap-3 text-sm text-white/85">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">✓ {language === "de" ? "Geburtsdatum wird nur zur Altersprüfung verarbeitet und nicht gespeichert." : "Birth date is processed only for age verification and is not stored."}</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">✓ {language === "de" ? "AGB, Datenschutz und freiwillige Einwilligungen werden getrennt dokumentiert." : "Terms, privacy and optional consent decisions are recorded separately."}</div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">✓ {language === "de" ? "Buddy, Zeitzone und Profil werden durch den Server autorisiert." : "Buddy, time zone and profile are authorized by the server."}</div>
            </div>

            <div className="mt-6 rounded-[28px] border border-cyan-200/20 bg-cyan-200/10 p-5 shadow-[0_0_28px_rgba(103,232,249,0.12)]">
              <div className="mb-2 flex items-center justify-between gap-3">
                <h3 className="text-xl font-black text-cyan-100">
                  {completion.completed ? "✓ " : "🔐 "}
                  {language === "de" ? "Closed-Beta Konto" : "Closed Beta account"}
                </h3>
                <span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-black text-[#053841]">
                  {completion.completed ? "SERVER OK" : "NO REWARD"}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-white/75">
                {completion.completed
                  ? completion.emailVerificationSent
                    ? language === "de" ? "Wir haben eine Bestätigungs-E-Mail versendet. Prüfe bitte auch deinen Spam-Ordner." : "A verification email was sent. Please also check your spam folder."
                    : language === "de" ? "Das Konto wurde angelegt. Die E-Mail-Verifikation kann später erneut ausgelöst werden." : "The account is initialized. Email verification can be requested again later."
                  : language === "de" ? "Die Einrichtung vergibt keine automatischen XP, WFXP, Token, NFTs oder Geldwerte." : "Initialization grants no automatic XP, WFXP, tokens, NFTs or monetary value."}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-white/80">
                <div className="rounded-2xl bg-black/20 px-3 py-2"><div className="font-black text-cyan-100">01</div><div>{language === "de" ? "Einwilligung" : "Consent"}</div></div>
                <div className="rounded-2xl bg-black/20 px-3 py-2"><div className="font-black text-cyan-100">02</div><div>{language === "de" ? "Zeitzone" : "Time zone"}</div></div>
                <div className="rounded-2xl bg-black/20 px-3 py-2"><div className="font-black text-cyan-100">03</div><div>Buddy</div></div>
              </div>
            </div>

            <div className="mt-6">
              <PrimaryButton onClick={completion.completed ? onContinue : onFinish}>
                {completion.completed
                  ? language === "de" ? "Zum Dashboard" : "Open dashboard"
                  : isCreating
                    ? language === "de" ? "Konto wird eingerichtet …" : "Initializing account …"
                    : language === "de" ? "Konto sicher anlegen" : "Securely create account"}
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
