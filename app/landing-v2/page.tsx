const processSteps = [
  {
    number: "01",
    title: "Kontakt erfassen",
    cardTitle: "Neuer Kontakt",
    accent: "from-cyan-300 to-blue-500",
    detail: "Name, Anlass und Fan-Interesse sauber anlegen.",
    preview: ["Max Berger", "VIP-Anfrage", "Basketball · Familie"],
  },
  {
    number: "02",
    title: "Fan-Gedächtnis aufbauen",
    cardTitle: "Fan-Gedächtnis",
    accent: "from-blue-300 to-violet-500",
    detail: "Vorlieben, Historie und wichtige Momente behalten.",
    preview: ["Lieblingsblock A7", "Letzter Kauf: Trikot", "Geburtstag im Juli"],
  },
  {
    number: "03",
    title: "KI-Antwort erhalten",
    cardTitle: "KI-Antwortvorschläge",
    accent: "from-violet-300 to-fuchsia-500",
    detail: "Passende Formulierungen als geprüfte Vorschläge nutzen.",
    preview: ["Persönlich", "Kurz & freundlich", "Mensch prüft und gibt frei"],
  },
  {
    number: "04",
    title: "Follow-up planen",
    cardTitle: "Follow-up planen",
    accent: "from-fuchsia-300 to-rose-500",
    detail: "Nächste Schritte rechtzeitig vorbereiten.",
    preview: ["Reminder morgen", "Ticket-Option senden", "Freigabe offen"],
  },
  {
    number: "05",
    title: "Kampagne starten",
    cardTitle: "Sommer-Event Early Bird",
    accent: "from-amber-200 to-lime-400",
    detail: "Aktionen segmentieren, prüfen und kontrolliert aktivieren.",
    preview: ["Zielgruppe: Familien", "Early-Bird-Angebot", "Start nach Freigabe"],
  },
  {
    number: "06",
    title: "Analytics messen",
    cardTitle: "Performance-Überblick",
    accent: "from-lime-300 to-emerald-400",
    detail: "Conversion, Aktivität und Wirkung messbar machen.",
    preview: ["42 % Öffnungen", "+18 % Conversion", "Top-Segment erkannt"],
  },
];

const benefits = [
  {
    title: "Stärkere Beziehungen",
    text: "Jede Interaktion fühlt sich persönlicher an, weil Kontext und Historie sichtbar bleiben.",
  },
  {
    title: "Weniger Aufwand",
    text: "FanMind bündelt Kontakte, Vorschläge und nächste Schritte in einem klaren Arbeitsfluss.",
  },
  {
    title: "Höhere Conversion",
    text: "Relevante Botschaften erreichen Fans im richtigen Moment und werden nachvollziehbar messbar.",
  },
  {
    title: "Volle Kontrolle",
    text: "KI bleibt unterstützend: Menschen prüfen, entscheiden und geben Kommunikation frei.",
  },
];

function MiniSignal({ className = "" }: { className?: string }) {
  return <span className={`absolute h-24 w-24 rounded-full blur-3xl ${className}`} aria-hidden="true" />;
}

