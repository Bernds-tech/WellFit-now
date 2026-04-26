import Link from "next/link";

const focusCards = [
  {
    title: "Heute",
    value: "3 Missionen",
    helper: "Spiele die wichtigsten Tagesaufgaben direkt auf dem Handy.",
  },
  {
    title: "Buddy",
    value: "Pflege bereit",
    helper: "Flammi bleibt dein schneller Begleiter für Motivation und Feedback.",
  },
  {
    title: "Analyse",
    value: "Kamera optional",
    helper: "Kamera, Pose-Tracking und AR starten nur nach aktiver Zustimmung.",
  },
];

const quickActions = [
  {
    label: "Mission spielen",
    description: "Öffnet die mobile Missions-Testansicht ohne Desktop-Dashboard.",
    href: "/mobile/missionen",
    badge: "Start",
  },
  {
    label: "Flammi füttern",
    description: "Öffnet den mobilen KI-Buddy für schnelle Pflege.",
    href: "/mobile/buddy",
    badge: "Buddy",
  },
  {
    label: "Nutzer analysieren",
    description: "Kamera-, Pose- und Face-Tracking für Phase 2.",
    href: "/mobile/analyse",
    badge: "Kamera",
  },
  {
    label: "Bewegung testen",
    description: "Testet grobe Aktivität über Handy-Bewegungssensoren.",
    href: "/mobile/bewegung",
    badge: "Sensor",
  },
  {
    label: "AR starten",
    description: "Öffnet den AR-Testmodus mit Kamera und Flammi-Overlay.",
    href: "/mobile/ar",
    badge: "AR",
  },
];

const bottomTabs = [
  { label: "Missionen", icon: "🎯", href: "/mobile/missionen", active: true },
  { label: "Buddy", icon: "🐉", href: "/mobile/buddy", active: false },
  { label: "Analyse", icon: "📷", href: "/mobile/analyse", active: false },
  { label: "Setup", icon: "⚙️", href: "/mobile/einstellungen", active: false },
];

export default function MobileHomePage() {
  return (
    <main className="min-h-screen overflow-y-auto bg-gradient-to-br from-[#00aabe] to-[#00505a] pb-28 text-white">
      <header className="rounded-b-[34px] bg-[#04343b] px-5 pb-6 pt-5 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
        <p className="text-xs font-black uppercase tracking-[0.26em] text-cyan-100/60">WellFit Mobile</p>
        <h1 className="mt-2 text-4xl font-black leading-none text-white">Heute aktiv</h1>
        <p className="mt-2 text-sm leading-relaxed text-cyan-100/75">
          Handy-Fokus: Missionen spielen, Buddy pflegen, Nutzer analysieren und AR starten.
        </p>
      </header>

      <section className="grid gap-3 px-4 pt-4">
        {focusCards.map((card) => (
          <div key={card.title} className="rounded-[24px] bg-[#053841]/90 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.14)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase tracking-[0.18em] text-cyan-100/55">{card.title}</h2>
              <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-black text-[#042f35]">{card.value}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/72">{card.helper}</p>
          </div>
        ))}
      </section>

      <section className="px-4 pt-4">
        <h2 className="mb-3 text-xl font-black text-cyan-200">Schnellstart</h2>
        <div className="grid gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="block rounded-[24px] bg-[#053841]/90 p-4 shadow-[0_8px_22px_rgba(0,0,0,0.14)] transition active:scale-[0.98]"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-black text-white">{action.label}</h3>
                <span className="rounded-full bg-orange-400 px-3 py-1 text-xs font-black text-[#042f35]">{action.badge}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-white/65">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 pt-4">
        <div className="rounded-[24px] border border-cyan-200/20 bg-[#042f35]/80 p-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-100/55">Produktregel</p>
          <p className="mt-2 text-sm leading-relaxed text-white/72">
            Mobile bleibt bewusst schlank: Missionen, Buddy, Kameraanalyse, Bewegungstest und später AR. Echte Rewards, XP, Punkte, Token, Completion und Anti-Cheat bleiben langfristig serverseitig autorisiert.
          </p>
        </div>
      </section>

      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/10 bg-[#042f35]/95 px-3 py-2 backdrop-blur-md">
        <div className="grid grid-cols-4 gap-2">
          {bottomTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`rounded-2xl px-2 py-2 text-center text-xs font-black ${tab.active ? "bg-orange-400 text-[#042f35]" : "text-white/70"}`}
            >
              <div className="text-lg leading-none">{tab.icon}</div>
              <div className="mt-1">{tab.label}</div>
            </Link>
          ))}
        </div>
      </nav>
    </main>
  );
}
