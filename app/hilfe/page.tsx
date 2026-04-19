"use client";

import Image from "next/image";
import Link from "next/link";

const helpCards = [
  { title: "Erste Schritte", text: "Registrieren, einloggen und dein WellFit-Profil einrichten." },
  { title: "Punkte sammeln", text: "Bewegung, Missionen und später echte Tracking-Daten bringen dir Punkte." },
  { title: "Missionen", text: "Tages-, Wochen-, Abenteuer- und Challenge-Missionen führen dich durch WellFit." },
  { title: "Flammi & KI-Buddy", text: "Dein Buddy begleitet dich, reagiert auf deine Angaben und motiviert dich." },
  { title: "Einstellungen", text: "Profil, Körperdaten, Benachrichtigungen, Privatsphäre und Berechtigungen verwalten." },
  { title: "Datenschutz", text: "Gesundheits-, Bewegungs- und Kameradaten werden nur mit Zustimmung genutzt." },
];

export default function HilfePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#04343b] via-[#07515b] to-[#02191d] px-5 py-6 text-white">
      <div className="absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute bottom-[-12%] right-[-8%] h-96 w-96 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/dashboard" className="rounded-full border border-cyan-300/20 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-white/10">
          ← Zurück
        </Link>
        <Link href="/einstellungen" className="rounded-full border border-cyan-300/20 bg-white/5 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-white/10">
          Einstellungen
        </Link>
      </div>

      <section className="relative mx-auto mt-7 grid max-w-6xl grid-cols-1 items-center gap-7 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-cyan-200/80">WellFit Hilfe</p>
          <h1 className="text-4xl font-extrabold leading-tight lg:text-5xl">Rudi Rastlos hilft dir.</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-cyan-50/85 lg:text-lg">
            Hey, ich bin Rudi Rastlos. Ich zeige dir, wie WellFit funktioniert – von deinen ersten Punkten bis zu Missionen, Buddy-Funktionen und Datenschutz.
          </p>
          <div className="mt-6 rounded-[22px] border border-cyan-300/20 bg-black/20 p-4 backdrop-blur-md">
            <p className="text-xl font-bold text-white">Rudis Tipp:</p>
            <p className="mt-2 text-base text-white/80">
              Starte zuerst mit deinem Dashboard, aktiviere die nötigen Berechtigungen in den Einstellungen und probiere danach deine erste Mission aus.
            </p>
          </div>
        </div>

        <div className="relative flex min-h-[300px] items-center justify-center">
          <div className="absolute h-60 w-60 animate-pulse rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="rudi-float relative h-[250px] w-[250px] lg:h-[320px] lg:w-[320px]">
            <Image src="/mascottchen.png" alt="Rudi Rastlos WellFit Mascottchen" fill priority className="object-contain drop-shadow-[0_14px_28px_rgba(0,0,0,0.45)]" />
          </div>
          <div className="rudi-bubble absolute right-2 top-2 max-w-[210px] rounded-[20px] border border-white/20 bg-white/95 px-4 py-3 text-[#053841] shadow-2xl">
            <p className="text-sm font-bold">Bereit?</p>
            <p className="text-xs">Ich begleite dich Schritt für Schritt.</p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto mt-8 grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {helpCards.map((card) => (
          <div key={card.title} className="rounded-[22px] border border-cyan-300/15 bg-[#053841]/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm">
            <h2 className="text-xl font-bold text-cyan-200">{card.title}</h2>
            <p className="mt-2 text-sm text-white/80">{card.text}</p>
          </div>
        ))}
      </section>

      <section className="relative mx-auto mt-7 max-w-6xl rounded-[24px] border border-yellow-300/20 bg-yellow-300/10 p-4 text-yellow-50">
        <h2 className="text-xl font-bold">Wichtiger Hinweis</h2>
        <p className="mt-2 text-sm text-white/85">
          WellFit motiviert dich zu Bewegung, ersetzt aber keine medizinische Beratung. Bei Schmerzen, Beschwerden oder Unsicherheit wende dich bitte an medizinisches Fachpersonal.
        </p>
      </section>

      <style jsx>{`
        .rudi-float {
          animation: rudiFloat 3.4s ease-in-out infinite;
        }
        .rudi-bubble {
          animation: bubbleBounce 2.6s ease-in-out infinite;
        }
        @keyframes rudiFloat {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-14px) rotate(1.5deg); }
        }
        @keyframes bubbleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </main>
  );
}