export default function LandingV2Page() {
  return (
    <main className="min-h-screen overflow-y-auto bg-[#050816] text-white">
      <section className="relative isolate overflow-hidden px-6 py-20 sm:px-10 lg:px-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.22),transparent_34%),radial-gradient(circle_at_80%_18%,rgba(168,85,247,0.2),transparent_30%),linear-gradient(135deg,#050816_0%,#07122a_52%,#05110f_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        <MiniSignal className="left-8 top-24 bg-cyan-400/20" />
        <MiniSignal className="right-10 top-40 bg-violet-500/20" />

        <div className="mx-auto max-w-7xl">
          <div className="mb-14 max-w-3xl">
            <div className="mb-6 inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.22)]">
              FanMind Landing V2
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              Premium Fan-CRM für Clubs, Creator und Events.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Diese Vorschau bewahrt die Landing-Struktur und zeigt unterhalb des Produkt-Showcase den neuen Prozessabschnitt.
            </p>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {[
              "Abschnitt 1 · Hero",
              "Abschnitt 2 · Vertrauen",
              "Abschnitt 3 · Produkt-Showcase",
            ].map((label) => (
              <div key={label} className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">{label}</p>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Bestehender Landing-Bereich bleibt oberhalb des neuen Abschnitts positioniert.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden border-t border-white/10 bg-[#060917] px-6 py-24 sm:px-10 lg:px-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_10%_15%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_50%_8%,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_92%_18%,rgba(34,197,94,0.16),transparent_24%),linear-gradient(180deg,rgba(8,13,35,0.96),rgba(2,6,23,1))]" />
        <div className="absolute inset-x-8 top-12 -z-10 h-px bg-gradient-to-r from-transparent via-cyan-300/50 to-transparent" />
        <MiniSignal className="left-1/4 top-20 bg-blue-500/20" />
        <MiniSignal className="right-1/4 bottom-16 bg-emerald-400/20" />

        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/30 bg-white/[0.06] px-5 py-2 text-sm font-bold uppercase tracking-[0.26em] text-cyan-100 shadow-[0_0_36px_rgba(34,211,238,0.24)] backdrop-blur-xl">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,0.95)]" />
              FanMind in 6 Schritten
            </div>
            <h2 className="mt-8 text-3xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Von der ersten Anfrage bis zur messbaren Conversion.
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
              FanMind verbindet Kontakte, KI und Aktionen in einem System – damit du Beziehungen aufbaust, rechtzeitig reagierst und Ergebnisse messbar machst.
            </p>
          </div>

          <div className="relative mt-20">
            <div className="absolute left-0 right-0 top-7 hidden h-[2px] bg-gradient-to-r from-cyan-300/10 via-cyan-200/90 to-emerald-300/10 shadow-[0_0_26px_rgba(34,211,238,0.55)] lg:block" />
            <div className="grid gap-6 lg:grid-cols-6">
              {processSteps.map((step, index) => (
                <article key={step.number} className="group relative">
                  {index < processSteps.length - 1 ? (
                    <div className="absolute -right-5 top-[6.6rem] hidden text-cyan-200/70 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)] lg:block" aria-hidden="true">
                      →
                    </div>
                  ) : null}
                  <div className="relative z-10 mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-slate-950 text-sm font-black text-white shadow-[0_0_32px_rgba(34,211,238,0.35)]">
                    <span className={`absolute inset-0 rounded-full bg-gradient-to-br ${step.accent} opacity-70 blur-md transition duration-300 group-hover:opacity-100`} />
                    <span className="relative">{step.number}</span>
                  </div>
                  <h3 className="mt-5 min-h-12 text-center text-sm font-bold leading-6 text-slate-100">{step.title}</h3>

                  <div className="mt-5 min-h-72 rounded-[1.8rem] border border-white/10 bg-white/[0.07] p-4 shadow-[0_22px_70px_rgba(0,0,0,0.38)] backdrop-blur-2xl transition duration-300 group-hover:-translate-y-1 group-hover:border-cyan-200/35 group-hover:shadow-[0_24px_80px_rgba(34,211,238,0.18)]">
                    <div className={`mb-4 h-1.5 rounded-full bg-gradient-to-r ${step.accent} shadow-[0_0_20px_rgba(34,211,238,0.4)]`} />
                    <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                      <p className="text-sm font-extrabold text-white">{step.cardTitle}</p>
                      <p className="mt-2 text-xs leading-5 text-slate-400">{step.detail}</p>
                    </div>
                    <div className="mt-4 space-y-2">
                      {step.preview.map((item) => (
                        <div key={item} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-slate-200">
                          <span className={`h-2 w-2 shrink-0 rounded-full bg-gradient-to-r ${step.accent} shadow-[0_0_12px_rgba(34,211,238,0.65)]`} />
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-20 max-w-4xl rounded-[2rem] border border-cyan-200/20 bg-gradient-to-r from-cyan-300/10 via-violet-400/10 to-emerald-300/10 p-8 text-center shadow-[0_0_70px_rgba(34,211,238,0.16)] backdrop-blur-2xl">
            <p className="text-2xl font-black tracking-tight sm:text-3xl">Ein System für Beziehungen, Aktionen und Ergebnisse.</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="rounded-[1.6rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
                <div className="mb-4 h-10 w-10 rounded-2xl bg-gradient-to-br from-cyan-300 via-violet-400 to-emerald-300 shadow-[0_0_28px_rgba(34,211,238,0.28)]" />
                <h3 className="text-lg font-extrabold text-white">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{benefit.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
