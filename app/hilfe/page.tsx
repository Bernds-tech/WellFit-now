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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#04343b] via-[#07515b] to-[#02191d] px-6 py-8 text-white">
      <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="absolute bottom-[-12%] right-[-8%] h-[32rem] w-[32rem] rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link href="/dashboard" className="rounded-full border border-cyan-300/20 bg-white/5 px-5 py-3 font-semibold text-cyan-100 hover:bg-white/10">
          ← Zurück
        </Link>
        <Link href="/einstellungen" className="rounded-full border border-cyan-300/20 bg-white/5 px-5 py-3 font-semibold text-cyan-100 hover:bg-white/10">
          Einstellungen
        </Link>
      </div>

      <section className="relative mx-auto mt-10 grid max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.35em] text-cyan-200/80">WellFit Hilfe</p>
          <h1 className="text-5xl font-extrabold leading-tight lg:text-7xl">Rudi Rastlos hilft dir.</h1>
          <p className="mt-6 max-w-3xl text-xl leading-relaxed text-cyan-50/85">
            Hey, ich bin Rudi Rastlos. Ich zeige dir, wie WellFit funktioniert – von deinen ersten Punkten bis zu Missionen, Buddy-Funktionen und Datenschutz.
          </p>
          <div className="mt-8 rounded-[28px] border border-cyan-300/20 bg-black/20 p-6 backdrop-blur-md">
            <p className="text-2xl font-bold text-white">Rudis Tipp:</p>
            <p className="mt-3 text-lg text-white/80">
              Starte zuerst mit deinem Dashboard, aktiviere die nötigen Berechtigungen in den Einstellungen und probiere danach deine erste Mission aus.
            </p>
          </div>
        </div>

        <div className="relative flex min-h-[420px] items-center justify-center">
          <div className="absolute h-80 w-80 animate-pulse rounded-full bg-cyan-300/10 blur-3xl" />
          <div className="rudi-float relative h-[360px] w-[360px] lg:h-[460px] lg:w-[460px]">
            <Image src="/Mascottchen rechts.png" alt="Rudi Rastlos WellFit Mascottchen" fill priority className="object-contain drop-shadow-[0_18px_35px_rgba(0,0,0,0.45)]" />
          </div>
          <div className="rudi-bubble absolute right-2 top-4 max-w-[260px] rounded-[24px] border border-white/20 bg-white/95 px-5 py-4 text-[#053841] shadow-2xl">
            <p className="font-bold">Bereit?</p>
            <p className="text-sm">Ich begleite dich Schritt für Schritt.</p>
          </div>
        </div>
      </section>

      <section className="relative mx-auto mt-12 grid max-w-7xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {helpCards.map((card) => (
          <div key={card.title} className="rounded-[28px] border border-cyan-300/15 bg-[#053841]/80 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-cyan-200">{card.title}</h2>
            <p className="mt-3 text-white/80">{card.text}</p>
          </div>
        ))}
      </section>

      <section className="relative mx-auto mt-10 max-w-7xl rounded-[30px] border border-yellow-300/20 bg-yellow-300/10 p-6 text-yellow-50">
        <h2 className="text-2xl font-bold">Wichtiger Hinweis</h2>
        <p className="mt-3 text-white/85">
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
          50% { transform: translateY(-18px) rotate(1.5deg); }
        }
        @keyframes bubbleBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </main>
  );
}
