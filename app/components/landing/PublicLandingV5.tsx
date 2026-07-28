import Image from "next/image";
import Link from "next/link";
import LandingHeroV5 from "./LandingHeroV5";
import LandingSectionsV5 from "./LandingSectionsV5";
import LandingSessionRedirect from "./LandingSessionRedirect";
import { navItems } from "./landingPublicData";

export default function PublicLandingV5() {
  return (
    <main className="landing-page h-screen overflow-y-auto scroll-smooth bg-[#020b0f] text-white">
      <LandingSessionRedirect />

      <header className="sticky top-0 z-50 border-b border-cyan-300/12 bg-[#020d12]/94 backdrop-blur-2xl">
        <div className="mx-auto flex h-[78px] max-w-[1500px] items-center justify-between gap-5 px-5 lg:px-10">
          <Link href="/" aria-label="WellFit Startseite" className="relative h-[68px] w-[132px] shrink-0">
            <Image src="/logo.png" alt="WellFit" fill priority sizes="132px" className="object-contain object-left" />
          </Link>
          <nav aria-label="Hauptnavigation" className="hidden items-center gap-9 xl:flex">
            {navItems.map(([label, href]) => (
              <a key={href} href={href} className="text-[13px] font-semibold text-white/72 transition hover:text-white">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2.5">
            <span className="hidden rounded-xl border border-white/10 bg-black/10 px-3.5 py-2.5 text-xs text-white/65 sm:block">
              DE⌄
            </span>
            <Link
              href="/login"
              className="rounded-xl border border-cyan-300/45 px-5 py-2.5 text-sm font-bold text-cyan-50 transition hover:bg-cyan-300/10"
            >
              Anmelden
            </Link>
            <Link
              href="/register"
              className="hidden rounded-xl bg-gradient-to-r from-[#ff8a16] to-[#ffd95d] px-6 py-3 text-sm font-black text-[#182006] shadow-[0_12px_30px_rgba(255,153,30,.24)] transition hover:-translate-y-0.5 sm:block"
            >
              Kostenlos starten
            </Link>
          </div>
        </div>
      </header>

      <LandingHeroV5 />
      <LandingSectionsV5 />

      <section className="bg-[#020b0f] px-5 py-10 lg:px-10">
        <div className="mx-auto flex max-w-[1420px] flex-col items-center justify-between gap-6 rounded-[26px] border border-[#ffad2f]/24 bg-gradient-to-r from-[#092b32] via-[#07313a] to-[#19281f] p-7 text-center shadow-[0_20px_50px_rgba(0,0,0,.25)] lg:flex-row lg:text-left">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#ffd95d]">Dein erstes Abenteuer wartet</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-.03em] sm:text-3xl">
              Bewegung, die sich nach Fortschritt anfühlt.
            </h2>
          </div>
          <Link
            href="/register"
            className="shrink-0 rounded-xl bg-gradient-to-r from-[#ff8c1d] to-[#ffd95d] px-7 py-4 text-base font-black text-[#172006] shadow-[0_14px_30px_rgba(255,153,30,.22)]"
          >
            Jetzt WellFit starten →
          </Link>
        </div>
      </section>

      <footer className="border-t border-white/8 bg-[#01080b] px-5 py-6 lg:px-10">
        <div className="mx-auto flex max-w-[1420px] flex-col items-center justify-between gap-4 text-xs text-white/42 sm:flex-row">
          <p>© WellFit · Earn Wellness</p>
          <div className="flex flex-wrap justify-center gap-5">
            <Link href="/datenschutz">Datenschutz</Link>
            <Link href="/impressum">Impressum</Link>
            <Link href="/agb">AGB</Link>
            <Link href="/hilfe">Hilfe</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
